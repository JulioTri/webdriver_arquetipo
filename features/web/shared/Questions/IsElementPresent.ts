import { Answerable, Question } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

export class IsElementPresent {
    static for = (element: Answerable<PageElement>) =>
        Question.about<boolean>(
            'si el elemento está presente',
            async actor => {
                try {
                    const resolved = await actor.answer(element);
                    return await resolved.isPresent();
                } catch {
                    return false;
                }
            },
        );
}
