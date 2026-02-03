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


const device = process.env.MOBILE_DEVICE ?? 'Pixel 7';

export const config: WebdriverIOConfig = merge(shared,{

  /**
   * Web en emulación móvil (Chrome DevTools mobile emulation)
   */
  capabilities: [
    {
      browserName: 'chrome',
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        mobileEmulation: { deviceName: device },
        args: process.env.HEADLESS === 'true'
          ? ['--headless=new', '--disable-gpu']
          : [],
      },
    },
  ],
});
