import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
   
import { browser } from '@wdio/globals';

/**
 * Configuración base común para todos los perfiles.
 * - No incluye `capabilities` (se definen por perfil)
 * - Compatible con WebdriverIO v9
 */
export const sharedConfig:  WebdriverIOConfig  = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',
  specs: [],
  exclude: [],

  maxInstances: 1,
  logLevel: 'info',
  bail: 0,

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  capabilities:[],
  framework: '@serenity-js/webdriverio',
  serenity: {
        runner: 'cucumber',

        // Configure reporting services, see:
        //  https://serenity-js.org/handbook/reporting/
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
        ]
    },

   reporters: ['spec',
    ],

    cucumberOpts: {
           
        },
    /**
     * ⚠️ WORKAROUND MOBILE NATIVO (Appium + Serenity/JS)
     *
     * Contexto:
     * Serenity/JS, a través de `BrowseTheWebWithWebdriverIO`, asume un modelo
     * de navegación web basado en "window handles". Durante la resolución de
     * Questions (`PageElement`, `PageElements`, etc.), el framework invoca
     * internamente:
     *
     *   - browser.getWindowHandle()
     *   - browser.getWindowHandles()
     *
     * Problema:
     * En sesiones MOBILE NATIVE (Android / iOS con Appium),
     * los endpoints WebDriver:
     *
     *   GET /window
     *   GET /window/handles
     *
     * NO están soportados por el driver (o devuelven "unknown command"),
     * ya que el concepto de "ventana" aplica al contexto web, no a apps nativas.
     * Esto provoca fallos en tiempo de ejecución al evaluar Questions,
     * incluso cuando los selectores son correctos.
     *
     * Solución:
     * Se sobrescriben (overwriteCommand) los comandos `getWindowHandle` y
     * `getWindowHandles` a nivel de Browser scope, devolviendo un identificador
     * estable y válido cuando el backend no soporta dichos comandos.
     *
     * El valor de fallback:
     *   - Cumple el patrón requerido por Serenity/JS para CorrelationId
     *     (^[\\d.A-Za-z-]+$)
     *   - Evita el uso de "_" (underscore), que NO es aceptado
     *
     * Alcance:
     *   - SOLO se aplica en mobile (browser.isMobile === true)
     *   - NO afecta ejecuciones web
     *
     * Referencias:
     *   - Serenity/JS Mobile Testing Handbook
     *   - Limitaciones conocidas de Appium en contexto NATIVE_APP
     *
     * NOTA:
     * Este workaround es a nivel de framework y NO debe replicarse en Tasks,
     * Interactions ni Steps.
     */

   before: async function () {
    if (!browser?.isMobile) return;

    const isUnsupported = (error: any) => {
      const msg  = String(error?.message ?? '');
      const name = String(error?.name ?? '');
      return (
        name.includes('UnknownCommand') ||
        msg.includes('unknown command') ||
        msg.includes('window') ||
        msg.includes('window/handles') ||
        msg.includes('404')
      );
    };

    console.log('[PATCH] overwrite window commands for mobile');

    const b = browser as any;

    const FALLBACK_HANDLE = 'NATIVE-APP';

    b.overwriteCommand('getWindowHandle', async function (orig: any, ...args: any[]) {
    try {
        return await orig(...args);
    } catch (e: any) {
        if (isUnsupported(e)) return FALLBACK_HANDLE;
        throw e;
    }
    });

    b.overwriteCommand('getWindowHandles', async function (orig: any, ...args: any[]) {
    try {
        return await orig(...args);
    } catch (e: any) {
        if (isUnsupported(e)) return [FALLBACK_HANDLE];
        throw e;
    }
    });
  },

};
