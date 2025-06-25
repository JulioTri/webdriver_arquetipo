import {Text} from '@serenity-js/web';
import {Question} from '@serenity-js/core';
import * as fs from 'fs';
import * as path from 'path';

// Localizador para el elemento basado en el texto
export class UtilsQuestions {

    // Pregunta para obtener el texto de un elemento basado en el texto
    static getTextByTextLocator = (element:any) =>
        Question.about<string>(`the text of the element located by text`, async (actor) =>{
            const text = Text.of(element).answeredBy(actor)
            console.log('Retrieved Text:', text); // Para depuración
            return text;
        }
        );

    static getTextAndSave = (element: any) =>
        Question.about<string>(`the text of the element located by text and saved to file`, async (actor) => {
            const text = await Text.of(element).answeredBy(actor);
            console.log('Retrieved Text:', text);

            const folderPath = path.resolve(__dirname, '../../JSON/orders'); // Ajusta si es necesario
            const filePath = path.join(folderPath, 'orders.json');

            // Asegura que la carpeta exista
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            let data: { orders: string[] } = { orders: [] };

            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                try {
                    data = JSON.parse(content);
                    if (!Array.isArray(data.orders)) {
                        data.orders = [];
                    }
                } catch (err) {
                    console.error('Error parsing JSON, creating new structure');
                    data = { orders: [] };
                }
            }

            data.orders.push(text);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`Saved text to ${filePath}`);

            return text;
        });

    // // Pregunta para obtener el texto de un elemento basado en el ID dinámico
    // static getTextByDynamicIdLocator = () =>
    //     Question.about<string>(`the text of the element located by ID prefix`, actor =>
    //         Text.of(LoginUI.dynamicTextByTextOptional()).answeredBy(actor),
    //     );
}