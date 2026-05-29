import { When, Then } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';

import { UsarApi } from '../../api/Tasks/UsarApi';
import { ConsultarUsuariosFaker } from '../../api/Tasks/ConsultarDireccionesFaker';
import { FakerApiTotalFromResponse } from '../../api/Questions/FakerApiTotalFromResponse';
import { FakerApiStatusFromResponse } from '../../api/Questions/FakerApiStatusFromResponse';


When('{actor} cambia la base URL a {string}', async (actor: Actor, url: string) => {
  await actor.attemptsTo(
    UsarApi.baseUrl(url),
  );
});

When('{actor} consulta {int} usuario en FakerAPI', async (actor: Actor, quantity: number) => {
  await actor.attemptsTo(
    ConsultarUsuariosFaker.conCantidad(quantity),
  );
});

Then('{actor} debería ver un total de {int} registro en FakerAPI', async (actor: Actor, total: number) => {
  await actor.attemptsTo(
    Ensure.that(
      FakerApiTotalFromResponse(),
      equals(total),
    ),
  );
});

Then('{actor} debería ver el status {string} en FakerAPI', async (actor: Actor, expectedStatus: string) => {
  await actor.attemptsTo(
    Ensure.that(
      FakerApiStatusFromResponse(),
      equals(expectedStatus),
    ),
  );
});