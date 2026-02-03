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


  /**
   * App nativa móvil (Appium)
   * Requiere Appium 2 y el driver correspondiente (Android: uiautomator2 / iOS: xcuitest)
   */
  services: ['appium'],

  capabilities: [
    {
      platformName: process.env.MOBILE_PLATFORM ?? 'Android',

      // Android defaults
      'appium:automationName': process.env.MOBILE_AUTOMATION_NAME ?? 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '14',

      // Native App (APK/IPA)
      'appium:app': process.env.APP_PATH,

      // timeouts
      'appium:newCommandTimeout': 120,
    },
  ],
});
