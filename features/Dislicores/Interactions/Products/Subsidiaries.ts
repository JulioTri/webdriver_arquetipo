import { Interaction } from '@serenity-js/core';
import { Click } from '../Utils/Click';
import { HomeUI } from '../../UI/Login/HomeUI';
import { ValidateElements } from '../../Questions/Utils/ValidateElement';
import { WaitForElement } from '../Utils/WaitForElement';

export const Subsidiaries = {
  searchSubsidiary: (subsidiaryNumber:any) =>
    Interaction.where(
      `#actor search a subsidiary with number ${subsidiaryNumber.toString()}`,
      async (actor) => {
        let modalSubsidiary = await actor.answer(ValidateElements.isVisible(HomeUI.subsidiaryModal()));
        if (modalSubsidiary) {
          await Click.on(HomeUI.chooseSubsidiary(subsidiaryNumber)).performAs(actor);
          await WaitForElement.untilNotPresent(HomeUI.loading()).performAs(actor);
        } else {
          let subsidiaryOnHome = ValidateElements.isPresent(HomeUI.subsidiaryModal());
          if (!subsidiaryOnHome) {
            console.log("no hay subsidiaria en home");
          }else {
            console.log("Hay subsidiaria");
          }
        }
      }
    ),
};