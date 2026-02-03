import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { sharedConfig as shared } from "./wdio.shared.conf";
import { browser } from '@wdio/globals';

const merge = (
  base: WebdriverIOConfig,
  extra: Partial<WebdriverIOConfig>,
): WebdriverIOConfig => ({
  ...base,
  ...extra,
  serenity: { ...base.serenity, ...extra.serenity },
});

export const config: WebdriverIOConfig = merge(shared,{

  specs: ['../features/mobile/android/Features/Android/Login.feature'],
  exclude: [],

  // Appium service inicia Appium como child process :contentReference[oaicite:5]{index=5}
  services: [
    ['appium', {
      logPath: './logs/appium',
      args: {
        address: process.env.APPIUM_HOST ?? '127.0.0.1',
        port: Number(process.env.APPIUM_PORT ?? 4723),
        // Appium 3: normalmente base path recomendado es '/' (no /wd/hub)
        basePath: process.env.APPIUM_BASE_PATH ?? '/',
      },
    }],
  ],

  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: process.env.APPIUM_BASE_PATH ?? '/',

  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator',
    'appium:udid': process.env.ANDROID_UDID,
    //'appium:app': path.resolve(process.env.ANDROID_APP_PATH ?? './apps/android/app.apk'),
    'appium:appPackage':process.env.ANDROID_APP_PACKAGE,
    'appium:appActivity':process.env.ANDROID_APP_ACTIVITY,

    // estabilidad
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 180,
    'appium:noReset': false,
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

})
