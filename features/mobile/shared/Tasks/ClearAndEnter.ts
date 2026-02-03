import { Duration, Task } from '@serenity-js/core';
import { WaitForDisplayed } from '../Interactions/WaitFor';
import { Type } from '../Interactions/TypeInto';
import { Tap } from '../Interactions/Tap';

export const ClearAndEnter = {
  value: (text: string) => ({
    into: (selector: string) =>
      Task.where(
        `#actor limpia y escribe en ${ selector }`,
        WaitForDisplayed.of(selector, Duration.ofSeconds(15)),
        Tap.on(selector),
        Type.value(text).into(selector, { clear: true }),
      ),
  }),
};
