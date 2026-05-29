import { Answerable, Duration, Task, Wait } from '@serenity-js/core';
import { PageElement, Select, isVisible } from '@serenity-js/web';

export class SelectNativeOptionByText {
    static of = (text: string) => ({
        from: (element: Answerable<PageElement>) =>
            Task.where(
                `#actor selecciona la opción "${ text }"`,
                Wait.upTo(Duration.ofSeconds(10)).until(
                    element,
                    isVisible(),
                ),
                Select.option(text).from(element),
            ),
    });
}
