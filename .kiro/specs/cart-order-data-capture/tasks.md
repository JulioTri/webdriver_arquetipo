# Plan de Implementación: Captura de Datos del Pedido en el Carrito

## Visión General

Implementación incremental de dos nuevas Interactions (`CaptureOrderData` y `UpdateOrderData`) para capturar datos completos del pedido durante el flujo de checkout, integrándolas en `HomeTask`. Se agregan selectores `PageElements` en `HomeUI`, interfaces TypeScript para el modelo de datos, y tests basados en propiedades con fast-check.

## Tareas

- [x] 1. Agregar selectores PageElements en HomeUI y definir interfaces de datos
  - [x] 1.1 Agregar constantes XPath y métodos estáticos de colección en HomeUI
    - Agregar las constantes `CART_PRODUCT_ITEMS`, `DELIVERY_DETAIL_ITEMS` y `PAYMENT_TOTAL_ITEMS` en la sección de selectores de `features/Dislicores/UI/Home/HomeUI.ts`
    - Agregar `import { PageElements }` junto al import existente de `PageElement`
    - Agregar los métodos estáticos `cartProductItems()`, `deliveryDetailItems()` y `paymentTotalItems()` que retornen `PageElements.located(By.xpath(...))` con sus respectivas descripciones en español
    - _Requerimientos: 1.1, 1.3, 1.4_

  - [x] 1.2 Crear interfaces TypeScript para el modelo de datos del pedido
    - Crear el archivo `features/Dislicores/shared/Interactions/OrderDataTypes.ts`
    - Definir las interfaces `ProductoItem { texto: string }`, `DetalleItem { texto: string }` y `OrderData { productos: ProductoItem[], detalleEntrega: DetalleItem[], detallePago: DetalleItem[], total: string | null, numeroPedido: string | null }`
    - Exportar todas las interfaces para uso en `CaptureOrderData` y `UpdateOrderData`
    - _Requerimientos: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Implementar la Interaction CaptureOrderData
  - [x] 2.1 Crear la clase CaptureOrderData
    - Crear el archivo `features/Dislicores/shared/Interactions/CaptureOrderData.ts`
    - Implementar la clase `CaptureOrderData` que extienda `Interaction` de `@serenity-js/core`
    - Implementar el método estático `fromCart()` que retorne una nueva instancia
    - En `performAs(actor)`: usar `Text.ofAll(HomeUI.cartProductItems()).answeredBy(actor)` para extraer textos de productos, `Text.ofAll(HomeUI.deliveryDetailItems()).answeredBy(actor)` para detalle de entrega, y `Text.ofAll(HomeUI.paymentTotalItems()).answeredBy(actor)` para detalle de pago
    - Mapear cada `string[]` a arreglos de objetos `{ texto: string }` usando las interfaces de `OrderDataTypes`
    - Construir el objeto `OrderData` con `total: null` y `numeroPedido: null`
    - Generar nombre de archivo con timestamp: `pedido_YYYY-MM-DDTHH-mm-ss.json` (reemplazando `:` por `-`)
    - Resolver ruta con `resolvePathFromProject` y crear directorio recursivamente si no existe con `fs.mkdirSync`
    - Escribir el JSON con `fs.writeFileSync` usando indentación de 2 espacios y codificación UTF-8
    - Si `Text.ofAll` retorna arreglo vacío para cualquier sección, registrar `[]` sin lanzar error
    - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 5.5, 5.6, 5.7_

  - [ ]* 2.2 Escribir test de propiedad para estructuración de texto a objetos
    - **Propiedad 1: Estructuración de texto a objetos**
    - Usar `fc.array(fc.string())` para generar arreglos de strings aleatorios
    - Verificar que al mapear cada string a `{ texto: string }`, la longitud del resultado es igual a la entrada y cada `texto` coincide con el string original
    - Mínimo 100 iteraciones
    - Tag: `Feature: cart-order-data-capture, Property 1: Estructuración de texto a objetos`
    - **Valida: Requerimientos 2.3, 2.5, 2.7**

  - [ ]* 2.3 Escribir test de propiedad para round-trip de serialización JSON
    - **Propiedad 2: Round-trip de serialización JSON**
    - Usar `fc.record` con `fc.array(fc.record({ texto: fc.fullUnicodeString() }))` para generar objetos `OrderData` con caracteres Unicode (tildes, eñes, emojis)
    - Verificar que `JSON.parse(JSON.stringify(data, null, 2))` produce un objeto equivalente al original
    - Mínimo 100 iteraciones
    - Tag: `Feature: cart-order-data-capture, Property 2: Round-trip de serialización JSON`
    - **Valida: Requerimientos 2.8, 5.6**

  - [ ]* 2.4 Escribir test de propiedad para invariante de esquema JSON
    - **Propiedad 3: Invariante de esquema JSON**
    - Usar `fc.record` con arreglos de longitud variable (0..N) para productos, detalle de entrega y detalle de pago
    - Verificar que el JSON generado siempre contiene exactamente las claves `productos`, `detalleEntrega`, `detallePago`, `total` y `numeroPedido`, y que cada ítem tiene el campo `texto` de tipo string
    - Mínimo 100 iteraciones
    - Tag: `Feature: cart-order-data-capture, Property 3: Invariante de esquema JSON`
    - **Valida: Requerimientos 5.1, 5.2, 5.3, 5.4, 2.11, 2.12, 2.13**

  - [x] 2.5 Escribir test de propiedad para patrón de nombre de archivo con timestamp
    - **Propiedad 5: Patrón de nombre de archivo con timestamp**
    - Usar `fc.date()` para generar fechas aleatorias
    - Verificar que el nombre generado coincide con la regex `/^pedido_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/` y no contiene el carácter `:`
    - Mínimo 100 iteraciones
    - Tag: `Feature: cart-order-data-capture, Property 5: Patrón de nombre de archivo con timestamp`
    - **Valida: Requerimiento 5.7**

- [x] 3. Checkpoint — Verificar CaptureOrderData y selectores
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 4. Implementar la Interaction UpdateOrderData
  - [x] 4.1 Crear la clase UpdateOrderData
    - Crear el archivo `features/Dislicores/shared/Interactions/UpdateOrderData.ts`
    - Implementar la clase `UpdateOrderData` que extienda `Interaction` de `@serenity-js/core`
    - Implementar el método estático `withOrderDetails()` que retorne una nueva instancia
    - En `performAs(actor)`: buscar el archivo `pedido_*.json` más reciente en `features/Dislicores/Data/orders/` usando `fs.readdirSync` y filtrado por patrón `pedido_*.json`
    - Usar `Text.of(HomeUI.orderNumberCreated()).answeredBy(actor)` para extraer el texto del número de pedido
    - Leer el JSON existente, actualizar los campos `numeroPedido` (parseando el número del texto) y `total` (texto completo extraído)
    - Reescribir el archivo JSON actualizado con indentación de 2 espacios y UTF-8
    - Si no existe archivo previo, crear uno nuevo con estructura `OrderData` usando los datos disponibles y arreglos vacíos para productos, entrega y pago
    - Si el archivo JSON está corrupto, sobrescribirlo con los datos disponibles
    - _Requerimientos: 4.1, 4.2, 4.3, 4.4, 5.1, 5.5, 5.6_

  - [ ]* 4.2 Escribir test de propiedad para actualización que preserva datos existentes
    - **Propiedad 4: Actualización preserva datos existentes y agrega nuevos campos**
    - Usar `fc.record` para generar datos existentes de productos, detalle de entrega y detalle de pago, y `fc.string()` para número de pedido y total
    - Verificar que tras la actualización, los datos originales de productos, detalle de entrega y detalle de pago permanecen intactos, y los campos `numeroPedido` y `total` contienen los nuevos valores
    - Mínimo 100 iteraciones
    - Tag: `Feature: cart-order-data-capture, Property 4: Actualización preserva datos existentes y agrega nuevos campos`
    - **Valida: Requerimientos 4.1, 4.2**

- [x] 5. Integrar Interactions en HomeTasks
  - [x] 5.1 Integrar CaptureOrderData en HomeTask.checkout()
    - En `features/Dislicores/Tasks/Home/HomeTasks.ts`, agregar el import de `CaptureOrderData`
    - Insertar `CaptureOrderData.fromCart()` en el método `checkout()` después de `EnsureMinimumOrderIsMet.using(...)` y antes del `Wait.upTo(Duration.ofSeconds(20)).until(...)`
    - Mantener el orden existente de todos los demás pasos sin modificaciones
    - _Requerimientos: 3.1, 3.2_

  - [x] 5.2 Integrar UpdateOrderData en HomeTask.validatePayment()
    - En `features/Dislicores/Tasks/Home/HomeTasks.ts`, agregar el import de `UpdateOrderData`
    - Insertar `UpdateOrderData.withOrderDetails()` en el método `validatePayment()` después de `SaveTextToJson.from(HomeUI.orderNumberCreated()).intoOrdersFile()` y antes de `ClickWhenReady.on(HomeUI.continueButtonAfterPayment())`
    - Mantener la funcionalidad existente de `SaveTextToJson` sin eliminarla ni reemplazarla
    - _Requerimientos: 4.1, 4.2, 4.3_

- [x] 6. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requerimientos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de correctitud con fast-check
- El lenguaje de implementación es TypeScript, siguiendo el patrón Screenplay de Serenity/JS v3
