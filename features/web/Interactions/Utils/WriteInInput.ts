import { Interaction, Wait, Duration } from '@serenity-js/core';
import { Click, Enter, isVisible, isEnabled, Press, Key } from '@serenity-js/web';

export const WriteInInput = {
  text: (value: string) => ({
    into: (element: any) =>
      Interaction.where(
        `#actor enters "${value}" into the ${element.toString()}`,
        async (actor) => {
            // const isEnabled = await element.isEnable();
            console.log("Ingreso al into");
            Click.on(element)
            Enter.theValue(value).into(element).performAs(actor);

        }
      ),
      into2: (element: any) =>
        Interaction.where(
          `#actor enters "${value}" into the ${element.toString()}`,
          actor => (actor as any).attemptsTo(
            Wait.until(element, isVisible()),
            Wait.until(element, isEnabled()),
            Enter.theValue(value).into(element)
          )
        ),
    
  }),
  clear: (element: any) =>
    Interaction.where(
      `#actor clear the input`,
      async (actor) => {
          const el = await element.resolveFor(actor);
          await el.clear();
      }
    ),
  clearWithKeys: (element: any) =>
    Interaction.where(`#actor clears the input using Ctrl+A+Backspace`, async actor => {
      await (actor as any).attemptsTo(
        Click.on(element),
        Press.the(Key.Control, 'a', Key.Backspace).in(element)
      );
    }),
};