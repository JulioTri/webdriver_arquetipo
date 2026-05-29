import { Task } from '@serenity-js/core';

import { FormUI } from '../../UI/Form/FormUI';
import { Click } from '@serenity-js/web';


export class EnviarFormulario {
  static completo = () => {
    return Task.where(`#actor envia el formulario`,
      Click.on(FormUI.Submit()),
    );
  }
}
