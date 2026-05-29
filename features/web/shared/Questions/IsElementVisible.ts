import { Answerable, Question } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

export class IsElementVisible {
    static for = (element: Answerable<PageElement>) =>
        Question.about<boolean>(
            'si el elemento es visible',
            async actor => {
                const resolved = await actor.answer(element);

                try {
                    return await resolved.isVisible();
                } catch {
                    return false;
                }
            },
        );
}
