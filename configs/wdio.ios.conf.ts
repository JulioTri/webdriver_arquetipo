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

  capabilities: [{
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME ?? 'iPhone 15',
    'appium:udid': process.env.IOS_UDID,
    'appium:app': path.resolve(process.env.IOS_APP_PATH ?? './apps/ios/app.app'),

    'appium:newCommandTimeout': 180,
    'appium:noReset': false,
  }],
});
