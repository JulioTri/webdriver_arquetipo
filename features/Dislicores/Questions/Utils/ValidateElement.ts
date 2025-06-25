import { Question } from '@serenity-js/core';

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