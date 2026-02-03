import { Interaction } from '@serenity-js/core';

export const DebugPause = () =>
  Interaction.where(`#actor pausa para debug`, async () => {
    // workaround temporal para debug
    // @ts-ignore
    await browser.debug();
  });
