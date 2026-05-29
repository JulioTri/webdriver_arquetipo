import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';
import { LastResponse } from '@serenity-js/rest';

import { ConsultarHealth } from '../../api/Tasks/ConsultarHealth';

setDefaultTimeout(60_000);

Given('que {actor} consume el servicio API', async (_actor: Actor) => {
  // No necesitas hacer nada aquí por ahora.
  // La habilidad CallAnApi la aporta Serenity/JS a través de WebdriverIO
  // usando el baseUrl del wdio.api.conf.ts
});

When('{actor} consulta el endpoint {string}', async (actor: Actor, endpoint: string) => {
  await actor.attemptsTo(
    ConsultarHealth.delEndpoint(endpoint),
  );
});

Then('{actor} debería recibir un código {int}', async (actor: Actor, statusCode: number) => {
  await actor.attemptsTo(
    Ensure.that(LastResponse.status(), equals(statusCode)),
  );
});