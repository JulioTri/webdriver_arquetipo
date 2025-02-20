import {By, PageElement} from '@serenity-js/web';


// Localizador para el elemento basado en el texto
export class LoginUI {

    static buttonLogin = () =>
        PageElement.located(By.xpath("(//button[contains(text(),'Iniciar sesión')])[1]")).describedAs('button for login')
    
    static userInput = () =>
        PageElement.located(By.xpath("//input[contains(@placeholder,'Escribe tu número de identificación')]")).describedAs('input for user')

    static passwordInput = () =>
        PageElement.located(By.xpath("//input[contains(@placeholder,'Escribe tu contraseña')]")).describedAs('input for password')
    
    static buttonIngresar = () =>
        PageElement.located(By.xpath("//button[.//span[text()='Ingresar']]")).describedAs('button to submit')

    static buttonCloseSidebarIngresar = () =>
        PageElement.located(By.xpath("//div[contains(@class,'side-modal_close__ed')]")).describedAs('button to submit')
    
    static modal = () =>
        PageElement.located(By.xpath("//*[@id='side-modal']")).describedAs('button to submit')
    

}