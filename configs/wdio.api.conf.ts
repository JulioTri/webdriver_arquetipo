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


/**
 * Services / API
 * Nota: WebdriverIO requiere capabilities. Para mantener un solo runner/stack,
 * ejecutamos en modo headless y nos enfocamos en features/steps de API (Serenity/JS REST).
 *
 * Si quieres 0 navegador real, podemos migrar este perfil a ejecución directa con Cucumber
 * (sin WDIO). Se puede hacer, pero depende de tu pipeline actual.
 */
export const config: WebdriverIOConfig = merge(shared,{

  specs: ['./features/api/**/*.feature'],

  capabilities: [
    {
      browserName: 'chrome',
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: ['--headless=new', '--disable-gpu'],
      },
    },
  ],
});
