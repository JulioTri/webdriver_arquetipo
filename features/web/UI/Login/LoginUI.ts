import {By, PageElement} from '@serenity-js/web';


// Localizador para el elemento basado en el texto
let button_login = "//button[@id='btn-login']";
let input_user = "//input[@id='input-username-login']";
let input_password = "//input[@id='input-password-login']";
let button_ingresar = "//button[@id='btn-submit-login']";
let div_button_close_side_modal = "//div[@id='btn-close-side-modal']";
let div_side_modal = "//*[@id='side-modal']";



export class LoginUI {
     
    static buttonLogin = () =>
        PageElement.located(By.xpath(button_login)).describedAs('button for login')
    
    static userInput = () =>
        PageElement.located(By.xpath(input_user)).describedAs('input for user')

    static passwordInput = () =>
        PageElement.located(By.xpath(input_password)).describedAs('input for password')
    
    static buttonIngresar = () =>
        PageElement.located(By.xpath(button_ingresar)).describedAs('button to submit')

    static buttonCloseSidebarIngresar = () =>
        PageElement.located(By.xpath(div_button_close_side_modal)).describedAs('button to submit')
    
    static modal = () =>
        PageElement.located(By.xpath(div_side_modal)).describedAs('button to submit')
    

}