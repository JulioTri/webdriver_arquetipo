import { Given, When, Then } from '@cucumber/cucumber';
import { setDefaultTimeout } from '@cucumber/cucumber';

import { NavegarA } from '../../web/Tasks/Form/NavegarA';
import { AbrirFormulario } from '../../web/Tasks/Form/AbrirFormulario';
import { LlenarFormulario } from '../../web/Tasks/Form/LlenarFormulario';
import { Actor } from '@serenity-js/core';
import { EnviarFormulario } from '../../web/Tasks/Form/EnviarFormulario';
import { VerificarRespuestasFormulario } from '../../web/Tasks/Form/VeificarRespuestasFormulario';
//import { ValidateLogin } from '../../mobile/android/Tasks/ValidateLoginTasks';

setDefaultTimeout(200000);
Given('que {actor} accede al formulario de registro', async (actor: Actor) => {
   await actor.attemptsTo(
      NavegarA.url(),
      AbrirFormulario.barraLateralIzquierda(),
    );
});

When('{actor} diligencia el formulario con {string}', async (actor: Actor, dataset: string) => {
    await actor.attemptsTo(
      LlenarFormulario.conDataset(dataset)
    );
  },
);

 Then('{actor} envía la información', async (actor: Actor) => {
    await actor.attemptsTo(
      EnviarFormulario.completo()
    );
  },
);

Then('{actor} debería ver los datos registrados correctamente de acuerdo a {string}', async (actor: Actor, dataset: string) => {
    await actor.attemptsTo(
      VerificarRespuestasFormulario.matches(dataset)
    );
  },
);