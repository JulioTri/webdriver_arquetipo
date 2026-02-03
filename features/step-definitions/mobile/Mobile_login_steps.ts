import { Given, When, Then } from '@cucumber/cucumber';
import { setDefaultTimeout } from '@cucumber/cucumber';

import { Login } from '../../mobile/android/Tasks/Login/LoginTasks';
import { Actor } from '@serenity-js/core';
//import { ValidateLogin } from '../../mobile/android/Tasks/ValidateLoginTasks';

setDefaultTimeout(200000);
Given('the user named {actor} opens the application', async (actor: Actor) => {
  // ✅ Recomendado: la apertura de la app suele ir en un Before hook.
  // Este step puede quedar vacío o delegar a una Task si aplica.

  // Ejemplo si tienes la Task:
  // await actorInTheSpotlight().attemptsTo(
  //   OpenTheApplication(),
  // );
  
});

When('{pronoun} logs in with username {string} and password {string}',
  async (actor: Actor, username: string, password: string) => {
    await actor.attemptsTo(
      //DebugPause(),
      Login.withCredentials(username, password),
      //DebugPause(),
    );
  },
);

// Then(
//   'the user should be logged in successfully and see the home screen',
//   async () => {
//     await actorInTheSpotlight().attemptsTo(
//       // ✅ Esta Task:
//       // - Falla inmediatamente si aparece error de credenciales
//       // - Si no hay error, exige que el Home se muestre
//       ValidateLogin.outcome(),
//     );
//   },
// );

// Then(
//   'an invalid credentials error should be displayed and the execution should stop',
//   async () => {
//     // 🔴 Para escenarios negativos, lo IDEAL es una validación explícita.
//     // Ejemplo recomendado:
//     //
//     // await actorInTheSpotlight().attemptsTo(
//     //   EnsureLoginError.credentials(),
//     // );

//     // ⚠️ Si tu ValidateLogin.outcome() está diseñada para:
//     // - fallar cuando aparece el error
//     // puedes reutilizarla, pero semánticamente es mejor separar.
//     await actorInTheSpotlight().attemptsTo(
//       ValidateLogin.outcome(),
//     );
//   },
// );