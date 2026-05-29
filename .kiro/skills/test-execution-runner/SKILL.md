---
name: test-execution-runner
description: Ejecutar suites de pruebas del proyecto usando el orquestador scripts/run.mjs, gestionar variables de entorno por modo (.env.web, .env.api, .env.movil.android, .env.movil.ios), seleccionar la configuración wdio correcta según --mode y --platform, y manejar el ciclo de vida de Appium/WebDriver. Usar cuando se necesite correr tests, depurar fallos de ejecución, agregar un nuevo modo de ejecución, o configurar variables de entorno.
---

# Skill: Ejecución de tests y orquestación

## Comando principal

```bash
npm test                              # default: --mode=web
node ./scripts/run.mjs --mode=<m> [--platform=<p>]
```

El orquestador `scripts/run.mjs`:
1. Lee `--mode` y `--platform` (o variables `MODE` / `MOBILE_PLATFORM`)
2. Carga el `.env.*` correspondiente con `dotenv`
3. Ejecuta `npx wdio run <config>` con el config mapeado
4. Genera el reporte con `npx serenity-bdd run --features ./features`

---

## Tabla de modos → config → env

| Comando npm | Mode | Platform | Config | .env file |
|---|---|---|---|---|
| `npm run test:web` | `web` | — | `configs/wdio.web.conf.ts` | `.env.web` |
| `npm run test:web_movil` | `web_movil` | — | `configs/wdio.web_mobile.conf.ts` | `.env.web_movil` |
| `npm run test:movil:android` | `movil` | `android` | `configs/wdio.android.conf.ts` | `.env.movil.android` |
| `npm run test:movil:ios` | `movil` | `ios` | `configs/wdio.ios.conf.ts` | `.env.movil.ios` |
| `npm run test:api` | `api` | — | `configs/wdio.api.conf.ts` | `.env.api` |
| `npm run test:desktop` | `desktop` | — | `configs/wdio.desktop.conf.ts` | `.env` |
| `npm run test:all` | `all` | (android default) | secuencial todos los anteriores | varios |

**Regla:** Si pasas `--mode=movil` SIN `--platform`, el script aborta con código 2.

---

## Variables de entorno por archivo

### `.env` (base, siempre cargado si no hay otro)
```
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_BASE_PATH=/
NO_RESET=true
```

### `.env.api`
```
API_BASE_URL=https://httpbin.org   # consumido por wdio.api.conf.ts → baseUrl
```

### `.env.web`
```
BROWSER=chrome | firefox | edge
HEADLESS=true | false
APP_USER=<usuario>
APP_PASSWORD=<clave>
APP_URL=<url base de la app web>
```

### `.env.movil.android`
```
MOBILE_PLATFORM=android
ANDROID_UDID=emulator-5554
ANDROID_DEVICE_NAME=Android Device
ANDROID_APP_PATH=./apps/android/app.apk
ANDROID_APP_PACKAGE=<package>
ANDROID_APP_ACTIVITY=<activity>
ANDROID_PLATFORM_VERSION=14
```

### `.env.movil.ios`
```
MOBILE_PLATFORM=ios
IOS_UDID=<udid real>
IOS_DEVICE_NAME=iPhone
IOS_PLATFORM_VERSION=18.5
IOS_APP_PATH=./apps/ios/app.ipa
IOS_XCODE_ORG_ID=<team id>
IOS_WDA_BUNDLE_ID=<wda bundle id>
IOS_APP_BUNDLE_ID=<app bundle id>
```

### Reglas de variables
- **NO commitear credenciales reales** — usar valores mock/enmascarados
- `MOBILE_PLATFORM` lo usa `PlatformUI.login()` para escoger Android vs iOS
- `process.env.PLATFORM` se evita como "modo" porque colisiona con `--mode`

---

## Flujo de selección del orquestador

```
node scripts/run.mjs --mode=<m> [--platform=<p>]
   │
   ├── mode=web         → .env.web         → wdio.web.conf.ts
   ├── mode=web_movil   → .env.web_movil   → wdio.web_mobile.conf.ts
   ├── mode=api         → .env.api         → wdio.api.conf.ts
   ├── mode=movil + platform=android → .env.movil.android → wdio.android.conf.ts
   ├── mode=movil + platform=ios     → .env.movil.ios     → wdio.ios.conf.ts
   ├── mode=desktop     → .env             → wdio.desktop.conf.ts
   └── mode=all         → secuencial: web, web_movil, movil(android), desktop, api
```

Tras ejecutar wdio, **siempre** corre `serenity-bdd run --features ./features` para generar el reporte.

---

## Appium (mobile)

El `wdio.android.conf.ts` y `wdio.ios.conf.ts` usan `@wdio/appium-service` que arranca Appium como child process automáticamente:

```typescript
services: [
  ['appium', {
    logPath: './logs/appium',
    args: {
      address: process.env.APPIUM_HOST ?? '127.0.0.1',
      port: Number(process.env.APPIUM_PORT ?? 4723),
      basePath: process.env.APPIUM_BASE_PATH ?? '/',   // Appium 3 usa '/' (no '/wd/hub')
    },
  }],
],
```

**Pre-requisitos antes de correr mobile:**
1. Emulador/dispositivo levantado (Android emulator running o iPhone conectado)
2. Drivers instalados: `appium driver list`
   - `appium-uiautomator2-driver` (Android)
   - `appium-xcuitest-driver` (iOS)
3. App compilada en `ANDROID_APP_PATH` o `IOS_APP_PATH`
4. Para iOS real: WDA firmado con `IOS_XCODE_ORG_ID` y `IOS_WDA_BUNDLE_ID`

---

## Cómo agregar un nuevo modo

1. **Crear `.env.<nuevo_modo>`** con las variables específicas
2. **Crear `configs/wdio.<nuevo_modo>.conf.ts`** que herede de `sharedConfig`:
   ```typescript
   import { sharedConfig as shared } from './wdio.shared.conf';
   const merge = (base, extra) => ({ ...base, ...extra, serenity: { ...base.serenity, ...extra.serenity } });
   export const config = merge(shared, {
     specs: ['../features/<modulo>/Features/*.feature'],
     // capabilities, cucumberOpts, reporters, etc.
   });
   ```
3. **Agregar el mapping** en `scripts/run.mjs`:
   ```javascript
   const modeToConfig = {
     // existentes...
     <nuevo_modo>: './configs/wdio.<nuevo_modo>.conf.ts',
   };

   if (mode === '<nuevo_modo>') envFile = '.env.<nuevo_modo>';
   ```
4. **Agregar el script npm** en `package.json`:
   ```json
   "test:<nuevo_modo>": "node ./scripts/run.mjs --mode=<nuevo_modo>"
   ```

---

## Comandos utilitarios del proyecto

```bash
# Reportes
npm run serenity:update    # descarga el JAR de Serenity BDD si falta
npm run serenity:report    # regenera el reporte sin re-correr tests
npm run serenity:clean     # limpia ./target

# Diagnóstico mobile
npx appium driver list                          # ver drivers instalados
npx appium driver install uiautomator2          # instalar driver Android
npx appium driver install xcuitest              # instalar driver iOS
adb devices                                     # listar dispositivos Android
xcrun xctrace list devices                      # listar dispositivos iOS

# Diagnóstico WDIO
npx wdio --version                              # versión wdio
npx wdio config                                 # wizard de config (NO usar, ya hay configs)
```

---

## Salidas y artefactos

| Ruta | Generado por | Contiene |
|---|---|---|
| `target/site/serenity/index.html` | `serenity-bdd run` | Reporte HTML final |
| `target/site/serenity/*.json` | `ArtifactArchiver` | Resultados crudos por escenario |
| `allure-results/` | `@wdio/allure-reporter` (web) | Datos Allure |
| `reports/cucumber-report.json` | `cucumberOpts.format` | Cucumber JSON |
| `logs/appium/` | `@wdio/appium-service` | Logs de Appium |

---

## Anti-patrones de ejecución

- ❌ Correr `wdio` directo sin pasar por `run.mjs` (no carga el `.env.*` correcto)
- ❌ Usar `process.env.PLATFORM` como modo en scripts
- ❌ Commitear `.env.*` con credenciales reales
- ❌ Modificar `cucumberOpts.timeout` para enmascarar flakiness
- ❌ Lanzar `npm test:movil` sin `--platform` → falla con código 2
- ❌ Usar Appium basePath `/wd/hub` en Appium 3 (debe ser `/`)
- ❌ Instalar drivers Appium dentro del repo (deben ir en el global de Appium)

---

## Diagnóstico de fallos comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `[ENV] usando valores por defecto` | Modo mal escrito o `.env.<m>` faltante | Verificar nombre del archivo y argumento `--mode` |
| `Modo "movil" requiere --platform` | Falta flag de plataforma | Agregar `--platform=android` o `ios` |
| `unknown driver` en Appium | Driver no instalado | `npx appium driver install <driver>` |
| Tests web pasan local pero no en CI | `HEADLESS=false` en local, headless implícito en CI | Forzar `HEADLESS=true` y usar `--headless=new` |
| `connect ECONNREFUSED 127.0.0.1:4723` | Appium no arrancó | Verificar `services: ['appium', ...]` en config |
| Chrome no abre / DevToolsActivePort | Falta `--no-sandbox` o usuario no tiene permisos | Ya está en `wdio.web.conf.ts` |
| iOS WDA falla al instalar | Cert/team ID inválidos | Validar `IOS_XCODE_ORG_ID` y firmar WDA con Xcode |
| `app not found` Android | Path relativo mal resuelto | Usar `path.resolve(...)` (ya hecho en `wdio.android.conf.ts`) |

---

## Checklist antes de ejecutar

- [ ] El `.env.*` correspondiente existe y tiene los valores necesarios
- [ ] (Mobile) emulador/dispositivo levantado
- [ ] (Mobile) drivers Appium instalados globalmente
- [ ] (iOS) certificados y team ID configurados
- [ ] (Web) navegador con versión compatible con WebDriver instalada
- [ ] La carpeta `target/` no tiene resultados viejos que confundan el reporte (`npm run serenity:clean`)
- [ ] Si vas a correr `--mode=all`, hay tiempo suficiente y todos los entornos listos
