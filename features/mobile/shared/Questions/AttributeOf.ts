import { Question } from '@serenity-js/core';

export const AttributeOf = (name: string, selector: string) =>
  Question.about<string>(`atributo "${ name }" de ${ selector }`, async () => {
    const el = await browser.$(selector);
    await el.waitForExist({ timeout: 15_000 });
    const attr = await el.getAttribute(name);
    return String(attr ?? '');
  });
