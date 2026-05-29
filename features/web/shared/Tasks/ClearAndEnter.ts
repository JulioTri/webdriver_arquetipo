import { Task } from '@serenity-js/core';
import { Answerable } from '@serenity-js/core';
import { PageElement, Clear, Enter } from '@serenity-js/web';

export class ClearAndEnter {

  static theValue = (value: string) => ({
    into: (element: Answerable<PageElement>) =>
      Task.where(`#actor limpia y escribe "${ value }"`,
        Clear.theValueOf(element),
        Enter.theValue(value).into(element),
      ),
  });
}
