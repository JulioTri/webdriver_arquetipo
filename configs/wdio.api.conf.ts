import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { sharedConfig as shared } from './wdio.shared.conf';

const merge = (
  base: WebdriverIOConfig,
  extra: Partial<WebdriverIOConfig>,
): WebdriverIOConfig => ({
  ...base,
  ...extra,
  serenity: { ...base.serenity, ...extra.serenity },
});

export const config: WebdriverIOConfig = merge(shared, {
  specs: ['../features/api/Features/*.feature'],

  /**
   * Importante:
   * Serenity/JS + WebdriverIO usa este baseUrl
   * para configurar CallAnApi automáticamente.
   */
  baseUrl: process.env.API_BASE_URL,

  capabilities: [
    {
      browserName: 'chrome',
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: ['--headless=new', '--disable-gpu'],
      },
    },
  ],

  cucumberOpts: {
    require: [
      './features/support/**/*.ts',
      './features/step-definitions/api/**/*.ts',
    ],
    timeout: 60_000,
  },
});