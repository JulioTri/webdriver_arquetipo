import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';

type Direction = 'up' | 'down' | 'left' | 'right';

export class Swipe extends Interaction {

  static in(direction: Direction, options: { percent?: number } = {}): Swipe {
    return new Swipe(direction, options.percent ?? 0.8);
  }

  constructor(
    private readonly direction: Direction,
    private readonly percent: number,
  ) {
    super(`#actor swipes ${ direction }`);
  }

  async performAs(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    await driver.execute('mobile: swipeGesture', {
      direction: this.direction,
      percent: this.percent,
    });
  }
}
