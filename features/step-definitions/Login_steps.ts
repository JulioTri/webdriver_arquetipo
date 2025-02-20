import { Given, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { type Actor } from '@serenity-js/core';
import { NavigateTo } from '../Dislicores/Tasks/Utils/NavigateTo.ts'
import { UtilsQuestions } from '../Dislicores/Questions/Utils/UtilsQuestions.ts'
import { LoginTask } from '../Dislicores/Tasks/Login/LoginTasks.ts'


// Step Definitions
setDefaultTimeout(200000);
// Paso para navegar a la página
Given('a user named {actor} navigate to {string}', async (actor: Actor, url: string) => {
    console.log('Antes de la navegacion');
    await actor.attemptsTo(
       NavigateTo.navigateToPage(url)  // Navega a la página de propiedades dinámicas
    );
    console.log('Finalizacion de navegacion');
});

Then('{pronoun} should see that the text {string} equals the expected text', async(actor:Actor, expectedText:string)=>{
    const actualText = await UtilsQuestions.getTextByTextLocator().answeredBy(actor);  // Captura el texto del elemento localizado por su texto
    console.log('Actual Text:', actualText);
    console.log('Expected Text:', expectedText);
    if (actualText !== expectedText) {
        console.error('Texts do not match! Check the element or locator.');
    }
    await actor.attemptsTo(
        Ensure.that(actualText, equals(expectedText))  // Compara el texto actual con el esperado
    );
});

Then('{pronoun} clicks on the Iniciar sesión button', async(actor:Actor)=>{
    await actor.attemptsTo(
        LoginTask.clickLogin()
    );
});

Then('{pronoun} waits until the sidebar is displayed', async(actor:Actor)=>{
    await actor.attemptsTo(
        LoginTask.waitForASidebar()
    );
});

Then('{pronoun} enters the username {string} and password {string}', async(actor:Actor, user:string, password: string)=>{
    console.log(user)
    console.log(password)
    await actor.attemptsTo(
        LoginTask.enterCredentials(user, password)
        // LoginTask.enterCredentials(),
    );
});




