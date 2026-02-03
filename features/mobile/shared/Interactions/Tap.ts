import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';

export class Tap extends Interaction {

  static on(selector: string): Tap {
    return new Tap(selector);
  }

  constructor(private readonly selector: string) {
    super(`#actor taps on ${ selector }`);
  }

  async performAs(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const el = await browser.$(this.selector);
    await el.waitForExist({ timeout: 15_000 });
    await el.waitForDisplayed({ timeout: 15_000 });
    await el.click();
  }
}
