// features/step-definitions/mobile/Mobile_login_steps.ts
import { Given, When } from '@cucumber/cucumber';
import { setDefaultTimeout } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';

import { Login } from '../../mobile/shared/Tasks/Login';
import { PlatformUI } from '../../mobile/shared/Resolvers/ PlatformUI';

setDefaultTimeout(200000);

Given('the user named {actor} opens the application', async (_actor: Actor) => {
});

When(
  '{pronoun} logs in with username {string} and password {string}',
  async (actor: Actor, username: string, password: string) => {
    await actor.attemptsTo(
      Login.withCredentials(PlatformUI.login(), username, password),
    );
  },
);