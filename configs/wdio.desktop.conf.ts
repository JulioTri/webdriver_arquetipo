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
 * Desktop Windows (Appium Windows Driver / WinAppDriver compatible)
 * Requiere Appium 2 + driver de Windows instalado y Appium corriendo.
 *
 * WINDOWS_APP ejemplos:
 * - Calculator: Microsoft.WindowsCalculator_8wekyb3d8bbwe!App
 * - Ruta a exe (depende del driver): C:\\Path\\App.exe
 */
export const config: WebdriverIOConfig = merge(shared,{

  services: [],

  capabilities: [
    {
      platformName: 'Windows',
      'appium:automationName': 'Windows',
      'appium:deviceName': 'WindowsPC',
      'appium:app': process.env.WINDOWS_APP ?? 'Microsoft.WindowsCalculator_8wekyb3d8bbwe!App',
      'appium:newCommandTimeout': 120,
    },
  ],
});
