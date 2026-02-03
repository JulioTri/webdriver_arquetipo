import { Interaction } from '@serenity-js/core';
import { interactionKeys } from '../../Interactions/Utils/Keys';
import { WriteInInput } from '../../Interactions/Utils/WriteInInput';
import { WaitForElement } from '../../Interactions/Utils/WaitForElement';
import { Click } from '../../Interactions/Utils/Click';
import fs from 'fs';

export const Products = {
  searchOne: (pathOfProducts:any, searchProduct:any) =>
    Interaction.where(
      `#actor search one product in JSON file, in the path ${pathOfProducts.toString()}`,
      async (actor) => {
        WriteInInput.text(pathOfProducts.skus[1]).into(searchProduct)
        interactionKeys.enter()
      }
    ),
  searchManyBySku: (pathOfProducts:any, searchProduct:any, btnProduct:any) =>
    Interaction.where(
      `#actor search all the products in JSON file, in the path ${pathOfProducts.toString()}`,
      async (actor) => {
        const fileContent = fs.readFileSync(pathOfProducts, 'utf-8');
        const productos = JSON.parse(fileContent);
        for (const skus of productos.skus) {
          await WriteInInput.clearWithKeys(searchProduct).performAs(actor);
          await WriteInInput.text(skus.sku).into2(searchProduct).performAs(actor);
          await interactionKeys.enter().performAs(actor);
          await WaitForElement.toBeVisible(btnProduct(skus.sku),100000).performAs(actor);
          await WaitForElement.toBeStable(btnProduct(skus.sku)).performAs(actor);
          let cuantity = skus.cuantity
          for (let index = 0; index < cuantity; index++) {
            await Click.on(btnProduct(skus.sku)).performAs(actor);
          }
        }
      }
    ),
};