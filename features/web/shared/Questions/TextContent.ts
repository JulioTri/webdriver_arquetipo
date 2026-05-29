import { Answerable, Question } from '@serenity-js/core';
import { PageElement, Text } from '@serenity-js/web';

export class TextContent {
  static of = (element: Answerable<PageElement>) =>
    Question.about<string>(
      `el texto del elemento`,
      async actor => {
        const resolved = await actor.answer(element);          // <-- resuelve MetaQuestionAdapter/PageElement/etc.
        return await Text.of(resolved).answeredBy(actor);      // <-- Text.of ahora recibe PageElement puro
      },
    );
}
