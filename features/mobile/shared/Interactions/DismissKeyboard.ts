// features/mobile/shared/Interactions/DismissKeyboard.ts
import { Interaction } from '@serenity-js/core';
import { browser } from '@wdio/globals';

type Options = {
  /**
   * Selector visible fuera del input para cerrar teclado en iOS
   * Ej: botón Continuar / Ingresar / contenedor principal
   */
  tapOutsideSelector?: string;

  /**
   * Solo Android: usar back() como último recurso
   */
  allowBackFallback?: boolean;

  /**
   * Intentar pulsar una tecla del teclado en iOS como fallback
   */
  iosKeyFallbacks?: Array<'Done' | 'Return' | 'Go' | 'Next'>;
};

export const DismissKeyboard = (options: Options = {}) => {
  const cfg = {
    tapOutsideSelector: options.tapOutsideSelector,
    allowBackFallback: options.allowBackFallback ?? false,
    iosKeyFallbacks: options.iosKeyFallbacks ?? ['Done', 'Return', 'Go', 'Next'],
  };

  const isIOS = () =>
    String(browser.capabilities.platformName ?? '').toLowerCase() === 'ios';

  const isAndroid = () =>
    String(browser.capabilities.platformName ?? '').toLowerCase() === 'android';

  const tryHideKeyboard = async (): Promise<boolean> => {
    try {
      // Appium/WebdriverIO command
      // @ts-ignore
      if (typeof browser.hideKeyboard === 'function') {
        // @ts-ignore
        await browser.hideKeyboard();
        return true;
      }
    } catch {
      // ignore
    }

    try {
      await browser.execute('mobile: hideKeyboard');
      return true;
    } catch {
      // ignore
    }

    return false;
  };

  const tryTapOutside = async (): Promise<boolean> => {
    if (!cfg.tapOutsideSelector) {
      return false;
    }

    try {
      const element = await browser.$(cfg.tapOutsideSelector);

      if (await element.isDisplayed()) {
        await element.click();
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  };

  const tryIOSKeyboardKeys = async (): Promise<boolean> => {
    for (const key of cfg.iosKeyFallbacks) {
      try {
        await browser.keys(key);
        return true;
      } catch {
        // try next
      }
    }

    return false;
  };

  const perform = async () => {
    if (isAndroid()) {
      if (await tryHideKeyboard()) return;

      if (cfg.allowBackFallback) {
        try {
          await browser.back();
          return;
        } catch {
          // ignore
        }
      }

      return;
    }

    if (isIOS()) {
      // 1. intentar comando estándar
      if (await tryHideKeyboard()) return;

      // 2. tap en un elemento seguro fuera del input
      if (await tryTapOutside()) return;

      // 3. fallback por tecla del teclado
      if (await tryIOSKeyboardKeys()) return;

      return;
    }

    // fallback genérico
    await tryHideKeyboard();
  };

  return Interaction.where(
    `#actor oculta el teclado`,
    perform,
  );
};