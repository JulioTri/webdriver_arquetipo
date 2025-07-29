import { Interaction } from '@serenity-js/core';
import { Click } from '../Utils/Click';
import { ValidateElements } from '../../Questions/Utils/ValidateElement';
import { UtilsQuestions } from '../../Questions/Utils/UtilsQuestions';
import { HomeUI } from '../../UI/Login/HomeUI';
import { SelectOption } from '../Utils/Select';
import { WriteInInput } from '../Utils/WriteInInput';
import fs from 'fs';
import { Scroll } from '@serenity-js/web';

export const Checkout = {
  openCar: (element:any) =>
    Interaction.where(
      `#actor open de car with the products ${element.toString()}`,
      async (actor) => {
        await Click.on(element).performAs(actor)
      }
    ),
  goToPay: (element:any) =>
    Interaction.where(
      `#actor clicks the "go to pay" button ${element.toString()}`,
      async (actor) => {
        await Click.on(element).performAs(actor)
      }
    ),
  validateMinimunOrder: (element:any, element2:any) =>
    Interaction.where(
      `#actor asks if complies with the minimum order`,
      async (actor) => {
         let minimumCompleted = await ValidateElements.isPresent(element).answeredBy(actor);
         if (!minimumCompleted) {
          console.log("El pedido minimo se cumplio")
         }else{
          let text = await UtilsQuestions.getTextByTextLocator(element2).answeredBy(actor)
          throw new Error(`Aun faltan productos para un valor de ${text} para el pedido minimo`);
         }
      }
    ),
  selectAPaymentMethod: (method:string, pathOfMethods?:any)=>
    Interaction.where(`#actor selected ${method} as the payment method`,
    async (actor) => {
      if (method == "PSE" || method.toLowerCase().includes("pse")) {
        await Click.on(HomeUI.pseMethod()).performAs(actor);
        await SelectOption.byValue("1", HomeUI.pseUserType()).performAs(actor);
        await SelectOption.byValue("1", HomeUI.pseBank()).performAs(actor);
      }else if(method == "contra entrega" || method.toLowerCase().includes("contra entrega")){
        await Click.on(HomeUI.contraEntregaMethod()).performAs(actor);
      }else if(method == "bancolombia" || method.toLowerCase().includes("bancolombia")){
        await Click.on(HomeUI.bancolombiaMethod()).performAs(actor);
      }else if(method == "bancolombia" || method.toLowerCase().includes("bancolombia")){
        await Click.on(HomeUI.creditoDislicoresMethod()).performAs(actor);
      }else{
        await Click.on(HomeUI.creditCardMethod()).performAs(actor);
        const fileContent = fs.readFileSync(pathOfMethods, 'utf-8');
        const tc = JSON.parse(fileContent); 
        console.log(tc.tc[0].name)
        await Scroll.to(HomeUI.creditCardQuotas()).performAs(actor),
        await WriteInInput.text(tc.tc[0].name).into(HomeUI.creditCardName()).performAs(actor);
        await WriteInInput.text(tc.tc[0].number).into(HomeUI.creditCardNumber()).performAs(actor);
        await WriteInInput.text(tc.tc[0].date).into(HomeUI.creditCardExpirationDate()).performAs(actor);
        await WriteInInput.text(tc.tc[0].cvc).into(HomeUI.creditCardCVC()).performAs(actor);
        await SelectOption.byValue("1",HomeUI.creditCardQuotas()).performAs(actor);
      }
    }
    )
};