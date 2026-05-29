import { Answerable, Duration, Task, Wait } from '@serenity-js/core';
import { PageElement, Select, isVisible } from '@serenity-js/web';

export class SelectNativeOptionByValue {
    static of = (value: string) => ({
        from: (element: Answerable<PageElement>) =>
            Task.where(
                `#actor selecciona la opción con valor "${ value }"`,
                Wait.upTo(Duration.ofSeconds(10)).until(
                    element,
                    isVisible(),
                ),
                Select.value(value).from(element),
            ),
    });
}
