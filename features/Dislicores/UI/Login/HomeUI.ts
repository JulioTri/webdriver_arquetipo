import {By, PageElement} from '@serenity-js/web';


// Localizador para el elemento basado en el texto
let modal_seleccione_sucursal = "//div[@id='subsidiary-select-home']";
let input_search_subsidiary = "//input[@id='input-search-subsidiary-home']";
let div_found_subsidiary = "//input[@id='input-search-subsidiary-home']//following::div[2]";
let button_continuar = "//button[@id='btn-subsidiary-select-home']";
let div_loading = "//div[contains(@class,'loader_loader')]";
let input_search = "//*[@id='input-search-header']";
let div_products = "//*[@id='search-products']"
let span_product = (sku: string)=>`//*[@id='search-products']//following::span[contains(normalize-space(.), '${sku}')]`
let btn_plus_product = (sku: string)=>`//*[@id='search-products']//following::span[contains(normalize-space(.), '${sku}')]//following::button[contains(@id,'btn-plus')][1]`
let input_cuantity_product = (sku: string)=>`//*[@id='search-products']//following::span[contains(normalize-space(.), '${sku}')]//following::input[contains(@id,'input-count')][1]`
let btn_car = "//*[@id='btn-cart-header']"
let btn_go_to_pay = "//*[@id='btn-to-pay-side-cart']"
let p_missing_for_minimum = "//*[contains(text(),'Te faltan')]"
let span_min_order_dif = "//*[contains(@class,'min-order_text_dif')]"
let btn_continue_with_pay = "//*[contains(@id,'btn-pay-cart-desktop')]"
let h4_order_notes = "//*[h4='Notas del pedido']"
let textarea_order_notes = "//*[h4='Notas del pedido']//following::textarea[1]"
let h4_purchase_order = "//*[h4='Orden de compra']"
let input_purchase_order = "//*[h4='Orden de compra']//following::input[1]"
let h4_payment_methods = "//*[h4='Métodos de pago']"
let btn_credito_dis = "//*[h4='Métodos de pago']//following::button[p[contains(text(),'Crédito')]]"
let btn_credit_card = "//*[h4='Métodos de pago']//following::button[p[contains(text(),'Tarjeta')]]"
let input_credit_card_name = "//*[h4='Tarjeta de crédito']//following::input[@name='nombre']"
let input_credit_card_number = "//*[h4='Tarjeta de crédito']//following::input[@name='numero']"
let input_credit_card_expiration_date = "//*[h4='Tarjeta de crédito']//following::input[@name='vencimiento']"
let input_credit_card_cvc = "//*[h4='Tarjeta de crédito']//following::input[@name='CVC']"
let select_credit_quotas = "//*[h4='Tarjeta de crédito']//following::select[1]"
let btn_pse = "//*[h4='Métodos de pago']//following::button[p[contains(text(),'PSE')]]"
let btn_pse_user_type = "//*[@id='input-select-type-card-method-pse-checkout']"
let btn_pse_bank = "//*[@id='input-select-bank-card-method-pse-checkout']"
let btn_bancolombia = "//*[h4='Métodos de pago']//following::button[p[contains(text(),'Bancolombia')]]"
let btn_contra_entrega = "//*[h4='Métodos de pago']//following::button[p[contains(text(),'Contra entrega')]]"
let btn_continue_payment = "//*[@id='btn-pay-checkout-desktop']"
let h3_order_successful_message = "//*[contains(h3,'¡Pedido creado exitosamente!')]"
let p_order_successful_message = "//*[contains(h3,'¡Pedido creado exitosamente!')]//following::p[1]"
let btn_order_successful_message_continue = "//*[contains(h3,'¡Pedido creado exitosamente!')]//following::button[1]"


export class HomeUI {
     
    //Subsidiary modal
    static selectSubsidiaryModal = () =>
        PageElement.located(By.xpath(modal_seleccione_sucursal)).describedAs('subsidiary selection modal ')
    
    static searchSubsidiary = () =>
        PageElement.located(By.xpath(input_search_subsidiary)).describedAs('subsidiary finder ')
    
    static foundSubsidiary = () =>
        PageElement.located(By.xpath(div_found_subsidiary)).describedAs('subsidiary resulting from the search')
    
    static chooseSubsidiary = () =>
        PageElement.located(By.xpath(button_continuar)).describedAs('button to select the found subsidiary')
    
    static loading = () =>
        PageElement.located(By.xpath(div_loading)).describedAs('div present while page loads')

    //add products
    static searchProducts = () =>
        PageElement.located(By.xpath(input_search)).describedAs('product finder')

    static containerProducts = () =>
        PageElement.located(By.xpath(div_products)).describedAs('container of products')

    static product = (sku:string) =>
        PageElement.located(By.xpath(span_product(sku))).describedAs('product finded')

    static addProductWithButton = (sku:string) =>
        PageElement.located(By.xpath(btn_plus_product(sku))).describedAs('add products by btn')
    
    static addProductByCuantity = (sku:string) =>
        PageElement.located(By.xpath(input_cuantity_product(sku))).describedAs('add products by cuantity')

    //checkout
    static openCar = () =>
        PageElement.located(By.xpath(btn_car)).describedAs('open car with products')
   
    static goToPay = () =>
        PageElement.located(By.xpath(btn_go_to_pay)).describedAs('go to pay')
    
    static missingForTheMinimum = () =>
        PageElement.located(By.xpath(p_missing_for_minimum)).describedAs('message indicating that the minimum order amount is missing')

    static differenceForMinimum = () =>
        PageElement.located(By.xpath(span_min_order_dif)).describedAs('Text for the minimum order difference')
    
    static continueWithPayment = () =>
        PageElement.located(By.xpath(btn_continue_with_pay)).describedAs('"continue with payment" button')

    //Payment
    static titleOrderNotes = () =>
        PageElement.located(By.xpath(h4_order_notes)).describedAs('title of order notes')
   
    static orderNotes = () =>
        PageElement.located(By.xpath(textarea_order_notes)).describedAs('texarea of order notes')

    static titlePurchaseOrder = () =>
        PageElement.located(By.xpath(h4_purchase_order)).describedAs('title of purchase order')

    static purchaseOrder = () =>
        PageElement.located(By.xpath(input_purchase_order)).describedAs('input of purchase order')

    static titlePaymentMethods = () =>
        PageElement.located(By.xpath(h4_payment_methods)).describedAs('title of payment methods')

    // payment - tc
    static creditCardMethod = () =>
        PageElement.located(By.xpath(btn_credit_card)).describedAs('button credit card method')

    static creditCardName = () =>
        PageElement.located(By.xpath(input_credit_card_name)).describedAs('input of credit card method name')

    static creditCardNumber = () =>
        PageElement.located(By.xpath(input_credit_card_number)).describedAs('input of credit card method number')

    static creditCardExpirationDate = () =>
        PageElement.located(By.xpath(input_credit_card_expiration_date)).describedAs('input of credit card method expiration date')

    static creditCardCVC = () =>
        PageElement.located(By.xpath(input_credit_card_cvc)).describedAs('input of credit card method cvc')

    static creditCardQuotas = () =>
        PageElement.located(By.xpath(select_credit_quotas)).describedAs('input of credit card method quotas')
    
    //payment - pse
    static pseMethod = () =>
        PageElement.located(By.xpath(btn_pse)).describedAs('button pse method')

    static pseUserType = () =>
        PageElement.located(By.xpath(btn_pse_user_type)).describedAs('select pse method user type')

    static pseBank = () =>
        PageElement.located(By.xpath(btn_pse_bank)).describedAs('select pse method bank')
    
    //payment  - bancolombia
    static bancolombiaMethod = () =>
        PageElement.located(By.xpath(btn_bancolombia)).describedAs('button bancolombia method')
   
    //payment  - contra entrega
    static contraEntregaMethod = () =>
        PageElement.located(By.xpath(btn_contra_entrega)).describedAs('button contra entrega method')

    //payment - dilicores credit
    static creditoDislicoresMethod = () =>
        PageElement.located(By.xpath(btn_credito_dis)).describedAs('button credito dislicores method')
    
    //payment - continue with payment
    static continueWithFinalPayment = () =>
        PageElement.located(By.xpath(btn_continue_payment)).describedAs('button continuar con el pago')

    static validateOrderSuccessfulMessage = () =>
        PageElement.located(By.xpath(h3_order_successful_message)).describedAs('h3 pedido exitoso message')

    static orderNumberCreated = () =>
        PageElement.located(By.xpath(p_order_successful_message)).describedAs('p order number created')

    static continueButtonAfterPayment = () =>
        PageElement.located(By.xpath(btn_order_successful_message_continue)).describedAs('continue button after payment')

}