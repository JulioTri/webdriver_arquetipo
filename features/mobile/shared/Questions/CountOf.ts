import { Question } from '@serenity-js/core';

export const CountOf = (selector: string) =>
  Question.about<number>(`cantidad de elementos para selector: ${ selector }`, async () => {
    const elements = await browser.$$(selector);
    return elements.length;
  });
