import { Question } from '@serenity-js/core';

export const IsVisible = (selector: string) =>
  Question.about<boolean>(`si ${ selector } está visible`, async () => {
    const el = await browser.$(selector);
    return el.isDisplayed().catch(() => false);
  });
