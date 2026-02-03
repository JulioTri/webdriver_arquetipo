import { Duration, Task } from '@serenity-js/core';
import { Tap } from '../Interactions/Tap.ts';
import { WaitForDisplayed } from '../Interactions/WaitFor.ts';

export const TapWhenVisible = {
  on: (selector: string) =>
    Task.where(
      `#actor toca ${ selector } cuando está visible`,
      WaitForDisplayed.of(selector, Duration.ofSeconds(15)),
      Tap.on(selector),
    ),
};
