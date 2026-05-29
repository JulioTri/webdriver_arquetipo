import { Then } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';

import { UserNameFromResponse } from '../../api/Questions/UserNameFromResponse';

Then(
  '{actor} debería ver el nombre {string} en la respuesta',
  async (actor: Actor, name: string) => {

    await actor.attemptsTo(
      Ensure.that(
        UserNameFromResponse(),
        equals(name),
      ),
    );
  },
);