import { Interaction } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';

export class PressEnter {
  static key = () =>
    Interaction.where(
      '#actor presiona Enter',
      Press.the(Key.Enter),
    );
}
