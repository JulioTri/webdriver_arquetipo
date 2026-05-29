# Prompt para Generación de Skills de Agente de IA (Kiro + Serenity/JS)

Este documento contiene el prompt diseñado para configurar un agente de IA que comprenda y trabaje con la arquitectura de este proyecto de automatización.

## Contexto Tecnológico del Proyecto
*   **Framework:** WebdriverIO v9 + Serenity/JS v3.
*   **Patrón de Diseño:** Screenplay Pattern.
*   **BDD:** Cucumber v11.
*   **Plataformas:** Web, Mobile (Android/iOS via Appium), API Rest.
*   **Gestión de IA:** Kiro (Flujo basado en `.kiro/specs/`).

---

## Prompt Sugerido

Copia y pega el siguiente contenido en tu herramienta de generación de agentes o LLM:

```markdown
Actúa como un Arquitecto de Automatización experto en Serenity/JS y WebdriverIO. Necesito generar un conjunto de "Skills" (habilidades técnicas) para un agente de IA que operará en un entorno "Kiro with Cloud" dentro de este repositorio.

El agente debe ser capaz de realizar las siguientes tareas basándose en el stack tecnológico del proyecto:

1. **Investigación y Diagnóstico:**
   - Analizar archivos .feature de Cucumber y mapearlos a la estructura Screenplay (Tasks, UI, Questions, Interactions).
   - Identificar selectores en archivos UI (Web y Móvil) y validar su robustez.
   - Interpretar el orquestador `scripts/run.mjs` para ejecutar suites específicas (web, api, android, ios).

2. **Implementación de Código (Screenplay Pattern):**
   - Crear nuevas 'Tasks' que sigan el estándar de Serenity/JS (uso de `@serenity-js/core`).
   - Implementar 'Questions' para aserciones avanzadas.
   - Desarrollar 'Interactions' personalizadas cuando las de @serenity-js/web o @serenity-js/webdriverio no sean suficientes.
   - Configurar hooks y step definitions en TypeScript.

3. **Automatización Móvil y API:**
   - Diferenciar entre selectores Android/iOS usando el patrón de diseño implementado en `features/mobile/shared/Resolvers/PlatformUI.ts`.
   - Crear pruebas de API utilizando los actores y habilidades de `@serenity-js/rest`.

4. **Flujo de Trabajo Kiro:**
   - Actualizar dinámicamente los archivos en `.kiro/specs/` (`requirements.md`, `design.md`, `tasks.md`) para reflejar el progreso del desarrollo.
   - Sincronizar el estado de las tareas con Kiro Cloud.

5. **Validación y Reportes:**
   - Ejecutar pruebas y analizar el reporte de Serenity BDD (`target/site/serenity/index.html`) para corregir fallos.
   - Gestionar variables de entorno a través de los múltiples archivos `.env.*`.

Genera la definición técnica de estas skills para el agente, incluyendo las herramientas de línea de comandos necesarias (npx, appium, serenity-bdd) y los patrones de archivos que debe monitorear para mantener la integridad de la arquitectura Screenplay.
```

---

## Instrucciones de Uso
1. **Para Kiro:** Asegúrate de que el agente tenga acceso de lectura/escritura a la carpeta `.kiro/`.
2. **Para Ejecución:** El agente debe saber que el comando principal es `npm test` el cual invoca a `scripts/run.mjs`.
3. **Estructura:** El agente debe respetar la separación de carpetas: `features/[api|mobile|web]/[Tasks|UI|Questions]`.

---

## Apéndice: Capacidades adicionales del agente (post-arquetipo v1)

Este apéndice complementa el prompt principal con conocimientos específicos
que el agente DEBE tener para operar correctamente en este repositorio.

### A. Tags de Cucumber

El agente DEBE etiquetar cada `.feature` con:
- Un tag de **canal** a nivel Feature: `@web`, `@mobile`, `@android`, `@ios`,
  `@api`, `@desktop`.
- Un tag de **suite** (`@smoke` o `@regression`) según criticidad.
- Un tag de **tipo** por Scenario: `@happy-path`, `@negative`, `@edge-case`.
- `@wip` o `@skip` para excluir escenarios incompletos.

Ejecución selectiva mediante `scripts/run.mjs`:
```bash
npm test -- --mode=web --tags=@smoke
npm test -- --mode=api --tags="@regression and not @wip"
TAGS="@happy-path" npm run test:movil:android
```

Los tags se reenvían a WebdriverIO como `--cucumberOpts.tags=<expr>` y soportan
sintaxis Cucumber (`and`, `or`, `not`, paréntesis).

### B. Capabilities Web obligatorias

Cualquier `configs/wdio.<modo>.conf.ts` que abra navegador (web, web_mobile,
api con browser, etc.) DEBE incluir en TODAS las capabilities:

```typescript
'wdio:enforceWebDriverClassic': true,
```

Esto fuerza WebDriver Classic en lugar de BiDi (default en WDIO v9), evitando
incompatibilidades con `@serenity-js/web` v3.31.x. El agente debe verificarlo
al crear cualquier nuevo config.

### C. Verificación obligatoria del Bundle ID / Package mobile

Antes de fijar `IOS_APP_BUNDLE_ID` o `ANDROID_APP_PACKAGE` en `.env.movil.*`,
el agente DEBE leer el identificador real del binario:

```bash
# iOS
/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" ./apps/ios/<App>.app/Info.plist
xcrun simctl listapps booted | grep -i CFBundleIdentifier
# Android
aapt dump badging ./apps/android/<App>.apk | grep -E "package|launchable"
```

NO inventar bundle ids basándose en el nombre del binario. Si se proporciona
`appium:app`, preferir omitir `bundleId`/`appPackage` (Appium lo deduce).

### D. Endurecimiento WebDriverAgent (iOS)

El agente DEBE usar las siguientes capabilities en `wdio.ios.conf.ts` para
absorber la primera compilación de WDA y depurar fallas:

```typescript
'appium:wdaLaunchTimeout': 240_000,
'appium:wdaConnectionTimeout': 240_000,
'appium:wdaStartupRetries': 2,
'appium:wdaStartupRetryInterval': 10_000,
'appium:showXcodeLog': true,
// connectionRetryTimeout: 360_000 al nivel del config (no de la cap)
```

Y declarar `appium:updatedWDABundleId` / `appium:xcodeOrgId` SOLO cuando se
ejecute en device físico (controlado por variables `IOS_WDA_BUNDLE_ID` /
`IOS_XCODE_ORG_ID`). En Simulator estas capabilities ROMPEN la compilación
de WDA porque intentan firmar.

### E. Apps demo Sauce Labs

El proyecto usa apps demo oficiales como sandbox mobile:

| Plataforma | Descarga | Bundle/Package |
|---|---|---|
| Android | `npm run apps:download:android` | `com.saucelabs.mydemoapp.android` |
| iOS Simulator | `npm run apps:download:ios` (extrae `.app`) | `com.saucelabs.mydemo.app.ios` |
| iOS Device | mismo + re-firma manual con Xcode | `com.saucelabs.mydemo.app.ios` |

⚠️ El bundle id de iOS es `com.saucelabs.mydemo.app.ios` (con `.app.` en
medio), NO `com.saucelabs.mydemoapp.ios`. El agente debe verificarlo siempre
con `PlistBuddy`.

Credenciales válidas: `bob@example.com` / `10203040`.

### F. Workaround NATIVE_APP (mobile)

Serenity/JS asume modelo de window handles (web). En NATIVE_APP, los comandos
`getWindowHandle` / `getWindowHandles` no están soportados por Appium.
El workaround YA está aplicado en `configs/wdio.shared.conf.ts` dentro del
hook `before` cuando `browser.isMobile === true`.

El agente NO debe replicar este workaround en Tasks, Interactions ni Steps.

### G. Skills disponibles en `.kiro/skills/`

Si el agente opera dentro de Kiro IDE, tiene acceso a estas habilidades
especializadas:

- `screenplay-pattern` — Implementación de Screenplay con Serenity/JS v3
- `cucumber-gherkin` — Features `.feature` en español + step definitions
- `api-testing-rest` — Pruebas REST con `@serenity-js/rest`
- `webdriverio-handling` — WDIO v9 directo y encapsulado en Interactions
- `serenity-troubleshooting` — Diagnóstico de errores y workarounds
- `kiro-specs-workflow` — Specs en `.kiro/specs/` (requirements/design/tasks)
- `test-execution-runner` — Uso del orquestador `scripts/run.mjs`
- `reporting-allure-serenity` — Generación e interpretación de reportes
- `test-data-management` — Datos externos en `Data/`

Al activar una skill se cargan instrucciones detalladas. El agente debe
preferir activar la skill correspondiente antes de actuar.

### H. Migración a otros proyectos

Para llevar mejoras de este arquetipo a otros proyectos compatibles
(p. ej. `b2b-automatizacion-webdriverio_v5`):

```bash
# Dry-run
node ./scripts/migrate-to-b2b.mjs --target=/ruta/al/otro/proyecto

# Aplicar
node ./scripts/migrate-to-b2b.mjs --target=/ruta/al/otro/proyecto --apply
```

El script es idempotente y conservador: nunca toca `features/`,
`step-definitions/`, `Tasks/`, `UI/`, `Questions/` ni `.env.*` del destino.
Solo añade scripts, configs endurecidos, AGENTS.md y scaffolding de `apps/`.

### I. Comandos clave del proyecto

```bash
# Ejecución por modo
npm run test:web            # web desktop
npm run test:web_movil      # web emulado mobile
npm run test:movil:android  # Appium Android
npm run test:movil:ios      # Appium iOS
npm run test:api            # API REST
npm run test:desktop        # Appium Windows

# Atajos por tag
npm run test:smoke          # @smoke en todos los modos
npm run test:regression
npm run test:web:smoke
npm run test:movil:android:smoke

# Apps mobile
npm run apps:download
npm run apps:download:android
npm run apps:download:ios

# Migración
node ./scripts/migrate-to-b2b.mjs --target=<path> --apply

# Reportes
npm run serenity:report
```

### J. Reglas inmutables del agente (resumen)

Antes de generar código, el agente DEBE:

1. Preguntar contexto: Web / Mobile nativo / Híbrido.
2. Leer estructura del proyecto y `package.json` (no asumir librerías).
3. Validar selectores reales con la herramienta correspondiente
   (PlistBuddy / aapt / Inspector) antes de codificarlos.
4. Aplicar tags obligatorios al crear/modificar `.feature`.
5. Aplicar `wdio:enforceWebDriverClassic` al crear configs Web.
6. Declarar bundle id/package basándose en el binario real.
7. Refactorizar antes de reescribir.
8. Documentar workarounds con comentarios explicativos en el archivo afectado.

---

> Última actualización del apéndice: alineada con las reglas del `AGENTS.md`
> y los scripts incluidos en `scripts/`.
