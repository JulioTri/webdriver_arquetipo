import { Given, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { type Actor } from '@serenity-js/core';
import { DynamicPropertiesPage } from '../../serenity/demoqa/DynamicPropertiesPage.ts';
import { By, PageElement } from "@serenity-js/web";
import { DynamicIdPropertyPage } from "../../serenity/demoqa/DynamicIdPropertyPage.ts";  // Ruta a tu página de propiedades dinámicas
//import { dynamicIdMap } from '../support/dynamicIdMap.ts' // Importamos el mapa global


// Step Definitions
setDefaultTimeout(200000);
//let dynamicId: string;
// Paso para navegar a la página de propiedades dinámicas
Given('a user named {actor} navigate to the dynamic content page', async (actor: Actor) => {
    console.log('Antes de la navegacion');
    await actor.attemptsTo(
       await DynamicPropertiesPage.navigateToDynamicPropertiesPage()  // Navega a la página de propiedades dinámicas
    );
    console.log('Finalizacion de navegacion');
    //Captura el ID dinámico y guárdalo en la variable
    // Captura el ID dinámico y lo almacena en la variable global
    //dynamicId = await DynamicPropertiesPage.getDynamicId(actor);
});



// Paso para verificar que el texto del elemento coincide con el texto esperado usando un selector basado en el texto
Then('{pronoun} should see that the text "([^"]*)" equals the expected text', async (actor: Actor, expectedText: string) => {
    const actualText = await DynamicPropertiesPage.getTextByTextLocator().answeredBy(actor);  // Captura el texto del elemento localizado por su texto
    console.log('Actual Text:', actualText);
    console.log('Expected Text:', expectedText);
    if (actualText !== expectedText) {
        console.error('Texts do not match! Check the element or locator.');
    }
    await actor.attemptsTo(
        Ensure.that(actualText, equals(expectedText))  // Compara el texto actual con el esperado
    );
});

// Paso para verificar que el texto del elemento coincide con el texto esperado usando un selector basado en el ID dinámico
Then('{pronoun} should see that the text "([^"]*)" equals the expected text locating the element by a dynamic ID', async (actor: Actor, expectedText: string) => {
    // Capturamos el ID dinámico
    const dynamicId = await DynamicIdPropertyPage.getIdItem();
    //console.log(`El ID dinámico es: ${dynamicId}`);

    // Usamos la referencia del ID dinámico para verificar el texto
    const elementText = await PageElement.located(By.id(dynamicId)).text();

    // Ahora podemos comparar el texto con el esperado
    await actor.attemptsTo(
        Ensure.that(elementText, equals(expectedText))
    );
});