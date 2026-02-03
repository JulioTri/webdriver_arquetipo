import { Interaction } from '@serenity-js/core';
import { Click } from '../Utils/Click';
import { HomeUI } from '../../UI/Login/HomeUI';
import { ValidateElements } from '../../Questions/Utils/ValidateElement';
import { WaitForElement } from '../Utils/WaitForElement';

export const Subsidiaries = {
  searchSubsidiary: (subsidiaryNumber:any, opts: { maxAttempts?: number}) =>
    Interaction.where(
      `#actor search a subsidiary with number ${subsidiaryNumber.toString()}`,
      async (actor) => {
        let maxAttempts = opts.maxAttempts ?? 10;
        await WaitForElement.forXTime(5).performAs(actor);
        let modalSubsidiary = await actor.answer(ValidateElements.isVisible(HomeUI.subsidiaryModal()));
        if (modalSubsidiary) {
          let subsidiaryVisible = await actor.answer(ValidateElements.isVisible(HomeUI.chooseSubsidiary(subsidiaryNumber)));
          if (subsidiaryVisible) {
            await Click.on(HomeUI.chooseSubsidiary(subsidiaryNumber)).performAs(actor);

            // Espera que se muestre el modal de cambio de sucursal
            WaitForElement.toBeVisible(HomeUI.alertChangeSubsidiaryCancel());  
            let modalCahngeSubsidiary = await actor.answer(ValidateElements.isVisible(HomeUI.alertChangeSubsidiaryCancel()));
            if (modalCahngeSubsidiary) {
              WaitForElement.toBeVisible(HomeUI.alertChangeSubsidiaryCancel());
              await Click.on(HomeUI.alertChangeSubsidiaryCancel()).performAs(actor);
            }
            // Validar modal de encuesta
            WaitForElement.toBeVisible(HomeUI.modalToAnswerSurvey());
            let modalSurvey = await actor.answer(ValidateElements.isVisible(HomeUI.modalToAnswerSurvey()));
            if (modalSurvey) {
              await Click.on(HomeUI.modalToCloseSurvey()).performAs(actor);
            }

            // Espera a que desaparezca el modal / cargue el home
            await WaitForElement.untilNotPresent(HomeUI.alertChangeSubsidiaryCancel()).performAs(actor);
            // Espera a que desaparezca el modal cambio de sucursal
            await WaitForElement.untilNotPresent(HomeUI.subsidiaryModal()).performAs(actor);
            // Si hay loader/spinner, esperar a que termine:
            await WaitForElement.untilNotPresent(HomeUI.loading()).performAs(actor);
            
          }else{
            let attempt = 1;
            while (!subsidiaryVisible && attempt<maxAttempts) {
              WaitForElement.toBeVisible(HomeUI.showMoreSubsidiaries());           
              await Click.on(HomeUI.showMoreSubsidiaries()).performAs(actor);
              
              WaitForElement.toBeVisible(HomeUI.chooseSubsidiary(subsidiaryNumber));
              subsidiaryVisible = await actor.answer(ValidateElements.isVisible(HomeUI.chooseSubsidiary(subsidiaryNumber)));              
              if (subsidiaryVisible) {
                await Click.on(HomeUI.chooseSubsidiary(subsidiaryNumber)).performAs(actor);
                
                // Espera que se muestre el modal de cambio de sucursal
                WaitForElement.toBeVisible(HomeUI.alertChangeSubsidiaryCancel());       
                await WaitForElement.untilPresent(HomeUI.alertChangeSubsidiaryCancel()).performAs(actor);    
                let modalCahngeSubsidiary = await actor.answer(ValidateElements.isVisible(HomeUI.alertChangeSubsidiaryCancel()));
                if (modalCahngeSubsidiary) {
                  WaitForElement.toBeVisible(HomeUI.alertChangeSubsidiaryCancel());
                  await Click.on(HomeUI.alertChangeSubsidiaryCancel()).performAs(actor);
                }
                // Validar modal de encuesta

                // await WaitForElement.forXTime().performAs(actor);
                // WaitForElement.toBeClickable(HomeUI.modalToAnswerSurvey(), 100000);
                await WaitForElement.untilPresent(HomeUI.modalToAnswerSurvey()).performAs(actor);
                let modalSurvey = await actor.answer(ValidateElements.isVisible(HomeUI.modalToAnswerSurvey()));
                if (modalSurvey) {
                  WaitForElement.toBeVisible(HomeUI.modalToCloseSurvey());
                  await Click.on(HomeUI.modalToCloseSurvey()).performAs(actor);
                }
    
                // Espera a que desaparezca el modal / cargue el home
                await WaitForElement.untilNotPresent(HomeUI.alertChangeSubsidiaryCancel()).performAs(actor);
                // Espera a que desaparezca el modal cambio de sucursal
                await WaitForElement.untilNotPresent(HomeUI.subsidiaryModal()).performAs(actor);
                // Si hay loader/spinner, esperar a que termine:
                await WaitForElement.untilNotPresent(HomeUI.loading()).performAs(actor);
                break;
              }
              attempt++;
            }
           
            // await Click.on(HomeUI.showMoreSubsidiaries()).performAs(actor);
            // await WaitForElement.untilNotPresent(HomeUI.loading()).performAs(actor);
          }

         
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