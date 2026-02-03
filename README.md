# Framework QA Multi-Plataforma (WebdriverIO v9 + Serenity/JS + Screenplay)

## Descripción breve
Framework de automatización **end-to-end y de servicios** construido con **TypeScript**, **WebdriverIO v9** y **Serenity/JS** siguiendo el **patrón Screenplay** (Actors, Tasks, Interactions, Questions y UI).  
Permite ejecutar pruebas desde un **solo repositorio** para:

- 🌐 **web**: navegadores desktop
- 📱 **web_movil**: navegador en modo móvil (emulación)
- 🤖 **movil**: aplicaciones **nativas Android / iOS** (Appium 3)
- 🖥️ **desktop**: aplicaciones Windows (Appium Windows)
- 🔌 **api**: pruebas de APIs (Serenity/JS REST)

---

## Requisitos

### Base
- **Node.js 20.19+** (requerido por Appium 3)
- **npm 10+**
- **Java 11+** (Serenity BDD CLI)

### Móvil nativo (Appium 3)
- Appium 3
- Android SDK
- Xcode (iOS)

Drivers Appium (instalar una sola vez por entorno):
```bash
appium driver install uiautomator2
appium driver install xcuitest
```
Instalación:
```bash
npm install
```

> Nota: En WDIO v9 se recomienda `tsx` para ejecutar TypeScript (ya está incluido como devDependency).

---

## Ejecución unificada (un solo comando)

### Ejecutar un modo específico
Puedes ejecutar un modo con **un solo comando**:

```bash
npm test -- --mode=web
npm test -- --mode=web_movil
npm test -- --mode=movil --platform=android
npm test -- --mode=movil --platform=ios
npm test -- --mode=desktop
npm test -- --mode=api
```

También tienes atajos:
```bash
npm run test:all
npm run test:web
npm run test:web_movil
npm run test:movil:android
npm run test:movil:ios
npm run test:desktop
npm run test:api
```

### Ejecutar todos los modos (secuencial)
```bash
npm run test:all
```

> Este comando ejecuta en orden: `web → web_movil → movil → desktop → api` y luego genera el reporte.

---

## Variables de entorno por modo

### web
- `BROWSER`: `chrome` (default) | `firefox` | `edge`

Ejemplo:
```bash
BROWSER=firefox npm test -- --mode=web
```

### web_movil (emulación)
- `MOBILE_DEVICE`: nombre del device de Chrome DevTools (default: `Pixel 7`)
- `HEADLESS`: `true` para headless (opcional)

Ejemplo:
```bash
MOBILE_DEVICE="iPhone X" HEADLESS=true npm test -- --mode=web_movil
```

### movil (nativa con Appium)
- `APP_PATH`: ruta al APK/IPA
- `MOBILE_PLATFORM`: `Android` (default) | `iOS`
- `ANDROID_DEVICE_NAME`: default `Android Emulator`
- `ANDROID_PLATFORM_VERSION`: default `14`

Ejemplo:
```bash
APP_PATH="C:/apps/app-debug.apk" ANDROID_DEVICE_NAME="Android Emulator" ANDROID_PLATFORM_VERSION="14" npm test -- --mode=movil
```

### desktop (Windows)
- `WINDOWS_APP`: app id o ruta a exe  
  Default: `Microsoft.WindowsCalculator_8wekyb3d8bbwe!App`

Ejemplo:
```bash
WINDOWS_APP="Microsoft.WindowsCalculator_8wekyb3d8bbwe!App" npm test -- --mode=desktop
```

### api (services)
- `API_BASE_URL`: base URL del servicio (útil en tus Steps/Tasks de Serenity/JS REST)

Ejemplo:
```bash
API_BASE_URL="https://httpbin.org" npm test -- --mode=api
```

---

## Reportes
El runner unificado genera el reporte al final. Si deseas generarlo manualmente:

```bash
npm run serenity:report
```

---

## Configuraciones (perfiles)
Las configuraciones están en `./configs`:

- `wdio.shared.conf.ts` (común, **sin capabilities**)
- `wdio.web.conf.ts`
- `wdio.web_mobile.conf.ts`
- `wdio.android.conf.ts`
- `wdio.ios.conf.ts`
- `wdio.desktop.conf.ts`
- `wdio.api.conf.ts`

---

## Principios QA (Screenplay)
- ✅ No POM tradicional
- ✅ Reutilización mediante **Tasks/Interactions**
- ✅ Aserciones como **Questions**
- ❌ No `browser.pause()`
- ✅ Esperas inteligentes y estables

---
