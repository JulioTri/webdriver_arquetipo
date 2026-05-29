# Documento de Requisitos — Limpieza de Arquetipo QA/SDET

## Introducción

Este documento define los requisitos para consolidar el proyecto QA/SDET en un arquetipo limpio y reutilizable. El objetivo es migrar los componentes genéricos de `features/Dislicores/` hacia `features/web/shared/`, corregir las brechas de buenas prácticas en `features/web/`, eliminar completamente la carpeta Dislicores junto con todos sus archivos relacionados (configs, step-definitions, env files, scripts), y adicionalmente validar y consolidar `features/Dislicores_coordinadores/` contra `features/mobile/`, migrando buenas prácticas al módulo mobile y eliminando la carpeta Dislicores_coordinadores con todas sus referencias.

### Análisis de Hallazgos

**Código duplicado exacto (Dislicores → web):**
- `ClickWhenReady.ts` — idéntico en ambas carpetas
- `ClearAndEnter.ts` / `CrearAndEnter.ts` — idéntico (web tiene typo en nombre de archivo)
- `SelectFromDropdown.ts` — idéntico
- `TextContent.ts` — idéntico
- `JsonDataLoader.ts` — idéntico
- `ResolvePath.ts` — idéntico

**Código en Dislicores que NO existe en web (reutilizable/genérico):**
- `WaitUntilGone.ts` — Task genérica para esperar desaparición de elementos (loaders, spinners)
- `SelectNativeOptionByText.ts` — Task genérica para selects nativos HTML por texto
- `SelectNativeOptionByValue.ts` — Task genérica para selects nativos HTML por valor
- `PressEnter.ts` — Interaction genérica para presionar Enter
- `IsElementPresent.ts` — Question genérica para verificar presencia de elementos
- `IsElementVisible.ts` — Question genérica para verificar visibilidad de elementos
- `SelectivePhotos.ts` — Estrategia de screenshots selectiva (Photographer)

**Código específico de negocio Dislicores (NO reutilizable):**
- Tasks: `HomeTasks`, `LoginTasks`, `OpenDislicores`, `AddProductsFromFile`, `CompletePaymentFromFile`, `EnsureCartIsEmpty`, `EnsureMinimumOrderIsMet`, `SelectSubsidiary`, `AttemptToRevealSubsidiary`
- UI: `HomeUI`, `LoginUI`
- Interactions: `CaptureOrderData`, `UpdateOrderData`, `OrderFileStore`, `OrderDataTypes`
- Data: `products.json`, `methods.json`, `orders/*.json`
- Features: `Home.feature`, `Login.feature` (web y android)

**Brechas de buenas prácticas en web:**
- `ReplaceValue.ts` en web contiene `console.log` de debug
- Archivo `CrearAndEnter.ts` tiene typo (debería ser `ClearAndEnter.ts`)
- Carpeta `shared/Task/` usa singular (Dislicores usa `Tasks/` en plural, consistente con el resto del proyecto)
- `features/web/shared/Interactions/` está vacía
- `features/web/shared/data/` no tiene estructura consistente
- `features/web/Tasks/Utils/pause.ts` usa `setTimeout` (anti-patrón según AGENTS.md)
- Falta `WaitUntilGone`, `SelectNativeOptionByText/Value`, `PressEnter`, `IsElementPresent`, `IsElementVisible`
- Falta estrategia de screenshots selectiva (`SelectivePhotos`)

**Archivos a eliminar fuera de features/Dislicores/:**
- `configs/wdio.dislicores.web.conf.ts`
- `configs/wdio.dislicores.android.conf.ts`
- `features/step-definitions/dislicores_web/` (directorio completo)
- `features/step-definitions/dislicores_mobile/` (directorio completo)
- `.env.dislicores.web`
- `.env.dislicores.movil.android`
- Referencias en `scripts/run.mjs`, `package.json`, `README.md`, `AGENTS.md`

### Análisis de Hallazgos — Dislicores_coordinadores vs mobile

**Código duplicado exacto (Dislicores_coordinadores → mobile):**
- `shared/Interactions/DebugPause.ts` — idéntico en ambas carpetas
- `shared/Interactions/Swipe.ts` — idéntico
- `shared/Interactions/WaitFor.ts` (`WaitForDisplayed`) — idéntico
- `shared/Questions/AttributeOf.ts` — idéntico
- `shared/Questions/CountOf.ts` — idéntico
- `shared/Questions/IsVisible.ts` — idéntico
- `shared/Questions/NormalizedText.ts` — idéntico
- `shared/Questions/TextOf.ts` — idéntico
- `shared/Questions/ValueOf.ts` — idéntico
- `android/UI/HomeUI.ts` — idéntico (clase vacía)
- `android/Tasks/Login/HomeTasks copy.ts` — idéntico (placeholder sin implementación)

**Código en Dislicores_coordinadores que NO existe en mobile (reutilizable/genérico):**
- `shared/Interactions/DismissKeyboard.ts` — Interaction genérica multi-estrategia para ocultar teclado (hideKeyboard → mobile:hideKeyboard → back fallback)
- `shared/Interactions/ScrollToBottom.ts` (`ScrollToBottomSafe`) — Interaction genérica para scroll seguro evitando zona de teclado, con detección de estabilidad por pageSource

**Diferencias de implementación (misma estructura, distintos valores):**
- `shared/Interactions/Tap.ts` — mobile usa timeout 15s, Dislicores_coordinadores usa 3s
- `shared/Interactions/TypeInto.ts` — mobile usa timeout 15s, Dislicores_coordinadores usa 3s
- `shared/Tasks/ClearAndEnter.ts` — mobile usa WaitForDisplayed 15s, Dislicores_coordinadores usa 1s
- `shared/Tasks/TapWhenVisible.ts` — mobile usa WaitForDisplayed 15s, Dislicores_coordinadores usa 3s

**Código específico de negocio Dislicores_coordinadores (NO reutilizable):**
- `android/UI/LoginUI.ts` — selectores XPath específicos de la app Dislicores Coordinadores
- `android/Tasks/Login/LoginTasks.ts` — Task de login específica con `DismissKeyboard` (buena práctica)
- `android/Features/Android/Login.feature` — Feature específica de Dislicores Coordinadores

**Brechas de buenas prácticas en mobile:**
- Falta `DismissKeyboard.ts` — Interaction crítica para testing mobile que maneja múltiples estrategias de cierre de teclado
- Falta `ScrollToBottomSafe.ts` — Interaction útil para escenarios de scroll que evita la zona del teclado
- Archivo `HomeTasks copy.ts` es un placeholder sin implementación que debería eliminarse
- `LoginTasks.ts` en mobile no usa `DismissKeyboard` entre campos (buena práctica presente en Dislicores_coordinadores)
- Los timeouts en mobile son uniformemente altos (15s) sin posibilidad de configuración granular

**Archivos a eliminar fuera de features/Dislicores_coordinadores/:**
- `configs/wdio.dislicores.android.conf.ts` (ya listado en Requisito 7, referencia specs de Dislicores_coordinadores)
- `features/step-definitions/dislicores_mobile/Mobile_login_steps.ts` (importa desde Dislicores_coordinadores)
- `.env.dislicores.movil.android` (ya listado en Requisito 7)
- Referencias en `scripts/run.mjs`: modo `dislicores_movil`, config `dislicores_android`, función `resolveMobileConfig`
- Referencias en `package.json`: script `test:dislicores:android`
- Referencias en `README.md`: secciones de `dislicores_movil`
- Referencias en `AGENTS.md`: mención de `features/Dislicores/` y `dislicores_mobile/` en estructura de carpetas

## Glosario

- **Arquetipo**: Proyecto base reutilizable que sirve como plantilla para nuevos proyectos de automatización QA
- **Shared_Web**: Carpeta `features/web/shared/` que contiene componentes reutilizables para automatización web
- **Shared_Dislicores**: Carpeta `features/Dislicores/shared/` que contiene componentes reutilizables desarrollados en el módulo Dislicores
- **Componente_Genérico**: Task, Interaction, Question o Utility que opera sobre abstracciones de Serenity/JS (`PageElement`, `Answerable`) sin depender de selectores o lógica de negocio específica
- **Componente_Específico**: Task, Interaction, Question o UI que contiene selectores, datos o lógica acoplada a una aplicación concreta
- **Screenplay_Pattern**: Patrón arquitectónico de Serenity/JS que organiza el código en Actors, Tasks, Interactions, Questions y UI Mappings
- **Run_Script**: Archivo `scripts/run.mjs` que orquesta la ejecución de suites de prueba por modo
- **Config_Dislicores**: Archivos de configuración WebdriverIO específicos para el módulo Dislicores (`wdio.dislicores.web.conf.ts`, `wdio.dislicores.android.conf.ts`)
- **Shared_Dislicores_Coordinadores**: Carpeta `features/Dislicores_coordinadores/shared/` que contiene componentes reutilizables desarrollados en el módulo Dislicores Coordinadores para mobile
- **Shared_Mobile**: Carpeta `features/mobile/shared/` que contiene componentes reutilizables para automatización mobile nativa
- **DismissKeyboard**: Interaction genérica que implementa múltiples estrategias para ocultar el teclado en dispositivos móviles (hideKeyboard, mobile:hideKeyboard, back fallback)
- **ScrollToBottomSafe**: Interaction genérica que realiza scroll hacia abajo evitando la zona del teclado, con detección de estabilidad por comparación de pageSource

## Requisitos

### Requisito 1: Migración de Tasks genéricas de Dislicores a web/shared

**User Story:** Como arquitecto QA, quiero que las Tasks genéricas desarrolladas en Dislicores estén disponibles en `features/web/shared/Tasks/`, para que cualquier proyecto web pueda reutilizarlas sin depender del módulo Dislicores.

#### Criterios de Aceptación

1. THE Shared_Web SHALL contener el archivo `Tasks/WaitUntilGone.ts` con la misma implementación funcional que existe en Shared_Dislicores
2. THE Shared_Web SHALL contener el archivo `Tasks/SelectNativeOptionByText.ts` con la misma implementación funcional que existe en Shared_Dislicores
3. THE Shared_Web SHALL contener el archivo `Tasks/SelectNativeOptionByValue.ts` con la misma implementación funcional que existe en Shared_Dislicores
4. WHEN se copien las Tasks genéricas, THE Shared_Web SHALL mantener los imports apuntando a rutas relativas dentro de `features/web/shared/`

### Requisito 2: Migración de Interactions genéricas de Dislicores a web/shared

**User Story:** Como arquitecto QA, quiero que las Interactions genéricas desarrolladas en Dislicores estén disponibles en `features/web/shared/Interactions/`, para que la carpeta deje de estar vacía y el arquetipo ofrezca Interactions reutilizables.

#### Criterios de Aceptación

1. THE Shared_Web SHALL contener el archivo `Interactions/PressEnter.ts` con la misma implementación funcional que existe en Shared_Dislicores
2. WHEN se migre `PressEnter.ts`, THE Shared_Web SHALL mantener los imports de `@serenity-js/core` y `@serenity-js/web` sin dependencias a módulos específicos de negocio

### Requisito 3: Migración de Questions genéricas de Dislicores a web/shared

**User Story:** Como arquitecto QA, quiero que las Questions genéricas desarrolladas en Dislicores estén disponibles en `features/web/shared/Questions/`, para que el arquetipo ofrezca Questions de verificación de presencia y visibilidad.

#### Criterios de Aceptación

1. THE Shared_Web SHALL contener el archivo `Questions/IsElementPresent.ts` con la misma implementación funcional que existe en Shared_Dislicores
2. THE Shared_Web SHALL contener el archivo `Questions/IsElementVisible.ts` con la misma implementación funcional que existe en Shared_Dislicores
3. WHEN se migren las Questions, THE Shared_Web SHALL mantener los imports apuntando exclusivamente a paquetes de `@serenity-js`

### Requisito 4: Migración de la estrategia de screenshots selectiva

**User Story:** Como arquitecto QA, quiero que la estrategia de screenshots selectiva (`TakePhotosOfSelectedInteractions`) esté disponible en `features/web/shared/Utils/`, para que cualquier configuración web pueda usarla como alternativa a `TakePhotosOfInteractions`.

#### Criterios de Aceptación

1. THE Shared_Web SHALL contener el archivo `Utils/SelectivePhotos.ts` con la misma implementación funcional que existe en Shared_Dislicores
2. WHEN se migre `SelectivePhotos.ts`, THE Shared_Web SHALL mantener los imports apuntando exclusivamente a paquetes de `@serenity-js`

### Requisito 5: Corrección de inconsistencias y anti-patrones en web/shared

**User Story:** Como arquitecto QA, quiero que los archivos existentes en `features/web/shared/` sigan las convenciones del proyecto y no contengan anti-patrones, para que el arquetipo sea un ejemplo de buenas prácticas.

#### Criterios de Aceptación

1. THE Shared_Web SHALL renombrar el archivo `Task/CrearAndEnter.ts` a `Tasks/ClearAndEnter.ts` corrigiendo el typo en el nombre
2. THE Shared_Web SHALL renombrar la carpeta `shared/Task/` a `shared/Tasks/` para mantener consistencia con la convención plural del proyecto
3. THE Shared_Web SHALL eliminar la sentencia `console.log` de debug presente en `ReplaceValue.ts`
4. THE Shared_Web SHALL eliminar el archivo `Tasks/Utils/pause.ts` que implementa un hard wait con `setTimeout`, violando las reglas del proyecto
5. WHEN se renombre la carpeta `Task/` a `Tasks/`, THE Shared_Web SHALL actualizar todos los imports en archivos que referencien la ruta anterior (`shared/Task/`)

### Requisito 6: Eliminación de la carpeta features/Dislicores

**User Story:** Como arquitecto QA, quiero que la carpeta `features/Dislicores/` sea eliminada completamente, para que el arquetipo no contenga código específico de un cliente o proyecto.

#### Criterios de Aceptación

1. WHEN se complete la migración de Componentes_Genéricos, THE Arquetipo SHALL eliminar el directorio `features/Dislicores/` con todo su contenido (Tasks, UI, Questions, Interactions, Data, Features, shared)
2. THE Arquetipo SHALL eliminar el directorio `features/step-definitions/dislicores_web/` con todos sus archivos
3. THE Arquetipo SHALL eliminar el directorio `features/step-definitions/dislicores_mobile/` con todos sus archivos

### Requisito 7: Eliminación de configuraciones específicas de Dislicores

**User Story:** Como arquitecto QA, quiero que las configuraciones WebdriverIO específicas de Dislicores sean eliminadas, para que el arquetipo solo contenga configuraciones genéricas.

#### Criterios de Aceptación

1. THE Arquetipo SHALL eliminar el archivo `configs/wdio.dislicores.web.conf.ts`
2. THE Arquetipo SHALL eliminar el archivo `configs/wdio.dislicores.android.conf.ts`
3. THE Arquetipo SHALL eliminar el archivo `.env.dislicores.web`
4. THE Arquetipo SHALL eliminar el archivo `.env.dislicores.movil.android`

### Requisito 8: Limpieza de referencias a Dislicores en scripts y documentación

**User Story:** Como arquitecto QA, quiero que los scripts de ejecución, el `package.json` y la documentación no contengan referencias a Dislicores, para que el arquetipo sea completamente genérico.

#### Criterios de Aceptación

1. THE Run_Script SHALL eliminar las entradas de modo `dislicores_web` y `dislicores_movil` del mapeo de modos a configuraciones
2. THE Run_Script SHALL eliminar las condiciones de carga de archivos `.env.dislicores.*`
3. WHEN se ejecute el Run_Script con un modo no soportado, THE Run_Script SHALL mostrar un mensaje de error que liste solo los modos válidos restantes
4. THE Arquetipo SHALL eliminar los scripts `test:dislicores:web` y `test:dislicores:android` del `package.json`
5. THE Arquetipo SHALL eliminar las referencias a Dislicores en la secuencia `all` del Run_Script
6. THE Arquetipo SHALL actualizar el `README.md` eliminando todas las secciones y comandos relacionados con Dislicores
7. THE Arquetipo SHALL actualizar el `AGENTS.md` eliminando la referencia a `features/Dislicores/` en la estructura de carpetas y reemplazándola con una nota indicando que la carpeta fue consolidada en `features/web/shared/`

### Requisito 9: Limpieza de variables de entorno específicas de Dislicores en archivos .env genéricos

**User Story:** Como arquitecto QA, quiero que los archivos `.env` genéricos no contengan variables específicas de Dislicores, para que el arquetipo use nombres de variables genéricos.

#### Criterios de Aceptación

1. THE Arquetipo SHALL eliminar las variables `DISLICORES_USER`, `DISLICORES_PASSWORD` y `DISLICORES_URL` del archivo `.env.web`
2. THE Arquetipo SHALL eliminar las variables `DISLICORES_USER`, `DISLICORES_PASSWORD` y `DISLICORES_URL` del archivo `.env.movil.android` si existen
3. IF el archivo `.env.web` queda sin variables de aplicación tras la limpieza, THEN THE Arquetipo SHALL agregar variables placeholder genéricas (`APP_USER`, `APP_PASSWORD`, `APP_URL`) con valores de ejemplo

### Requisito 10: Verificación de integridad post-limpieza

**User Story:** Como arquitecto QA, quiero verificar que el proyecto compila y que los imports son válidos después de la limpieza, para asegurar que no se rompió ninguna funcionalidad existente en el módulo web.

#### Criterios de Aceptación

1. WHEN se complete la limpieza, THE Arquetipo SHALL compilar sin errores de TypeScript en los archivos de `features/web/`
2. WHEN se complete la limpieza, THE Arquetipo SHALL tener todos los imports en `features/step-definitions/web/` apuntando a rutas válidas dentro de `features/web/`
3. WHEN se complete la limpieza, THE Arquetipo SHALL tener todos los imports en `features/web/shared/` apuntando a paquetes de `@serenity-js` o rutas relativas válidas
4. IF algún archivo en `features/web/` referencia un componente que fue migrado desde Dislicores, THEN THE Arquetipo SHALL actualizar el import para apuntar a la nueva ubicación en `features/web/shared/`

### Requisito 11: Migración de Interactions genéricas de Dislicores_coordinadores a mobile/shared

**User Story:** Como arquitecto QA, quiero que las Interactions genéricas desarrolladas en Dislicores_coordinadores estén disponibles en `features/mobile/shared/Interactions/`, para que el módulo mobile ofrezca Interactions reutilizables que actualmente solo existen en el módulo específico de cliente.

#### Criterios de Aceptación

1. THE Shared_Mobile SHALL contener el archivo `Interactions/DismissKeyboard.ts` con la misma implementación funcional que existe en Shared_Dislicores_Coordinadores, incluyendo las tres estrategias de cierre de teclado (hideKeyboard, mobile:hideKeyboard, back fallback)
2. THE Shared_Mobile SHALL contener el archivo `Interactions/ScrollToBottomSafe.ts` con la misma implementación funcional que existe en Shared_Dislicores_Coordinadores (`ScrollToBottom.ts`), incluyendo la detección de estabilidad por pageSource y la zona segura configurable
3. WHEN se copien las Interactions genéricas, THE Shared_Mobile SHALL mantener los imports apuntando a `@serenity-js/core` y `@wdio/globals` sin dependencias a módulos específicos de negocio
4. WHEN se migre `DismissKeyboard.ts`, THE Shared_Mobile SHALL conservar el tipo `Options` con la propiedad `allowBackFallback` para mantener la flexibilidad de configuración

### Requisito 12: Corrección de inconsistencias y mejoras de buenas prácticas en mobile/shared

**User Story:** Como arquitecto QA, quiero que los archivos existentes en `features/mobile/shared/` y `features/mobile/android/` sigan las mejores prácticas identificadas en Dislicores_coordinadores, para que el arquetipo mobile sea un ejemplo de calidad técnica.

#### Criterios de Aceptación

1. THE Shared_Mobile SHALL eliminar el archivo `features/mobile/android/Tasks/Login/HomeTasks copy.ts` que es un placeholder sin implementación funcional
2. THE Shared_Mobile SHALL eliminar el archivo `features/Dislicores_coordinadores/android/Tasks/Login/HomeTasks copy.ts` que es un placeholder sin implementación funcional
3. WHEN se complete la migración de `DismissKeyboard.ts` a Shared_Mobile, THE Arquetipo SHALL documentar en `AGENTS.md` la disponibilidad de `DismissKeyboard` como Interaction reutilizable en la sección de Interactions mobile (`Tap, TypeInto, WaitFor, Swipe, DismissKeyboard, ScrollToBottomSafe`)
4. THE Arquetipo SHALL actualizar el `AGENTS.md` eliminando la referencia a `features/Dislicores_coordinadores/` y `dislicores_mobile/` en la estructura de carpetas del proyecto

### Requisito 13: Eliminación de la carpeta features/Dislicores_coordinadores y archivos relacionados

**User Story:** Como arquitecto QA, quiero que la carpeta `features/Dislicores_coordinadores/` sea eliminada completamente junto con todas sus referencias en configuraciones, step-definitions, env files y scripts, para que el arquetipo no contenga código específico de un cliente.

#### Criterios de Aceptación

1. WHEN se complete la migración de Interactions genéricas a Shared_Mobile, THE Arquetipo SHALL eliminar el directorio `features/Dislicores_coordinadores/` con todo su contenido (android/Features, android/Tasks, android/UI, shared/Interactions, shared/Questions, shared/Tasks)
2. THE Arquetipo SHALL verificar que el archivo `configs/wdio.dislicores.android.conf.ts` sea eliminado (referencia specs de `Dislicores_coordinadores` en su propiedad `specs`)
3. THE Arquetipo SHALL verificar que el directorio `features/step-definitions/dislicores_mobile/` sea eliminado con todos sus archivos (contiene import directo a `Dislicores_coordinadores`)
4. THE Arquetipo SHALL verificar que el archivo `.env.dislicores.movil.android` sea eliminado (contiene variables específicas del paquete `com.dislicores.b2b.ex360.android.dev`)
5. THE Run_Script SHALL eliminar la entrada de modo `dislicores_movil` del mapeo de modos, la función `resolveMobileConfig` para `dislicores_movil`, y la referencia a `dislicores_android` en `modeToConfig`
6. THE Arquetipo SHALL eliminar el script `test:dislicores:android` del `package.json`
7. THE Arquetipo SHALL actualizar el `README.md` eliminando todas las secciones, comandos y variables de entorno relacionados con `dislicores_movil`
8. WHEN se ejecute el Run_Script con un modo no soportado tras la limpieza, THE Run_Script SHALL mostrar un mensaje de error que liste solo los modos válidos restantes (sin incluir `dislicores_web` ni `dislicores_movil`)

### Requisito 14: Identificación y listado de mejoras necesarias en el módulo mobile

**User Story:** Como arquitecto QA, quiero tener un listado claro de las mejoras necesarias en `features/mobile/`, para que el equipo pueda priorizar y ejecutar las correcciones que eleven la calidad del módulo mobile al nivel del arquetipo.

#### Criterios de Aceptación

1. THE Arquetipo SHALL documentar en el `README.md` o en un archivo de notas técnicas las siguientes mejoras identificadas en el módulo mobile:
   - Falta la Interaction `DismissKeyboard` en `mobile/shared/Interactions/` (migrada en Requisito 11)
   - Falta la Interaction `ScrollToBottomSafe` en `mobile/shared/Interactions/` (migrada en Requisito 11)
   - El archivo `HomeTasks copy.ts` en `mobile/android/Tasks/Login/` es un placeholder sin implementación que genera ruido en el proyecto (eliminado en Requisito 12)
   - La Task `LoginTasks.ts` en `mobile/android/Tasks/Login/` no utiliza `DismissKeyboard` entre campos de entrada, lo cual es una buena práctica presente en Dislicores_coordinadores para evitar que el teclado obstruya elementos
   - Los step-definitions en `features/step-definitions/mobile/Mobile_login_steps.ts` contienen código comentado extenso que debería limpiarse o implementarse
2. WHEN se complete la migración de Interactions genéricas, THE Arquetipo SHALL verificar que los imports en `features/step-definitions/mobile/` apunten a rutas válidas dentro de `features/mobile/`
3. WHEN se complete la limpieza, THE Arquetipo SHALL compilar sin errores de TypeScript en los archivos de `features/mobile/`
4. IF algún archivo en `features/mobile/` referencia un componente que fue migrado desde Dislicores_coordinadores, THEN THE Arquetipo SHALL actualizar el import para apuntar a la nueva ubicación en `features/mobile/shared/`
