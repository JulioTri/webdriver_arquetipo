import {Text} from '@serenity-js/web';
import {Question} from '@serenity-js/core';
import {LoginUI} from '../../UI/Login/LoginUI'

// Localizador para el elemento basado en el texto
export class UtilsQuestions {

    // Pregunta para obtener el texto de un elemento basado en el texto
    static getTextByTextLocator = () =>
        Question.about<string>(`the text of the element located by text`, async (actor) =>{
            const text = Text.of(LoginUI.buttonLogin()).answeredBy(actor)
            console.log('Retrieved Text:', text); // Para depuración
            return text;
        }
        );

    // // Pregunta para obtener el texto de un elemento basado en el ID dinámico
    // static getTextByDynamicIdLocator = () =>
    //     Question.about<string>(`the text of the element located by ID prefix`, actor =>
    //         Text.of(LoginUI.dynamicTextByTextOptional()).answeredBy(actor),
    //     );
}