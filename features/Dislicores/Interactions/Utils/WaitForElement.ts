import { Actor, Answerable, AnswersQuestions, Duration, Interaction, UsesAbilities, Wait } from '@serenity-js/core';
import { pause } from '../../Tasks/Utils/pause'; // Para WebdriverIO con ES Modules
import { ValidateElements } from '../../Questions/Utils/ValidateElement';
import { isPresent, not } from '@serenity-js/assertions';

export const WaitForElement = {
  toBeVisible: (element: any, timeout:number = 10000, polling:number=500) =>
    Interaction.where(
      `#actor waits until ${element.toString()} is visible`,
      async actor => {
        const start = Date.now();

        while (true) {
          const visible = await ValidateElements.isVisible(element).answeredBy(actor);
          if (visible) break;

          if (Date.now() - start > timeout) {
            throw new Error(`Timeout: ${element.toString()} was not visible within ${timeout}ms`);
          }

          await pause(polling);
        }
      }
    ),

  toBeClickable: (element: any, timeout:number = 10000, polling:number=500) =>
    Interaction.where(
      `#actor waits until ${element.toString()} is clickable`,
      async actor => {
        const start = Date.now();

        while (true) {
          const clickable = await ValidateElements.isClickable(element).answeredBy(actor);
          if (clickable) break;

          if (Date.now() - start > timeout) {
            throw new Error(`Timeout: ${element.toString()} was not clickable within ${timeout}ms`);
          }

          await pause(polling);
        }
      }
    ),

  toBeStable: (element: any, timeout:number = 10000, polling:number=500) =>
    Interaction.where(
      `#actor waits until ${element.toString()} is stable (clickable)`,
      async actor => {
        const start = Date.now();

        while (true) {
          const clickable = await ValidateElements.isClickable(element).answeredBy(actor);
          if (clickable) break;

          if (Date.now() - start > timeout) {
            throw new Error(`Timeout: ${element.toString()} was not stable (clickable) within ${timeout}ms`);
          }

          await pause(polling);
        }
      }
    ),

  toBeExist: (element: any, timeout:number = 10000, polling:number=500) =>
    Interaction.where(
      `#actor waits until ${element.toString()} exists`,
      async actor => {
        const start = Date.now();

        while (true) {
          const present = await ValidateElements.isPresent(element).answeredBy(actor);
          if (present) break;

          if (Date.now() - start > timeout) {
            throw new Error(`Timeout: ${element.toString()} did not appear in ${timeout}ms`);
          }

          await pause(polling);
        }
      }
    ),

    untilNotPresent: (element: Answerable<any>, timeout: number = 10000) =>
      Interaction.where(
          `#actor espera hasta que el elemento ${element.toString()} ya no esté presente`,
          async (actor) => {
              await (actor as Actor).attemptsTo(
                  Wait.upTo(Duration.ofMilliseconds(timeout)).until(element, not(isPresent()))
              );
          }
      ),

  forXTime: (timeout: number = 10000) =>
    Interaction.where(
      `#actor waits ${timeout}ms`,
      async () => {
        await pause(timeout);
      }
    ),

  other: (element: any, timeout:number = 10000, polling:number=500) =>
    Interaction.where(
      `#actor logs visibility of ${element.toString()}`,
      async () => {
        const visible = await ValidateElements.isVisible(element);
        console.log('¿Visible?', visible);
      }
    ),     
    untilPresent: (element: Answerable<any>, timeout: number = 20000) =>
      Interaction.where(
          `#actor espera hasta que el elemento ${element.toString()} esté presente`,
          async (actor) => {
              await (actor as Actor).attemptsTo(
                  Wait.upTo(Duration.ofMilliseconds(timeout)).until(element, isPresent())
              );
          }
      ),
   
};