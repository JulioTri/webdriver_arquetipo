import { Answerable, Duration, Task, Wait } from '@serenity-js/core';
import { Click, isClickable, PageElement } from '@serenity-js/web';

export class ClickWhenReady {

  static on = (element: Answerable<PageElement>) =>
    Task.where(
      `#actor hace clic cuando el elemento está listo`,
      Wait.upTo(Duration.ofSeconds(3)).until(element, isClickable()),
      Click.on(element),
    );
}