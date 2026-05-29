# Plan de Implementación: Limpieza de Arquetipo QA/SDET

## Visión General

Consolidar el proyecto QA/SDET en un arquetipo limpio y reutilizable mediante 4 fases secuenciales: migración de componentes genéricos web, corrección de inconsistencias, eliminación de carpetas Dislicores con todas sus referencias, y consolidación del módulo mobile. Cada fase construye sobre la anterior para evitar estados intermedios rotos.

## Tareas

- [x] 1. Fase 1 — Migración de componentes genéricos a web/shared (Req 1-4)
  - [x] 1.1 Copiar Tasks genéricas de Dislicores a web/shared/Tasks/
    - Copiar `features/Dislicores/shared/Tasks/WaitUntilGone.ts` → `features/web/shared/Tasks/WaitUntilGone.ts`
    - Copiar `features/Dislicores/shared/Tasks/SelectNativeOptionByText.ts` → `features/web/shared/Tasks/SelectNativeOptionByText.ts`
    - Copiar `features/Dislicores/shared/Tasks/SelectNativeOptionByValue.ts` → `features/web/shared/Tasks/SelectNativeOptionByValue.ts`
    - Verificar que los imports usen `@serenity-js/*` o rutas relativas dentro de `features/web/shared/`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Copiar Interaction genérica PressEnter a web/shared/Interactions/
    - Copiar `features/Dislicores/shared/Interactions/PressEnter.ts` → `features/web/shared/Interactions/PressEnter.ts`
    - Verificar que los imports usen `@serenity-js/core` y `@serenity-js/web` sin dependencias de negocio
    - _Requisitos: 2.1, 2.2_

  - [x] 1.3 Copiar Questions genéricas a web/shared/Questions/
    - Copiar `features/Dislicores/shared/Questions/IsElementPresent.ts` → `features/web/shared/Questions/IsElementPresent.ts`
    - Copiar `features/Dislicores/shared/Questions/IsElementVisible.ts` → `features/web/shared/Questions/IsElementVisible.ts`
    - Verificar que los imports apunten exclusivamente a paquetes `@serenity-js`
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 1.4 Copiar SelectivePhotos a web/shared/Utils/
    - Copiar `features/Dislicores/shared/Utils/SelectivePhotos.ts` → `features/web/shared/Utils/SelectivePhotos.ts`
    - Verificar que los imports apunten exclusivamente a paquetes `@serenity-js`
    - _Requisitos: 4.1, 4.2_

- [x] 2. Checkpoint — Verificar migración web
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que los 7 archivos migrados existen en sus destinos dentro de `features/web/shared/`

- [x] 3. Fase 2 — Corrección de inconsistencias en web/shared (Req 5)
  - [x] 3.1 Renombrar carpeta Task/ a Tasks/ y corregir typo en archivo
    - Renombrar `features/web/shared/Task/` → `features/web/shared/Tasks/`
    - Renombrar `features/web/shared/Tasks/CrearAndEnter.ts` → `features/web/shared/Tasks/ClearAndEnter.ts`
    - _Requisitos: 5.1, 5.2_

  - [x] 3.2 Actualizar imports afectados por el renombrado
    - En `features/web/Tasks/Form/AbrirFormulario.ts`: cambiar `../../shared/Task/ClickWhenReady` → `../../shared/Tasks/ClickWhenReady`
    - En `features/web/Tasks/Form/LlenarFormulario.ts`: cambiar `../../shared/Task/SelectFromDropdown` → `../../shared/Tasks/SelectFromDropdown`
    - En `features/web/Tasks/Form/LlenarFormulario.ts`: cambiar `../../shared/Task/CrearAndEnter` → `../../shared/Tasks/ClearAndEnter`
    - En `features/web/Tasks/Form/LlenarFormulario.ts`: cambiar `../../shared/Task/ReplaceValue` → `../../shared/Tasks/ReplaceValue`
    - _Requisitos: 5.5_

  - [x] 3.3 Eliminar console.log de debug en ReplaceValue.ts
    - En `features/web/shared/Tasks/ReplaceValue.ts`, eliminar la línea `console.log(value + "EL VALOR ES ESTEEEEEEEEEEEE")`
    - _Requisitos: 5.3_

  - [x] 3.4 Eliminar anti-patrón pause.ts
    - Verificar que ningún archivo importe `pause.ts` antes de eliminar
    - Eliminar `features/web/Tasks/Utils/pause.ts`
    - Si existen imports a `pause.ts`, eliminar el import y el uso de `pause()`
    - _Requisitos: 5.4_

- [x] 4. Checkpoint — Verificar correcciones web
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que `features/web/shared/Task/` (singular) ya NO existe
  - Verificar que `ClearAndEnter.ts` existe y `CrearAndEnter.ts` NO existe
  - Verificar que `ReplaceValue.ts` no contiene `console.log`
  - Verificar que `pause.ts` no existe

- [x] 5. Fase 3 — Eliminación de Dislicores web y referencias (Req 6-9)
  - [x] 5.1 Eliminar directorios de Dislicores
    - Eliminar `features/Dislicores/` con todo su contenido
    - Eliminar `features/step-definitions/dislicores_web/` con todos sus archivos
    - _Requisitos: 6.1, 6.2_

  - [x] 5.2 Eliminar archivos de configuración y env de Dislicores
    - Eliminar `configs/wdio.dislicores.web.conf.ts`
    - Eliminar `configs/wdio.dislicores.android.conf.ts`
    - Eliminar `.env.dislicores.web`
    - Eliminar `.env.dislicores.movil.android`
    - _Requisitos: 7.1, 7.2, 7.3, 7.4_

  - [x] 5.3 Limpiar scripts/run.mjs de referencias a Dislicores
    - Eliminar carga de env para `dislicores_web` y `dislicores_movil`
    - Eliminar entradas `dislicores_web` y `dislicores_android` de `modeToConfig`
    - Eliminar bloque `if (forMode === 'dislicores_movil')` de `resolveMobileConfig`
    - Eliminar `'dislicores_web'` y `'dislicores_movil'` del array `sequence` en modo `all`
    - Eliminar `'dislicores_movil'` de la condición de modos móviles
    - Actualizar mensaje de error de modos soportados para excluir dislicores
    - Eliminar comentarios que referencien dislicores
    - _Requisitos: 8.1, 8.2, 8.3, 8.5_

  - [x] 5.4 Limpiar package.json de scripts Dislicores
    - Eliminar `"test:dislicores:web"` y `"test:dislicores:android"` del `package.json`
    - _Requisitos: 8.4_

  - [x] 5.5 Limpiar README.md de referencias a Dislicores
    - Eliminar secciones de modo `dislicores_web` y `dislicores_movil`
    - Eliminar comandos `npm run test:dislicores:*`
    - Eliminar variables de entorno `DISLICORES_*`
    - Eliminar referencias a configs `wdio.dislicores.*.conf.ts`
    - _Requisitos: 8.6_

  - [x] 5.6 Actualizar AGENTS.md — eliminar referencias Dislicores web
    - Eliminar `features/Dislicores/` de la estructura de carpetas
    - Agregar nota indicando que fue consolidado en `features/web/shared/`
    - Eliminar `dislicores_web/` de step-definitions
    - _Requisitos: 8.7_

  - [x] 5.7 Limpiar variables de entorno en archivos .env genéricos
    - En `.env.web`: eliminar `DISLICORES_USER`, `DISLICORES_PASSWORD`, `DISLICORES_URL`
    - En `.env.web`: agregar placeholders genéricos `APP_USER`, `APP_PASSWORD`, `APP_URL` si queda sin variables de aplicación
    - En `.env.movil.android`: verificar y eliminar variables `DISLICORES_*` si existen
    - _Requisitos: 9.1, 9.2, 9.3_

- [x] 6. Checkpoint — Verificar eliminación Dislicores
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que `features/Dislicores/` no existe
  - Verificar que `configs/wdio.dislicores.*.conf.ts` no existen
  - Verificar que `.env.dislicores.*` no existen
  - Verificar que `scripts/run.mjs` no contiene la cadena `dislicores`
  - Verificar que `package.json` no contiene scripts `test:dislicores:*`

- [x] 7. Fase 4 — Consolidación Mobile (Req 11-14)
  - [x] 7.1 Migrar Interactions genéricas de Dislicores_coordinadores a mobile/shared
    - Copiar `features/Dislicores_coordinadores/shared/Interactions/DismissKeyboard.ts` → `features/mobile/shared/Interactions/DismissKeyboard.ts`
    - Conservar el tipo `Options` con la propiedad `allowBackFallback` y las tres estrategias de cierre de teclado
    - Copiar `features/Dislicores_coordinadores/shared/Interactions/ScrollToBottom.ts` → `features/mobile/shared/Interactions/ScrollToBottomSafe.ts` (renombrar archivo)
    - Verificar que los imports usen `@serenity-js/core` y `@wdio/globals` sin dependencias de negocio
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [x] 7.2 Eliminar placeholders sin implementación en mobile
    - Eliminar `features/mobile/android/Tasks/Login/HomeTasks copy.ts`
    - Eliminar `features/Dislicores_coordinadores/android/Tasks/Login/HomeTasks copy.ts`
    - _Requisitos: 12.1, 12.2_

  - [x] 7.3 Eliminar directorio Dislicores_coordinadores y verificar archivos relacionados
    - Eliminar `features/Dislicores_coordinadores/` con todo su contenido
    - Verificar que `features/step-definitions/dislicores_mobile/` fue eliminado (Req 6)
    - Eliminar `features/step-definitions/dislicores_mobile/` si aún existe
    - Verificar que `configs/wdio.dislicores.android.conf.ts` fue eliminado (Req 7)
    - Verificar que `.env.dislicores.movil.android` fue eliminado (Req 7)
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [x] 7.4 Actualizar AGENTS.md — consolidar mobile y eliminar Dislicores_coordinadores
    - Agregar `DismissKeyboard` y `ScrollToBottomSafe` a la lista de Interactions mobile: `Tap, TypeInto, WaitFor, Swipe, DismissKeyboard, ScrollToBottomSafe`
    - Eliminar referencia a `features/Dislicores_coordinadores/` y `dislicores_mobile/` de la estructura de carpetas
    - _Requisitos: 12.3, 12.4_

  - [x] 7.5 Documentar mejoras identificadas en módulo mobile
    - Agregar sección en `README.md` con las mejoras identificadas:
      - ✅ `DismissKeyboard.ts` migrado a `mobile/shared/Interactions/`
      - ✅ `ScrollToBottomSafe.ts` migrado a `mobile/shared/Interactions/`
      - ✅ `HomeTasks copy.ts` eliminado
      - ⚠️ `LoginTasks.ts` en mobile no usa `DismissKeyboard` entre campos — mejora pendiente
      - ⚠️ `Mobile_login_steps.ts` contiene código comentado extenso — limpieza pendiente
    - _Requisitos: 14.1_

- [x] 8. Verificación final de integridad
  - [x] 8.1 Verificar compilación TypeScript y validez de imports
    - Ejecutar verificación de compilación TypeScript en `features/web/` y `features/mobile/`
    - Verificar que todos los imports en `features/step-definitions/web/` apunten a rutas válidas dentro de `features/web/`
    - Verificar que todos los imports en `features/step-definitions/mobile/` apunten a rutas válidas dentro de `features/mobile/`
    - Verificar que todos los imports en `features/web/shared/` apunten a paquetes `@serenity-js` o rutas relativas válidas
    - Si algún archivo referencia un componente migrado desde Dislicores, actualizar el import a la nueva ubicación
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 14.2, 14.3, 14.4_

- [x] 9. Checkpoint final — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Confirmar que no existen referencias a `dislicores` en ningún archivo del proyecto (excepto allure-results)
  - Confirmar que la estructura de carpetas coincide con el estado objetivo del diseño

## Notas

- Las tareas siguen el orden Migración → Corrección → Eliminación → Consolidación para evitar estados intermedios rotos
- Las eliminaciones son idempotentes: si un archivo ya fue eliminado en una fase anterior, la verificación no debe fallar
- Cada tarea referencia los requisitos específicos que implementa para trazabilidad
- Los checkpoints permiten validación incremental entre fases
