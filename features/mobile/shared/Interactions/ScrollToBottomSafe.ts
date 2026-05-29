// features/mobile/shared/interactions/ScrollToBottomSafe.ts
import { Interaction } from '@serenity-js/core';
import { browser } from '@wdio/globals';

type Options = {
  maxSwipes?: number;

  /** zona inferior a evitar (teclado/CTA). 0.65 = no tocar el 35% inferior */
  safeBottomRatio?: number;

  /** zona superior mínima (evita notch/status). 0.15 = empieza debajo del 15% superior */
  safeTopRatio?: number;

  /** x en % del ancho */
  xRatio?: number;

  /** pausa del gesto */
  pressMs?: number;

  /** stop cuando pageSource no cambie */
  stableTriesToStop?: number;

  /** intenta cerrar teclado al inicio (Android) */
  tryDismissKeyboard?: boolean;
};

export const ScrollToBottomSafe = (options: Options = {}) => {
  const cfg = {
    maxSwipes: options.maxSwipes ?? 15,
    safeBottomRatio: options.safeBottomRatio ?? 0.62,  // 👈 clave: evita teclado
    safeTopRatio: options.safeTopRatio ?? 0.18,
    xRatio: options.xRatio ?? 0.50,
    pressMs: options.pressMs ?? 120,
    stableTriesToStop: options.stableTriesToStop ?? 2,
    tryDismissKeyboard: options.tryDismissKeyboard ?? true,
  };

 

  const swipeUpOnceInSafeArea = async () => {
    const rect = await browser.getWindowRect();

    const x = Math.floor(rect.width * cfg.xRatio);

    // Definimos un "corredor" vertical seguro:
    // top = safeTopRatio del alto
    // bottom = safeBottomRatio del alto (por arriba del teclado)
    const safeTop = Math.floor(rect.height * cfg.safeTopRatio);
    const safeBottom = Math.floor(rect.height * cfg.safeBottomRatio);

    // Swipe: empezar cerca del safeBottom y terminar cerca del safeTop
    const startY = Math.floor(safeTop + (safeBottom - safeTop) * 0.85);
    const endY   = Math.floor(safeTop + (safeBottom - safeTop) * 0.15);

    await browser
      .action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y: startY })
      .down()
      .pause(cfg.pressMs)
      .move({ x, y: endY })
      .up()
      .perform();
  };

  const perform = async () => {
  
    let previousSource = '';
    let stableCount = 0;

    for (let i = 0; i < cfg.maxSwipes; i++) {
      const currentSource = await browser.getPageSource();

      if (currentSource === previousSource) {
        stableCount += 1;
        if (stableCount >= cfg.stableTriesToStop) return;
      } else {
        stableCount = 0;
      }

      previousSource = currentSource;
      await swipeUpOnceInSafeArea();
    }
  };

  return Interaction.where(`#actor se desplaza hasta el final evitando el teclado`, perform);
};
