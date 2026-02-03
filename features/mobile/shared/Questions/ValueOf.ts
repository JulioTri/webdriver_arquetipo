import { Question } from '@serenity-js/core';

export const ValueOf = (selector: string) =>
  Question.about<string>(`valor de ${ selector }`, async () => {
    const el = await browser.$(selector);
    await el.waitForExist({ timeout: 15_000 });

    // intentamos getText primero (EditText suele exponer ahí)
    const text = await el.getText().catch(() => '');
    if (text) return text;

    // fallback si aplica
    const value = await el.getValue().catch(() => '');
    return String(value ?? '');
  });
