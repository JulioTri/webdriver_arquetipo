# Framework QA Multi-Plataforma (WebdriverIO v9 + Serenity/JS + Screenplay)

## Descripción breve
Framework de automatización end-to-end y de servicios construido con TypeScript, WebdriverIO v9 y Serenity/JS siguiendo el patrón Screenplay (Actors, Tasks, Interactions, Questions y UI).

Permite ejecutar pruebas desde un solo repositorio para:

- 🌐 web: navegadores desktop
- 📱 web_movil: navegador en modo móvil (emulación)
- 🤖 movil: aplicaciones nativas Android / iOS (Appium 3)
- 🖥️ desktop: aplicaciones Windows (Appium Windows)
- 🔌 api: pruebas de APIs (Serenity/JS REST)

---

## Requisitos

### Base
- Node.js 20.19+
- npm 10+
- Java 11+

### Móvil nativo (Appium 3)
- Appium 3
- Android SDK
- Xcode (iOS)

Drivers Appium (instalar una sola vez por entorno):
appium driver install uiautomator2
appium driver install xcuitest

Instalación:
npm install

---

## 📲 Apps demo para mobile

El proyecto usa por defecto las apps demo oficiales de **Sauce Labs**
(libres, abiertas, mantenidas) para escenarios mobile:

| Plataforma | Repo | Archivo en `./apps/` |
|---|---|---|
| Android | [my-demo-app-android](https://github.com/saucelabs/my-demo-app-android) | `android/SauceLabs-Demo-App.apk` |
| iOS Simulator | [my-demo-app-ios](https://github.com/saucelabs/my-demo-app-ios) | `ios/SauceLabs-Demo-App.app` |
| iOS .ipa | [my-demo-app-ios](https://github.com/saucelabs/my-demo-app-ios) | `ios/SauceLabs-Demo-App.ipa` |

### Descargar

```bash
npm run apps:download             # Android + iOS
npm run apps:download:android
npm run apps:download:ios
node ./scripts/download-apps.mjs --force   # re-descarga
```

El script consulta `releases/latest` de cada repo, descarga el asset correcto
y, en iOS, descomprime automáticamente el `.app` para Simulator.

### ⚠️ iOS en device físico

El `.ipa` publicado por Sauce Labs **no es instalable directamente** en un
iPhone real: iOS exige firma con un provisioning profile válido. Para device:

1. Clonar [saucelabs/my-demo-app-ios](https://github.com/saucelabs/my-demo-app-ios).
2. Firmar con tu Apple Developer Account en Xcode.
3. Exportar el `.ipa` resultante a `./apps/ios/`.

Para iOS Simulator no se necesita firma: basta el `.app`.

> Los binarios de `apps/` están en `.gitignore` y NO se versionan.

---

## 🍎 Configuración paso a paso para iOS (Simulator y Device)

Esta sección cubre todo lo necesario para correr `npm run test:movil:ios`
con la Sauce Labs Demo App en macOS.

### 1. Pre-requisitos macOS

| Componente | Cómo obtener / verificar |
|---|---|
| macOS reciente (Apple Silicon o Intel) | — |
| Xcode 15+ | App Store o `xcode-select --install` |
| Xcode Command Line Tools | `xcode-select -p` debe imprimir una ruta |
| Aceptar licencia Xcode | `sudo xcodebuild -license accept` |
| Carthage (lo usa WDA en device) | `brew install carthage` |
| libimobiledevice (device físico) | `brew install libimobiledevice ios-deploy` |
| ffmpeg (video reporter, opcional) | `brew install ffmpeg` |
| Node 20.19+, npm 10+, Java 11+ | `node -v && npm -v && java -version` |
| Appium 3 + driver XCUITest | ver paso 2 |

Verificación de simuladores disponibles:

```bash
xcrun simctl list devices available | grep -E "iPhone|iPad"
```

### 2. Instalar Appium 3 y el driver XCUITest

```bash
npm install -g appium
appium driver install xcuitest
appium driver list --installed     # debe listar xcuitest
appium-doctor --ios                # diagnóstico (instalar con: npm i -g appium-doctor)
```

`appium-doctor --ios` debe quedar sin errores rojos. Los warnings amarillos
no bloquean simulator pero algunos sí bloquean device físico (firma, WDA).

### 3. Descargar la app demo

```bash
npm run apps:download:ios
```

Esto deja:

- `apps/ios/SauceLabs-Demo-App.app`  → para iOS Simulator
- `apps/ios/SauceLabs-Demo-App.ipa`  → para device físico (requiere re-firma)

### 4. Configurar `.env.movil.ios`

Edita el archivo `.env.movil.ios` en la raíz. Plantillas según el escenario:

#### 4a. iOS Simulator (recomendado para empezar)

```dotenv
MOBILE_PLATFORM=ios

IOS_DEVICE_NAME=iPhone 15
IOS_PLATFORM_VERSION=17.5
# UDID del simulador (ver paso 5). Opcional si DEVICE_NAME + VERSION son únicos.
IOS_UDID=

IOS_APP_PATH=./apps/ios/SauceLabs-Demo-App.app
IOS_APP_BUNDLE_ID=com.saucelabs.mydemo.app.ios
```

#### 4b. iPhone físico

```dotenv
MOBILE_PLATFORM=ios

IOS_DEVICE_NAME=iPhone de Julio
IOS_PLATFORM_VERSION=18.5
IOS_UDID=00008030-000D74C01185402E

IOS_APP_PATH=./apps/ios/SauceLabs-Demo-App.ipa
IOS_APP_BUNDLE_ID=com.saucelabs.mydemo.app.ios

# Firma WDA (obligatorio en device)
IOS_XCODE_ORG_ID=ABCDE12345                # Team ID de tu Apple Dev Account
IOS_WDA_BUNDLE_ID=com.tu-org.qa.WebDriverAgentRunner
```

> ⚠️ El `.ipa` publicado por Sauce Labs NO se instala en device sin re-firma
> con tu Apple Developer Account (ver sección anterior "iOS en device físico").
> Para Simulator NO se necesita firma.

### 5. Levantar / identificar el dispositivo

#### Simulator

```bash
# Listar y elegir un simulador disponible
xcrun simctl list devices available

# Arrancar uno (reemplaza el nombre por el tuyo)
open -a Simulator
xcrun simctl boot "iPhone 15"   # ignorar error si ya está arrancado

# Obtener el UDID (booted = el que está corriendo)
xcrun simctl list devices booted
```

Copia el UDID (formato `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`) a `IOS_UDID`
en `.env.movil.ios` si tu setup tiene varias versiones del mismo iPhone.

#### Device físico

```bash
# Confiar en el equipo desde el iPhone (Settings → Trust this computer)
idevice_id -l                      # imprime el UDID
xcrun devicectl list devices       # alternativa moderna
```

Conecta el iPhone con cable. La primera vez requiere desbloqueo + "Confiar".

### 6. Ejecutar la suite iOS

```bash
# Smoke (recomendado para validar que el setup quedó bien)
npm run test:movil:ios:smoke

# Suite completa
npm run test:movil:ios

# Filtros por tag
npm test -- --mode=movil --platform=ios --tags=@happy-path
TAGS="@regression and not @wip" npm run test:movil:ios
```

El orquestador (`scripts/run.mjs`) carga `.env.movil.ios`, lanza Appium 3
embebido (vía `@wdio/appium-service`) y ejecuta `configs/wdio.ios.conf.ts`.

### 7. Reportes

```bash
npm run serenity:report
# Abre: target/site/serenity/index.html
```

### 8. Troubleshooting iOS

| Síntoma | Causa probable | Acción |
|---|---|---|
| `xcrun: error: invalid active developer path` | Faltan Command Line Tools | `xcode-select --install` |
| `An unknown server-side error occurred while processing the command` al iniciar WDA | WDA sin firmar (device) | Configurar `IOS_XCODE_ORG_ID` y `IOS_WDA_BUNDLE_ID`. Abrir WebDriverAgent en Xcode y firmar manualmente |
| `Could not find a device with UDID '...'` | UDID inválido o simulador no booted | `xcrun simctl list devices booted` |
| `app installation failed` (Simulator) | Arquitectura del `.app` no compatible | Re-descargar con `npm run apps:download:ios --force` |
| `app installation failed` (Device) | `.ipa` no firmado para el device | Re-firmar el `.ipa` desde Xcode |
| Timeout al esperar elementos | Selectores no coinciden con el binario actual | Inspeccionar con Appium Inspector contra el simulador |
| Sesión de Serenity falla con `getWindowHandle` | — | Ya está mitigado en `wdio.shared.conf.ts` (workaround NATIVE_APP) |

### 9. Inspector (opcional, recomendado)

Para depurar selectores iOS:

```bash
# Appium Inspector standalone
brew install --cask appium-inspector
```

Apunta al servidor `http://127.0.0.1:4723/` con las mismas capabilities del
config y usa la sesión activa para ver el árbol XCUITest.

---

## Ejecución unificada

### Ejecutar un modo específico
npm test -- --mode=web
npm test -- --mode=web_movil

npm test -- --mode=movil --platform=android
npm test -- --mode=movil --platform=ios

npm test -- --mode=desktop
npm test -- --mode=api

### Atajos disponibles
npm run test:all
npm run test:web
npm run test:web_movil

npm run test:movil:android
npm run test:movil:ios

npm run test:desktop
npm run test:api

---

## Ejecución por tags (Cucumber)

Todos los `.feature` están etiquetados por canal y propósito. El orquestador
`scripts/run.mjs` acepta `--tags=...` o la variable `TAGS=...` y los reenvía a
WebdriverIO como `--cucumberOpts.tags=<expr>`.

### Convención de tags

| Tag | Significado |
|---|---|
| `@web`, `@mobile`, `@android`, `@ios`, `@api` | Canal o plataforma |
| `@smoke` | Subset crítico, ejecución rápida |
| `@regression` | Suite completa de regresión |
| `@happy-path`, `@negative` | Camino feliz / caso negativo |
| `@login`, `@form`, `@health-check`, `@post`, `@config` | Dominio funcional |

### Sintaxis de expresiones (Cucumber tag expressions)

- AND: `"@smoke and @web"`
- OR: `"@smoke or @regression"`
- NOT: `"@regression and not @wip"`
- Agrupación: `"(@smoke or @happy-path) and @api"`

### Ejemplos de uso

Pasando flag al orquestador:

npm test -- --mode=web --tags=@smoke
npm test -- --mode=api --tags="@regression and not @wip"
npm test -- --mode=movil --platform=android --tags=@happy-path
npm test -- --mode=all --tags=@smoke

Pasando por variable de entorno:

TAGS=@smoke npm run test:web
TAGS="@regression and not @wip" npm run test:api

### Atajos por tag

npm run test:smoke               # @smoke en todos los modos
npm run test:regression          # @regression en todos los modos
npm run test:web:smoke
npm run test:api:smoke
npm run test:movil:android:smoke
npm run test:movil:ios:smoke

---

## Ejecutar todos los modos
npm run test:all

Ejecuta en orden:
web → web_movil → movil → desktop → api

---

## Variables de entorno

### web
BROWSER=firefox npm test -- --mode=web

### web_movil
MOBILE_DEVICE="iPhone X" HEADLESS=true npm test -- --mode=web_movil

### movil
APP_PATH="C:/apps/app-debug.apk" npm test -- --mode=movil

### desktop
WINDOWS_APP="Microsoft.WindowsCalculator_8wekyb3d8bbwe!App" npm test -- --mode=desktop

### api
API_BASE_URL="https://httpbin.org" npm test -- --mode=api

---

## Reportes
npm run serenity:report

---

## Configuraciones

Ubicación: ./configs

Base:
- wdio.shared.conf.ts

Web:
- wdio.web.conf.ts
- wdio.web_mobile.conf.ts

Mobile:
- wdio.android.conf.ts
- wdio.ios.conf.ts

Otros:
- wdio.desktop.conf.ts
- wdio.api.conf.ts

---

## Principios QA (Screenplay)

- No POM tradicional
- Uso estricto de Screenplay Pattern
- Reutilización mediante Tasks / Interactions
- Aserciones mediante Questions + Expectations
- No usar APIs nativas de WebdriverIO
- No usar browser.pause()
- Sincronización con Wait.until(...)
- Uso de PageElement para UI Mapping

---

## Notas de arquitectura

- Separar dominios por canal
- Evitar duplicación
- Centralizar UI Mapping
- Usar archivos .env por contexto

---

## Mejoras pendientes en módulo mobile

Durante la consolidación del módulo mobile se identificaron las siguientes acciones completadas y mejoras pendientes:

- ✅ `DismissKeyboard.ts` migrado a `mobile/shared/Interactions/`
- ✅ `ScrollToBottomSafe.ts` migrado a `mobile/shared/Interactions/`
- ✅ `HomeTasks copy.ts` eliminado (placeholder sin implementación)
- ⚠️ `LoginTasks.ts` en mobile no usa `DismissKeyboard` entre campos de entrada — mejora pendiente para evitar que el teclado obstruya elementos
- ⚠️ `Mobile_login_steps.ts` contiene código comentado extenso — limpieza pendiente

---

## 📦 Comprimir el proyecto

### Respetando .gitignore (recomendado)
git ls-files --cached --others --exclude-standard -z | xargs -0 zip proyecto.zip

Incluye:
- archivos versionados
- archivos nuevos
- excluye lo ignorado

---

### Alternativa (mejor compresión)
git ls-files --cached --others --exclude-standard -z | tar --null -czf proyecto.tar.gz --files-from=-

---

### NO usar
zip -r proyecto.zip .

Porque:
- incluye node_modules
- incluye logs
- ignora .gitignore

---

## Recomendación final

- Usar siempre git ls-files
- No subir archivos sensibles (.env, keys)
- Preferir .tar.gz para proyectos grandes