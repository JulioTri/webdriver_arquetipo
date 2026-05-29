import path from 'node:path';
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { sharedConfig as shared } from "./wdio.shared.conf";

const merge = (
  base: WebdriverIOConfig,
  extra: Partial<WebdriverIOConfig>,
): WebdriverIOConfig => ({
  ...base,
  ...extra,
  serenity: { ...base.serenity, ...extra.serenity },
});

export const config: WebdriverIOConfig = merge(shared,{

  specs: ['../features/mobile/ios/Features/Login.feature'],
  exclude: [],
  services: [
    ['appium', {
      logPath: './logs/appium',
      args: {
        address: process.env.APPIUM_HOST ?? '127.0.0.1',
        port: Number(process.env.APPIUM_PORT ?? 4723),
        basePath: process.env.APPIUM_BASE_PATH ?? '/',
      },
    }],
  ],

  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: process.env.APPIUM_BASE_PATH ?? '/',

  // La primera compilación de WebDriverAgent (WDA) en simulador puede tardar
  // 2–4 minutos. Subimos los timeouts del cliente WDIO para no abortar antes.
  connectionRetryTimeout: 360_000,
  connectionRetryCount: 0,

  capabilities: [{
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME ?? 'iPhone',
    'appium:udid': process.env.IOS_UDID,
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION,
    // Ruta absoluta al .app (Simulator) o .ipa (device).
    // Si IOS_APP_PATH está vacío, Appium intentará usar bundleId con la app
    // ya instalada en el dispositivo.
    ...(process.env.IOS_APP_PATH
      ? { 'appium:app': path.resolve(process.cwd(), process.env.IOS_APP_PATH) }
      : {}),
    'appium:newCommandTimeout': 180,
    'appium:noReset': false,
    // Tiempos generosos para compilar/levantar WDA la primera vez.
    'appium:wdaLaunchTimeout': 240_000,
    'appium:wdaConnectionTimeout': 240_000,
    'appium:wdaStartupRetries': 2,
    'appium:wdaStartupRetryInterval': 10_000,
    // Mostrar log de xcodebuild para depurar fallas de WDA.
    'appium:showXcodeLog': true,
    // Re-firma WDA SOLO si se proporcionan explícitamente las variables del Team.
    // En simulador NO se debe enviar updatedWDABundleId / xcodeOrgId.
    ...(process.env.IOS_WDA_BUNDLE_ID
      ? { 'appium:updatedWDABundleId': process.env.IOS_WDA_BUNDLE_ID }
      : {}),
    ...(process.env.IOS_XCODE_ORG_ID
      ? {
          'appium:xcodeOrgId': process.env.IOS_XCODE_ORG_ID,
          'appium:xcodeSigningId': 'iPhone Developer',
        }
      : {}),
    // bundleId es opcional cuando se proporciona `app`: Appium lo extrae del binario.
    ...(process.env.IOS_APP_BUNDLE_ID
      ? { 'appium:bundleId': process.env.IOS_APP_BUNDLE_ID }
      : {}),
  }],

  cucumberOpts: {
    // <string[]> (file/dir) require files before executing features
    import: [
      "./features/step-definitions/mobile/*.ts",
      "./features/support/*.ts",
    ],
    // <string[]> (type[:path]) specify native Cucumber.js output format, if needed. Optionally supply PATH to redirect formatter output (repeatable)
    format: ["json:./reports/cucumber-report.json"],
    // <string> (name) specify the profile to use
    profile: "",
    // <boolean> fail if there are any undefined or pending steps
    strict: false,
    // <string[] | string> (expression) only execute the features or scenarios with tags matching the expression
    tags: [],
    // <number> timeout for step definitions
    timeout: 60000,
  },

  after: async function () {
    if (process.env.PLATFORM === 'mobile') {
      // NO dejar que Serenity intente cerrar la sesión
      return;
    }
  }
});
