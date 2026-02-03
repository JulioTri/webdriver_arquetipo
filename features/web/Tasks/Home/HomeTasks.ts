import { Task } from '@serenity-js/core';
import { Click } from '../../Interactions/Utils/Click';
import { WaitForElement } from '../../Interactions/Utils/WaitForElement';
import { WriteInInput } from '../../Interactions/Utils/WriteInInput';
import { HomeUI } from '../../UI/Login/HomeUI';
import { Products } from '../../Interactions/Products/Products';
import { Checkout } from '../../Interactions/Products/Checkout';
import { Scroll } from '@serenity-js/web';
import { UtilsQuestions } from '../../Questions/Utils/UtilsQuestions';
import { Subsidiaries } from '../../Interactions/Products/Subsidiaries';


export const HomeTask = {
    selectSubsidiary: (subsidiaryNumber:string) =>
        Task.where(
          '#actor wait and select a subsidiary',
          WaitForElement.untilPresent(HomeUI.subsidiaryModal()),
          Subsidiaries.searchSubsidiary(subsidiaryNumber, {}),
        ),
    searchProduct: (pathOfProducts: string)=>
      Task.where(
        '#actor wait and search a product',
        WaitForElement.untilNotPresent(HomeUI.loading()),
        Products.searchManyBySku(pathOfProducts, HomeUI.searchProducts(), HomeUI.addProductWithButton),
      ),
    checkout: ()=>
      Task.where(
        '#actor click on car and go to the pay',
        Checkout.openCar(HomeUI.openCar()),
        Checkout.goToPay(HomeUI.goToPay()),
        Checkout.validateMinimunOrder(HomeUI.missingForTheMinimum(), HomeUI.differenceForMinimum()),
        WaitForElement.toBeExist(HomeUI.continueWithPayment()),
        Scroll.to(HomeUI.continueWithPayment()),
        Click.on(HomeUI.continueWithPayment()),
      ),
    payMethod: (notes:string, order:string, method:string, tc?:any)=>
      Task.where(
       `#actor fills in the "Notas del pedido" and "Orden de compra" fields and selects the "${method}" payment method.`,
        WaitForElement.toBeExist(HomeUI.titleOrderNotes()),
        WriteInInput.text(notes).into(HomeUI.orderNotes()),
        WriteInInput.text(order).into(HomeUI.purchaseOrder()),
        Checkout.selectAPaymentMethod(method, tc),
        Click.on(HomeUI.continueWithFinalPayment())
      ),
    validatePayment: ()=>
      Task.where(
       `#actor validates that the payment is successful and continues with the process`,
       WaitForElement.toBeVisible(HomeUI.orderNumberCreated(),50000),
       UtilsQuestions.getTextAndSave(HomeUI.orderNumberCreated()),
       Click.on(HomeUI.continueButtonAfterPayment()),
      )
    
}