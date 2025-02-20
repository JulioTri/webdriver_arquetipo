import { Interaction } from '@serenity-js/core';

export const WaitForElement = {
  toBeVisible: (element: any) =>
    Interaction.where(
      `#actor waits until the element ${element.toString()} is visible`,
      async (actor) => {
        await element.waitForDisplayed({
          timeout: 5000, // Tiempo máximo de espera
          timeoutMsg: `The element ${element.toString()} was not visible within the expected time`,
        }).answeredBy(actor);
      }
    ),
};