import { Task, Check } from '@serenity-js/core';
import { Click, isVisible, PageElement } from '@serenity-js/web';

export const ClickIfVisible = {
  on: (element: PageElement) =>
    Task.where(
      `#actor hace click si ${ element } está visible`,
      Check.whether(element, isVisible())
        .andIfSo(Click.on(element)),
    ),
};
