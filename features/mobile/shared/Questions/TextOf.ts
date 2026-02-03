import { Question } from '@serenity-js/core';

export const TextOf = (selector: string) =>
  Question.about<string>(`texto de ${ selector }`, async () => {
    const el = await browser.$(selector);
    await el.waitForExist({ timeout: 15_000 });
    return el.getText();
  });
