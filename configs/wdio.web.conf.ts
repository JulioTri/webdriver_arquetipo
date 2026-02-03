import type { WebdriverIOConfig } from "@serenity-js/webdriverio";
import { sharedConfig as shared } from "./wdio.shared.conf";

const merge = (
  base: WebdriverIOConfig,
  extra: Partial<WebdriverIOConfig>,
): WebdriverIOConfig => ({
  ...base,
  ...extra,
  serenity: { ...base.serenity, ...extra.serenity },
});

export const config: WebdriverIOConfig = merge(shared, {
  //WEB
  specs: ["../features/Dislicores/Features/Home.feature"],
  exclude: [],
  serenity: {
    crew: [
      // hereda crew base:
      ...(shared.serenity?.crew ?? []),

      // ✅ SOLO web: Photographer (esto en mobile te rompe por window handle)
      [
        "@serenity-js/web:Photographer",
        {
          // strategy: 'TakePhotosOfFailures'  // fast execution, screenshots only when tests fail
          strategy: "TakePhotosOfInteractions", // slower execution, more comprehensive reports
        },
      ],
    ],
  },

  reporters: ['spec',
      ['allure', {outputDir: 'allure-results'}],
      'json',
      ['video', {
          saveAllVideos: true,               // Guardar todos los videos, no solo los fallidos
          videoSlowdownMultiplier: 1,        // Controla la velocidad del video, 1 es tiempo real
          outputDir: 'allure-results',   // Directorio para guardar videos
          addConsoleLogs: true,              // Añadir logs de consola al video
      }],
  ],

  /**
   * Web desktop (navegadores)
   * Ejecuta por defecto en Chrome, pero puedes cambiar con BROWSER=firefox|edge|chrome
   */
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          "--start-maximized",
          "--disable-infobars",
          "--disable-extensions",
          "--disable-blink-features=AutomationControlled",
          "--disable-gpu",
          "--no-sandbox",
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        ],
      },
      acceptInsecureCerts: true,
    },
  ],

  cucumberOpts: {
    // <string[]> (file/dir) require files before executing features
    import: [
      "./features/step-definitions/*.ts",
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

  before: async function () {
    // ✅ si shared tenía before, ejecútalo también
    if (typeof shared.before === "function") {
      await shared.before.apply(this, arguments as any);
    }

    // ✅ Web-only: ahora sí puedes usar window/execute
    // await browser.maximizeWindow();

    // Ejemplo (si lo usas):
    // await browser.execute(() => { /* ... */ });
  },
});
