import { Interaction } from '@serenity-js/core';

export const Click = {
  on: (element:any) =>
    Interaction.where(
      `#actor clicks on the ${element.toString()}`,
      async (actor) => {
        // Resuelve el elemento y haz clic directamente
        await element.click().answeredBy(actor);
      }
    ),
};