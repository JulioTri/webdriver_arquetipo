import { Answerable, Duration, Task, Wait } from '@serenity-js/core';
import { isPresent, not } from '@serenity-js/assertions';
import { PageElement } from '@serenity-js/web';

export class WaitUntilGone {
  static the = (element: Answerable<PageElement>, timeout = Duration.ofSeconds(20)) =>
    Task.where(
      '#actor espera hasta que el elemento desaparezca',
      Wait.upTo(timeout).until(element, not(isPresent())),
    );
}
