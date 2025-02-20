import { Interaction } from '@serenity-js/core';
import { Enter } from '@serenity-js/web';

export const WriteInInput = {
  text: (value: string) => ({
    into: (element: any) =>
      Interaction.where(
        `#actor enters "${value}" into the ${element.toString()}`,
        async (actor) => {
            // const isEnabled = await element.isEnable();
            Enter.theValue(value).into(element).performAs(actor);
        }
      ),
  }),
};