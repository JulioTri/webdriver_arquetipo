import { Question, Answerable } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const ValidateElements = {
  isPresent: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is present`, async actor => {
      let present: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
      } catch (error) {
        present = false;
      }
      return present;
    }),

  isNotPresent: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is not present`, async actor => {
      let present: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
      } catch (error) {
        present = false;
      }
      return !present;
    }),

  isVisible: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is visible`, async actor => {
      let present: boolean;
      let visible: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
        visible = present ? await element.isVisible().answeredBy(actor) : false;
      } catch (error) {
        visible = false;
      }
      return visible;
    }),
    isVisible2: (element: Answerable<PageElement>): Question<Promise<boolean>> =>
      Question.about(`whether ${element.toString()} is visible`, async actor => {
        const retries = 3;
  
        for (let i = 1; i <= retries; i++) {
          try {
            const el = await PageElement.from(element).answeredBy(actor);
  
            if (!await el.isPresent()) return false;
  
            // 1er intento: sin scroll (rápido)
            if (i === 1) {
              if (await el.isVisible()) return true;
            }
  
            // Con scroll + re-resolución
            try { await el.scrollIntoView(); } catch { /* no-op */ }
            const el2 = await PageElement.from(element).answeredBy(actor);
  
            if (await el2.isVisible()) return true;
  
            await sleep(120);
          } catch {
            if (i === retries) return false; // stale/detached tras agotar reintentos
            await sleep(120);
          }
        }
        return false;
      }),
  isNotVisible: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is not visible`, async actor => {
      let present: boolean;
      let visible: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
        visible = present ? await element.isVisible().answeredBy(actor) : false;
      } catch (error) {
        visible = false;
      }
      return !visible;
    }),

  isEnabled: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is enabled`, async actor => {
      let present: boolean;
      let enabled: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
        enabled = present ? await element.isEnabled().answeredBy(actor) : false;
      } catch (error) {
        enabled = false;
      }
      return enabled;
    }),

  isSelected: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is selected`, async actor => {
      let present: boolean;
      let selected: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
        selected = present ? await element.isSelected().answeredBy(actor) : false;
      } catch (error) {
        selected = false;
      }
      return selected;
    }),

  isClickable: (element: any): Question<Promise<boolean>> =>
    Question.about(`whether ${element.toString()} is clickable`, async actor => {
      let present: boolean;
      let visible: boolean;
      let enabled: boolean;
      try {
        present = await element.isPresent().answeredBy(actor);
        visible = present ? await element.isVisible().answeredBy(actor) : false;
        enabled = present ? await element.isEnabled().answeredBy(actor) : false;
      } catch (error) {
        return false;
      }
      return visible && enabled;
    }),
};