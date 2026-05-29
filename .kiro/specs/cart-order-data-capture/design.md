# Diseño Técnico — Captura de Datos del Pedido en el Carrito

## Visión General

Esta funcionalidad introduce una nueva Interaction (`CaptureOrderData`) en el módulo Dislicores que captura datos completos del pedido durante el flujo de checkout. La Interaction extrae texto de tres secciones del DOM (productos del carrito, detalle de entrega y detalle de pago) usando las APIs nativas de Serenity/JS v3 (`PageElements` + `Text.ofAll`), y persiste la información en un archivo JSON con timestamp único. Posteriormente, en `validatePayment`, una segunda Interaction (`UpdateOrderData`) complementa el JSON con el número de pedido y el total.

### Decisiones de Diseño Clave

1. **Uso de `PageElements` (colección) en lugar de `PageElement` (singular):** Los requerimientos necesitan extraer texto de múltiples elementos DOM. Serenity/JS v3 provee `PageElements.located(By.xpath(...))` para localizar colecciones y `Text.ofAll(...)` para extraer texto de todas ellas como `string[]`. Esto elimina la necesidad de scraping manual con `browser.$$`.

2. **Archivo JSON independiente con timestamp:** Cada ejecución genera un archivo `pedido_YYYY-MM-DDTHH-mm-ss.json` para evitar sobrescritura. Se usa un patrón de nombre determinístico basado en la hora de ejecución.

3. **Dos Interactions separadas (SRP):** `CaptureOrderData` captura datos iniciales durante checkout; `UpdateOrderData` complementa el JSON en validatePayment. Cada una tiene una sola responsabilidad.

4. **Preservación de `SaveTextToJson` existente:** La funcionalidad actual de `SaveTextToJson` en `validatePayment` se mantiene intacta. `UpdateOrderData` se agrega como paso adicional, no como reemplazo.

## Arquitectura

### Flujo de Datos

```mermaid
sequenceDiagram
    participant Actor
    participant HomeTasks as HomeTask
    participant CaptureOD as CaptureOrderData
    participant UpdateOD as UpdateOrderData
    participant DOM as Página Web
    participant FS as Sistema de Archivos

    Note over Actor,FS: Flujo checkout()
    Actor->>HomeTasks: checkout()
    HomeTasks->>HomeTasks: EnsureMinimumOrderIsMet
    HomeTasks->>CaptureOD: CaptureOrderData.fromCart()
    CaptureOD->>DOM: Text.ofAll(cartProductItems)
    DOM-->>CaptureOD: string[] productos
    CaptureOD->>DOM: Text.ofAll(deliveryDetailItems)
    DOM-->>CaptureOD: string[] detalle entrega
    CaptureOD->>DOM: Text.ofAll(paymentTotalItems)
    DOM-->>CaptureOD: string[] detalle pago
    CaptureOD->>FS: Escribe pedido_timestamp.json
    HomeTasks->>HomeTasks: Wait + continueWithPayment

    Note over Actor,FS: Flujo validatePayment()
    Actor->>HomeTasks: validatePayment()
    HomeTasks->>HomeTasks: Wait orderNumberCreated
    HomeTasks->>HomeTasks: SaveTextToJson (existente, sin cambios)
    HomeTasks->>UpdateOD: UpdateOrderData.withOrderDetails()
    UpdateOD->>DOM: Text.of(orderNumberCreated)
    DOM-->>UpdateOD: string número pedido
    UpdateOD->>FS: Actualiza pedido_timestamp.json
    HomeTasks->>HomeTasks: continueButtonAfterPayment
```

### Ubicación de Archivos Nuevos

```
features/Dislicores/
├── shared/
│   └── Interactions/
│       ├── SaveTextToJson.ts          # Existente (sin cambios)
│       ├── CaptureOrderData.ts        # NUEVO
│       └── UpdateOrderData.ts         # NUEVO
├── UI/
│   └── Home/
│       └── HomeUI.ts                  # Modificado (nuevos selectores PageElements)
├── Tasks/
│   └── Home/
│       └── HomeTasks.ts               # Modificado (integración en checkout y validatePayment)
└── Data/
    └── orders/
        ├── orders.json                # Existente (sin cambios)
        └── pedido_2025-07-15T10-30-00.json  # Ejemplo de archivo generado
```

## Componentes e Interfaces

### 1. HomeUI — Nuevos Selectores (PageElements)

Se agregan tres nuevos métodos estáticos a `HomeUI` que retornan `PageElements` (colección) en lugar de `PageElement` (singular). Esto es necesario porque cada XPath apunta a múltiples elementos del DOM.

```typescript
import { By, PageElement, PageElements } from '@serenity-js/web';

// Nuevos selectores de colección
static cartProductItems = () =>
    PageElements.located(By.xpath(CART_PRODUCT_ITEMS))
        .describedAs('ítems de productos en el carrito');

static deliveryDetailItems = () =>
    PageElements.located(By.xpath(DELIVERY_DETAIL_ITEMS))
        .describedAs('ítems de detalle de entrega');

static paymentTotalItems = () =>
    PageElements.located(By.xpath(PAYMENT_TOTAL_ITEMS))
        .describedAs('ítems de detalle de pago');
```

**Constantes XPath nuevas:**
```typescript
const CART_PRODUCT_ITEMS   = "//*[@id='list-products-cart']//div[contains(@class,'item-product-cart_text')]";
const DELIVERY_DETAIL_ITEMS = "//*[@id='card-data-delivery']//div[contains(@class,'card-subsidiary_data_subsidiary')]";
const PAYMENT_TOTAL_ITEMS   = "//*[@id='card-total-pay-cart']//div[contains(@class,'card-total_item')]";
```

### 2. CaptureOrderData — Interaction Nueva

Interaction que extiende `Interaction` de Serenity/JS. Responsable de:
- Extraer texto de los tres contenedores usando `Text.ofAll()`
- Estructurar los datos en el formato JSON definido
- Escribir el archivo con timestamp único

**Interfaz pública:**
```typescript
export class CaptureOrderData extends Interaction {
    static fromCart(): CaptureOrderData;
    performAs(actor: Actor): Promise<void>;
}
```

**Flujo interno de `performAs`:**
1. Usa `Text.ofAll(HomeUI.cartProductItems())` → `string[]` de productos
2. Usa `Text.ofAll(HomeUI.deliveryDetailItems())` → `string[]` de detalle entrega
3. Usa `Text.ofAll(HomeUI.paymentTotalItems())` → `string[]` de detalle pago
4. Mapea cada `string[]` a arreglos de objetos `{ texto: string }`
5. Construye el objeto `OrderData` con `total: null`, `numeroPedido: null`
6. Genera nombre de archivo con timestamp: `pedido_YYYY-MM-DDTHH-mm-ss.json`
7. Resuelve ruta con `resolvePathFromProject` (o crea directorio si no existe)
8. Escribe el JSON con `fs.writeFileSync` (indentación 2 espacios, UTF-8)

**Manejo de colecciones vacías:** Si `Text.ofAll` retorna un arreglo vacío para cualquier sección, se registra un arreglo vacío `[]` en el JSON correspondiente. No se lanza error.

### 3. UpdateOrderData — Interaction Nueva

Interaction que complementa el archivo JSON más reciente con el número de pedido y el total.

**Interfaz pública:**
```typescript
export class UpdateOrderData extends Interaction {
    static withOrderDetails(): UpdateOrderData;
    performAs(actor: Actor): Promise<void>;
}
```

**Flujo interno de `performAs`:**
1. Busca el archivo `pedido_*.json` más reciente en `features/Dislicores/Data/orders/`
2. Usa `Text.of(HomeUI.orderNumberCreated())` → extrae texto del número de pedido
3. Lee el JSON existente, actualiza `numeroPedido` y `total` con los valores extraídos
4. Reescribe el archivo JSON actualizado
5. Si no existe archivo previo, crea uno nuevo con los datos disponibles

### 4. HomeTasks — Modificaciones

**checkout():** Se agrega `CaptureOrderData.fromCart()` después de `EnsureMinimumOrderIsMet` y antes del `Wait`:

```typescript
checkout: () =>
    Task.where(
        '#actor abre el carrito y continúa al pago',
        ClickWhenReady.on(HomeUI.openCar()),
        ClickWhenReady.on(HomeUI.goToPay()),
        EnsureMinimumOrderIsMet.using(
            HomeUI.missingForTheMinimum(),
            HomeUI.differenceForMinimum(),
        ),
        CaptureOrderData.fromCart(),  // NUEVO
        Wait.upTo(Duration.ofSeconds(20)).until(
            HomeUI.continueWithPayment(),
            isVisible(),
        ),
        Scroll.to(HomeUI.continueWithPayment()),
        ClickWhenReady.on(HomeUI.continueWithPayment()),
    ),
```

**validatePayment():** Se agrega `UpdateOrderData.withOrderDetails()` después de `SaveTextToJson` (que se preserva):

```typescript
validatePayment: () =>
    Task.where(
        '#actor valida que el pago fue exitoso',
        Wait.upTo(Duration.ofMilliseconds(50_000)).until(
            HomeUI.orderNumberCreated(),
            isVisible(),
        ),
        SaveTextToJson.from(HomeUI.orderNumberCreated()).intoOrdersFile(), // Existente, sin cambios
        UpdateOrderData.withOrderDetails(),  // NUEVO
        ClickWhenReady.on(HomeUI.continueButtonAfterPayment()),
    ),
```

## Modelos de Datos

### Estructura del Archivo JSON del Pedido

```typescript
interface OrderData {
    productos: ProductoItem[];
    detalleEntrega: DetalleItem[];
    detallePago: DetalleItem[];
    total: string | null;
    numeroPedido: string | null;
}

interface ProductoItem {
    texto: string;
}

interface DetalleItem {
    texto: string;
}
```

### Ejemplo de JSON Generado

**Después de `CaptureOrderData` (checkout):**
```json
{
  "productos": [
    { "texto": "Aguardiente Antioqueño 750ml x1 $25.000" },
    { "texto": "Ron Medellín 375ml x2 $48.000" }
  ],
  "detalleEntrega": [
    { "texto": "Sucursal Centro - Calle 50 #45-12" },
    { "texto": "Horario: Lun-Vie 8am-6pm" }
  ],
  "detallePago": [
    { "texto": "Subtotal: $73.000" },
    { "texto": "Envío: $5.000" },
    { "texto": "Total: $78.000" }
  ],
  "total": null,
  "numeroPedido": null
}
```

**Después de `UpdateOrderData` (validatePayment):**
```json
{
  "productos": [
    { "texto": "Aguardiente Antioqueño 750ml x1 $25.000" },
    { "texto": "Ron Medellín 375ml x2 $48.000" }
  ],
  "detalleEntrega": [
    { "texto": "Sucursal Centro - Calle 50 #45-12" },
    { "texto": "Horario: Lun-Vie 8am-6pm" }
  ],
  "detallePago": [
    { "texto": "Subtotal: $73.000" },
    { "texto": "Envío: $5.000" },
    { "texto": "Total: $78.000" }
  ],
  "total": "Su número de pedido es\n003-PEW-1042\ny la fecha estimada de entrega...",
  "numeroPedido": "003-PEW-1042"
}
```

### Convención de Nombres de Archivo

- Patrón: `pedido_YYYY-MM-DDTHH-mm-ss.json`
- Ejemplo: `pedido_2025-07-15T10-30-00.json`
- Los caracteres `:` del ISO string se reemplazan por `-` para compatibilidad con sistemas de archivos
- Ubicación: `features/Dislicores/Data/orders/`

### Relación con `orders.json` Existente

El archivo `orders.json` existente (usado por `SaveTextToJson`) NO se modifica. Los nuevos archivos `pedido_*.json` coexisten en el mismo directorio `orders/` como registros complementarios con información más detallada.


## Propiedades de Correctitud

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas de un sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de correctitud verificables por máquina.*

### Propiedad 1: Estructuración de texto a objetos

*Para cualquier* arreglo de strings (representando textos extraídos de productos, detalle de entrega o detalle de pago), al estructurarlos en el formato del JSON del pedido, cada string debe aparecer como un objeto `{ texto: string }` en el arreglo correspondiente, y la cantidad de objetos debe ser igual a la cantidad de strings de entrada.

**Valida: Requerimientos 2.3, 2.5, 2.7**

### Propiedad 2: Round-trip de serialización JSON

*Para cualquier* objeto `OrderData` válido (incluyendo strings con caracteres especiales como tildes, eñes y emojis), escribirlo como JSON a disco y luego leerlo y parsearlo debe producir un objeto equivalente al original.

**Valida: Requerimientos 2.8, 5.6**

### Propiedad 3: Invariante de esquema JSON

*Para cualquier* combinación de arreglos de productos (0 o más), arreglos de detalle de entrega (0 o más) y arreglos de detalle de pago (0 o más), el JSON generado siempre debe contener exactamente las claves `productos`, `detalleEntrega`, `detallePago`, `total` y `numeroPedido`, donde cada ítem en los arreglos tiene al menos el campo `texto` de tipo string.

**Valida: Requerimientos 5.1, 5.2, 5.3, 5.4, 2.11, 2.12, 2.13**

### Propiedad 4: Actualización preserva datos existentes y agrega nuevos campos

*Para cualquier* archivo JSON de pedido existente con datos de productos, detalle de entrega y detalle de pago, al actualizarlo con un número de pedido y un total, los datos originales de productos, detalle de entrega y detalle de pago deben permanecer intactos, y los campos `numeroPedido` y `total` deben contener los nuevos valores proporcionados.

**Valida: Requerimientos 4.1, 4.2**

### Propiedad 5: Patrón de nombre de archivo con timestamp

*Para cualquier* fecha/hora válida, el nombre de archivo generado debe coincidir con el patrón `pedido_YYYY-MM-DDTHH-mm-ss.json` y no debe contener caracteres inválidos para sistemas de archivos (como `:`).

**Valida: Requerimiento 5.7**

## Manejo de Errores

### Escenarios de Error y Estrategia

| Escenario | Estrategia | Impacto en el Flujo |
|---|---|---|
| Elementos del carrito no encontrados (XPath no coincide) | `Text.ofAll` retorna `[]` → se registra arreglo vacío | El flujo continúa normalmente |
| Elementos de detalle de entrega no encontrados | `Text.ofAll` retorna `[]` → se registra arreglo vacío | El flujo continúa normalmente |
| Elementos de detalle de pago no encontrados | `Text.ofAll` retorna `[]` → se registra arreglo vacío | El flujo continúa normalmente |
| Directorio `orders/` no existe | `fs.mkdirSync` con `{ recursive: true }` crea la ruta | El flujo continúa normalmente |
| Error de escritura en disco (permisos, disco lleno) | Se propaga el error → el test falla con mensaje descriptivo | El test se marca como fallido |
| Archivo JSON no existe al momento de `UpdateOrderData` | Se crea un nuevo archivo con los datos disponibles | El flujo continúa normalmente |
| Archivo JSON corrupto al momento de `UpdateOrderData` | Se sobrescribe con los datos disponibles, registrando advertencia | El flujo continúa con datos parciales |

### Principios de Manejo de Errores

1. **No fallar silenciosamente en escritura:** Los errores de I/O se propagan para que el test falle de forma explícita.
2. **Tolerancia a datos vacíos:** La ausencia de elementos en el DOM no es un error — se registran arreglos vacíos.
3. **Creación defensiva de directorios:** Siempre verificar/crear el directorio antes de escribir.

## Estrategia de Testing

### Enfoque Dual: Tests Unitarios + Tests Basados en Propiedades

Esta funcionalidad requiere ambos tipos de tests para cobertura completa:

- **Tests unitarios:** Verifican ejemplos específicos, casos borde y condiciones de error
- **Tests de propiedades:** Verifican propiedades universales con entradas generadas aleatoriamente

Ambos son complementarios y necesarios.

### Librería de Property-Based Testing

Se utilizará **fast-check** (`fc`) como librería de property-based testing para TypeScript. Es la opción más madura y compatible con el ecosistema Node.js/TypeScript del proyecto.

```bash
npm install --save-dev fast-check
```

### Configuración de Tests de Propiedades

- Mínimo **100 iteraciones** por test de propiedad
- Cada test debe referenciar la propiedad del diseño con un comentario tag
- Formato del tag: `Feature: cart-order-data-capture, Property {número}: {texto}`

### Tests Unitarios

Los tests unitarios deben cubrir:

1. **Ejemplos específicos:**
   - Verificar que `HomeUI.cartProductItems()` retorna un `PageElements` con el XPath correcto
   - Verificar que `HomeUI.deliveryDetailItems()` retorna un `PageElements` con el XPath correcto
   - Verificar que `HomeUI.paymentTotalItems()` retorna un `PageElements` con el XPath correcto
   - Verificar que `CaptureOrderData` es instancia de `Interaction`
   - Verificar que el JSON se escribe con indentación de 2 espacios

2. **Casos borde:**
   - Directorio de destino no existe → se crea recursivamente
   - Archivo JSON no existe al momento de `UpdateOrderData` → se crea nuevo
   - Arreglos vacíos para productos, entrega y pago

### Tests de Propiedades

Cada propiedad de correctitud se implementa como UN SOLO test basado en propiedades:

| Propiedad | Generador | Verificación |
|---|---|---|
| P1: Estructuración texto→objetos | `fc.array(fc.string())` para cada sección | Longitud y contenido de `{ texto }` coinciden |
| P2: Round-trip serialización | `fc.record({ productos: fc.array(...), ... })` con strings Unicode | `JSON.parse(JSON.stringify(data))` === data |
| P3: Invariante de esquema | `fc.record` con arreglos de longitud variable (0..N) | Todas las claves presentes, tipos correctos |
| P4: Actualización preserva datos | `fc.record` para datos existentes + `fc.string()` para nuevos campos | Datos originales intactos + nuevos campos presentes |
| P5: Patrón de timestamp | `fc.date()` para generar fechas aleatorias | Regex `/^pedido_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/` coincide |

### Ejemplo de Test de Propiedad

```typescript
import fc from 'fast-check';

// Feature: cart-order-data-capture, Property 1: Estructuración de texto a objetos
test('Para cualquier arreglo de strings, la estructuración produce objetos { texto } equivalentes', () => {
    fc.assert(
        fc.property(fc.array(fc.string()), (textos) => {
            const resultado = textos.map(t => ({ texto: t }));
            expect(resultado).toHaveLength(textos.length);
            resultado.forEach((item, i) => {
                expect(item.texto).toBe(textos[i]);
            });
        }),
        { numRuns: 100 },
    );
});
```
