import { Then, setDefaultTimeout} from '@cucumber/cucumber';
// import { Ensure, equals } from '@serenity-js/assertions';
import { type Actor } from '@serenity-js/core';
import { HomeTask } from '../Dislicores/Tasks/Home/HomeTasks'

setDefaultTimeout(20000);
/**
 * Navegar a una pagina
 * @param Actor es el sujeto que realiza la accion
 * @param subsidiaryNumber es el numero de la subsidiara que se seleccionara, normalmente es numerico. Ejemplo: 001, 002 ...
 */
Then('{pronoun} selects a subsidiary {string}', async (actor: Actor, subsidiaryNumber: string) => {
    await actor.attemptsTo(
       HomeTask.selectSubsidiary(subsidiaryNumber)
    );
});

Then('{pronoun} puts in the search engine the products defined in the route {string}', async (actor: Actor, pathOfProducts: string) => {
    console.log(pathOfProducts);
    await actor.attemptsTo(
      HomeTask.searchProduct(pathOfProducts)
    );
});
Then('{pronoun} continue with checkout', async (actor: Actor) => {
    await actor.attemptsTo(
      HomeTask.checkout()
    );
});
Then('{pronoun} pay with {string} method', async (actor: Actor, pathMethods) => {
    await actor.attemptsTo(
      HomeTask.payMethod("Notas 1", "orden 1", "tcv", pathMethods),
    );   
});
Then('{pronoun} validate the payment', async (actor: Actor) => {
    await actor.attemptsTo(
      HomeTask.validatePayment(),
    );   
});





