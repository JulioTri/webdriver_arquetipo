import { Question } from '@serenity-js/core';
import { TextOf } from './TextOf';

export const NormalizedText = (selector: string) =>
  Question.about<string>(`texto normalizado de ${ selector }`, async actor => {
    const text = await actor.answer(TextOf(selector));
    return text.trim().replace(/\s+/g, ' ').toLowerCase();
  });
