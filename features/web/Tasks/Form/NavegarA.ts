import { Task } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';

export const NavegarA = {
  url:()=>
    Task.where(
      "#actor navega a la pagina de pruebas",
      Navigate.to("https://demoqa.com/")
    ),
}