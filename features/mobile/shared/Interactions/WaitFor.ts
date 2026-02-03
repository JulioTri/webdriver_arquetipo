import { AnswersQuestions, Duration, Interaction, UsesAbilities } from '@serenity-js/core';

export class WaitForDisplayed extends Interaction {

  static of(selector: string, timeout: Duration = Duration.ofSeconds(15)): WaitForDisplayed {
    return new WaitForDisplayed(selector, timeout);
  }

  constructor(
    private readonly selector: string,
    private readonly timeout: Duration,
  ) {
    super(`#actor waits for ${ selector } to be displayed`);
  }

  async performAs(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const el = await browser.$(this.selector);
    await el.waitForDisplayed({ timeout: this.timeout.inMilliseconds() });
  }
}
