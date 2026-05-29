import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { config as web } from './wdio.web.conf';

const merge = (
  base: WebdriverIOConfig,
  extra: Partial<WebdriverIOConfig>,
): WebdriverIOConfig => ({
  ...base,
  ...extra,
  serenity: {
    ...base.serenity,
    ...extra.serenity,
  },
  cucumberOpts: {
    ...base.cucumberOpts,
    ...extra.cucumberOpts,
  },
});

const device = process.env.MOBILE_DEVICE ?? 'Pixel 7';
const headless = process.env.HEADLESS === 'true';

export const config: WebdriverIOConfig = merge(web, {
  capabilities: [
    {
      browserName: 'chrome',
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        mobileEmulation: {
          deviceName: device,
        },
        args: headless
          ? ['--headless=new', '--disable-gpu']
          : [],
      },
      acceptInsecureCerts: true,
    },
  ],
});