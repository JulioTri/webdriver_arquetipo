import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';

export class Type extends Interaction {

  static value(value: string) {
    return {
      into: (selector: string, options: { clear?: boolean } = {}) =>
        new Type(value, selector, options.clear ?? true),
    };
  }

  constructor(
    private readonly value: string,
    private readonly selector: string,
    private readonly clearFirst: boolean,
  ) {
    super(`#actor types "${ value }" into ${ selector }`);
  }

  async performAs(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const el = await browser.$(this.selector);
    await el.waitForExist({ timeout: 15_000 });
    await el.waitForDisplayed({ timeout: 15_000 });

    await el.click();

    if (this.clearFirst) {
      await el.clearValue();
    }

    await el.setValue(this.value);
  }
}
