# Documento de Requerimientos — Captura de Datos del Pedido en el Carrito

## Introducción

Esta funcionalidad agrega un paso de captura de datos al flujo de checkout en `HomeTask`. Después de validar el pedido mínimo (`EnsureMinimumOrderIsMet`) y antes de continuar con el pago, el sistema extraerá la información de los productos presentes en el carrito de compras desde el contenedor `//*[@id='list-products-cart']//div[contains(@class,'item-product-cart_text')]`, la información de detalle de la entrega desde `//*[@id='card-data-delivery']//div[contains(@class,'card-subsidiary_data_subsidiary')]`, y la información de detalle del pago desde `//*[@id='card-total-pay-cart']//div[contains(@class,'card-total_item')]`, almacenando todo en un archivo JSON. Posteriormente, al validar un pago exitoso (`validatePayment`), se complementará el JSON con el número de pedido y el valor total del pedido.

## Glosario

- **CapturaProductosCarrito**: Interaction de Serenity/JS (Screenplay Pattern) responsable de extraer la información de cada producto visible dentro del contenedor del carrito y persistirla en un archivo JSON.
- **HomeTask**: Objeto que agrupa las Tasks del flujo principal de compra en el módulo Dislicores (checkout, pago, validación).
- **HomeUI**: Clase de mapeo de UI (Page Objects) que expone los selectores XPath como `PageElement` para el módulo Dislicores web.
- **ContenedorProductosCarrito**: Elemento del DOM identificado por el XPath `//*[@id='list-products-cart']//div[contains(@class,'item-product-cart_text')]` que contiene la información textual de cada producto en el carrito.
- **ContenedorDetalleEntrega**: Elemento del DOM identificado por el XPath `//*[@id='card-data-delivery']//div[contains(@class,'card-subsidiary_data_subsidiary')]` que contiene la información de detalle de la entrega/sucursal asociada al pedido.
- **ContenedorDetallePago**: Elemento del DOM identificado por el XPath `//*[@id='card-total-pay-cart']//div[contains(@class,'card-total_item')]` que contiene los ítems del desglose de totales del pago del pedido.
- **ArchivoJSONPedido**: Archivo JSON ubicado en `features/Dislicores/Data/orders/` donde se persiste la información capturada del pedido (productos, detalle de entrega, detalle de pago, total, número de pedido).
- **SaveTextToJson**: Interaction existente que guarda texto extraído de un elemento en el archivo de órdenes JSON.
- **EnsureMinimumOrderIsMet**: Interaction existente que valida que el carrito cumple con el monto mínimo de pedido.

## Requerimientos

### Requerimiento 1: Mapeo de selectores de productos del carrito, detalle de entrega y detalle de pago en HomeUI

**Historia de Usuario:** Como ingeniero de automatización, quiero tener selectores definidos en HomeUI para los productos del carrito, el detalle de la entrega y el detalle del pago, para poder extraer la información de cada sección de forma estructurada.

#### Criterios de Aceptación

1. THE HomeUI SHALL exponer un método estático `cartProductItems()` que retorne un selector XPath apuntando a `//*[@id='list-products-cart']//div[contains(@class,'item-product-cart_text')]` como `PageElement`.
2. THE HomeUI SHALL exponer métodos estáticos para los sub-elementos de cada producto del carrito (nombre, cantidad, precio) utilizando selectores XPath relativos al contenedor de cada producto.
3. THE HomeUI SHALL exponer un método estático `deliveryDetailItems()` que retorne un selector XPath apuntando a `//*[@id='card-data-delivery']//div[contains(@class,'card-subsidiary_data_subsidiary')]` como `PageElement`.
4. THE HomeUI SHALL exponer un método estático `paymentTotalItems()` que retorne un selector XPath apuntando a `//*[@id='card-total-pay-cart']//div[contains(@class,'card-total_item')]` como `PageElement`.

---

### Requerimiento 2: Creación de la Interaction CapturaProductosCarrito

**Historia de Usuario:** Como ingeniero de automatización, quiero una Interaction que extraiga la información de todos los productos del carrito, el detalle de la entrega y el detalle del pago, para poder almacenar los datos completos del pedido en un archivo JSON.

#### Criterios de Aceptación

1. THE CapturaProductosCarrito SHALL ser una clase que extienda `Interaction` de Serenity/JS, siguiendo el Screenplay Pattern del proyecto.
2. WHEN el actor ejecute CapturaProductosCarrito, THE CapturaProductosCarrito SHALL localizar todos los elementos que coincidan con el selector del ContenedorProductosCarrito dentro de la página.
3. WHEN se encuentren productos en el carrito, THE CapturaProductosCarrito SHALL extraer el texto de cada elemento producto y estructurarlo en un objeto con los campos disponibles (nombre, cantidad, precio u otros datos visibles).
4. WHEN el actor ejecute CapturaProductosCarrito, THE CapturaProductosCarrito SHALL localizar todos los elementos que coincidan con el selector del ContenedorDetalleEntrega dentro de la página.
5. WHEN se encuentren elementos de detalle de entrega, THE CapturaProductosCarrito SHALL extraer el texto de cada elemento de detalle de entrega y estructurarlo en un arreglo de objetos con el campo `texto` conteniendo la información textual extraída.
6. WHEN el actor ejecute CapturaProductosCarrito, THE CapturaProductosCarrito SHALL localizar todos los elementos que coincidan con el selector del ContenedorDetallePago dentro de la página.
7. WHEN se encuentren elementos de detalle de pago, THE CapturaProductosCarrito SHALL extraer el texto de cada elemento de detalle de pago y estructurarlo en un arreglo de objetos con el campo `texto` conteniendo la información textual extraída.
8. WHEN se haya extraído la información de productos, detalle de entrega y detalle de pago, THE CapturaProductosCarrito SHALL escribir un archivo JSON en la ruta `features/Dislicores/Data/orders/` con la estructura `{ "productos": [...], "detalleEntrega": [...], "detallePago": [...], "total": null, "numeroPedido": null }`.
9. THE CapturaProductosCarrito SHALL utilizar la utilidad `resolvePathFromProject` existente para resolver la ruta del archivo JSON de forma robusta.
10. IF el directorio de destino no existe, THEN THE CapturaProductosCarrito SHALL crear el directorio de forma recursiva antes de escribir el archivo.
11. IF no se encuentran productos en el contenedor del carrito, THEN THE CapturaProductosCarrito SHALL registrar un arreglo vacío de productos en el archivo JSON.
12. IF no se encuentran elementos de detalle de entrega, THEN THE CapturaProductosCarrito SHALL registrar un arreglo vacío de detalle de entrega en el archivo JSON.
13. IF no se encuentran elementos de detalle de pago, THEN THE CapturaProductosCarrito SHALL registrar un arreglo vacío de detalle de pago en el archivo JSON.

---

### Requerimiento 3: Integración de CapturaProductosCarrito en el flujo de checkout

**Historia de Usuario:** Como ingeniero de automatización, quiero que la captura de datos del carrito (productos, detalle de entrega y detalle de pago) se ejecute automáticamente durante el checkout, para que la información completa del pedido quede registrada sin intervención manual.

#### Criterios de Aceptación

1. WHEN el actor ejecute `HomeTask.checkout()`, THE HomeTask SHALL ejecutar CapturaProductosCarrito después de `EnsureMinimumOrderIsMet` y antes del `Wait` por el botón `continueWithPayment`.
2. THE HomeTask SHALL mantener el orden existente de todos los demás pasos del flujo de checkout sin modificaciones.

---

### Requerimiento 4: Complementar el JSON con datos del pedido tras pago exitoso

**Historia de Usuario:** Como ingeniero de automatización, quiero que al validar un pago exitoso se agreguen el número de pedido y el valor total al JSON del pedido, para tener un registro completo de la transacción.

#### Criterios de Aceptación

1. WHEN el actor ejecute `HomeTask.validatePayment()` y el pago sea exitoso, THE HomeTask SHALL actualizar el ArchivoJSONPedido más reciente agregando el número de pedido extraído del elemento `orderNumberCreated`.
2. WHEN el actor ejecute `HomeTask.validatePayment()` y el pago sea exitoso, THE HomeTask SHALL actualizar el ArchivoJSONPedido más reciente agregando el valor total del pedido extraído de la página de confirmación.
3. THE HomeTask SHALL mantener la funcionalidad existente de `SaveTextToJson` en `validatePayment` sin eliminarla ni reemplazarla.
4. IF el ArchivoJSONPedido no existe al momento de actualizar, THEN THE HomeTask SHALL crear un nuevo archivo JSON con los datos disponibles (número de pedido y total).

---

### Requerimiento 5: Estructura y formato del archivo JSON del pedido

**Historia de Usuario:** Como ingeniero de automatización, quiero que el archivo JSON del pedido tenga una estructura clara y consistente que incluya productos, detalle de entrega y detalle de pago, para facilitar su lectura y uso posterior en reportes o validaciones.

#### Criterios de Aceptación

1. THE ArchivoJSONPedido SHALL tener la siguiente estructura base: `{ "productos": [...], "detalleEntrega": [...], "detallePago": [...], "total": string | null, "numeroPedido": string | null }`.
2. THE ArchivoJSONPedido SHALL almacenar cada producto como un objeto con al menos el campo `texto` conteniendo la información textual extraída del elemento del carrito.
3. THE ArchivoJSONPedido SHALL almacenar cada ítem de detalle de entrega como un objeto con al menos el campo `texto` conteniendo la información textual extraída del elemento de detalle de entrega.
4. THE ArchivoJSONPedido SHALL almacenar cada ítem de detalle de pago como un objeto con al menos el campo `texto` conteniendo la información textual extraída del elemento de detalle de pago.
5. THE ArchivoJSONPedido SHALL ser escrito con formato legible (indentación de 2 espacios) utilizando `JSON.stringify` con el parámetro de espaciado.
6. THE ArchivoJSONPedido SHALL utilizar codificación UTF-8 para soportar caracteres especiales en nombres de productos y datos de entrega.
7. WHEN se genere un nuevo pedido, THE CapturaProductosCarrito SHALL crear un archivo JSON independiente con un nombre que incluya un timestamp (por ejemplo, `pedido_2025-01-15T10-30-00.json`) para evitar sobrescribir datos de pedidos anteriores.
