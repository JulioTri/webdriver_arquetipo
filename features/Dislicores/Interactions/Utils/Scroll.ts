import { Interaction } from '@serenity-js/core';

export const Scroll = {
  to: (element:any) =>
    Interaction.where(
      `#actor scroll to ${element.toString()}`,
      async (actor) => {
        // Resuelve el elemento y haz clic directamente
        await element.scroll().answeredBy(actor);
      }
    ),
};