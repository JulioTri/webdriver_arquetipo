# Apps de prueba (binarios)

Esta carpeta almacena los binarios de las apps demo usadas por las suites de
pruebas mobile. **Los binarios NO se versionan** (ver `.gitignore`).

## Apps usadas por defecto

| Plataforma | Archivo | Origen |
|---|---|---|
| Android | `android/SauceLabs-Demo-App.apk` | [saucelabs/my-demo-app-android releases](https://github.com/saucelabs/my-demo-app-android/releases) |
| iOS Simulator | `ios/SauceLabs-Demo-App.app` (extraído de `.zip`) | [saucelabs/my-demo-app-ios releases](https://github.com/saucelabs/my-demo-app-ios/releases) |
| iOS Device | `ios/SauceLabs-Demo-App.ipa` | [saucelabs/my-demo-app-ios releases](https://github.com/saucelabs/my-demo-app-ios/releases) |

> Estas apps son demos oficiales de Sauce Labs publicadas para fines de
> automatización con licencia abierta (consultar repos para licencia exacta).

## Descarga automática

Desde la raíz del proyecto:

```bash
npm run apps:download
```

El script `scripts/download-apps.mjs` consulta la API de GitHub Releases y
descarga el último release oficial publicado.

## ⚠️ iOS en dispositivo real

El `.ipa` publicado por Sauce Labs **no se puede instalar tal cual en un iPhone
físico** sin re-firmarlo con un Apple Developer Account válido. Para device:

1. Clona [saucelabs/my-demo-app-ios](https://github.com/saucelabs/my-demo-app-ios).
2. Abre en Xcode, configura tu Team ID en Signing & Capabilities.
3. Compila y exporta el `.ipa` firmado a `./apps/ios/`.

Para iOS Simulator no se requiere firma: basta el `.app` extraído.
