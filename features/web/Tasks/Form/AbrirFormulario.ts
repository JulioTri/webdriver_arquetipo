import { Duration, Task, Wait } from '@serenity-js/core';
import { isVisible } from '@serenity-js/web';

import { ClickWhenReady } from '../../shared/Tasks/ClickWhenReady'
import { FormUI } from '../../UI/Form/FormUI';

export const AbrirFormulario = {
  barraLateralIzquierda: ()=>
    Task.where(
      "#actor selecciona el formulario en la barra lateral izquierda",
      ClickWhenReady.on(FormUI.FormOption()),
      ClickWhenReady.on(FormUI.PracticeForm()),
      Wait.upTo(Duration.ofSeconds(3)).until(FormUI.PracticeFormTitle(),isVisible()),
    )
}