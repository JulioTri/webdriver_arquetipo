// features/mobile/shared/Tasks/Login.ts
import { Task } from '@serenity-js/core';
import { ClearAndEnter } from './ClearAndEnter';
import { TapWhenVisible } from './TapWhenVisible';
import { LoginSelectors } from '../UI/LoginSelectors';
import { DismissKeyboard } from '../Interactions/DismissKeyboard';
import { WaitForDisplayed } from '../Interactions/WaitFor';

export const Login = {
  withCredentials: (ui: LoginSelectors, user: string, password: string) =>
    Task.where(
      `#actor inicia sesión con credenciales`,

      // Navegación opcional hasta la pantalla de Login (apps donde no es la home).
      ...(ui.openLogin ?? []).map(sel => TapWhenVisible.on(sel)),

      // Compatibilidad con flujos previos que tenían un botón inicial "ingresar".
      ...(ui.buttonLogin ? [TapWhenVisible.on(ui.buttonLogin)] : []),

      WaitForDisplayed.of(ui.inputUser),
      TapWhenVisible.on(ui.inputUser),
      ClearAndEnter.value(user).into(ui.inputUser),

      TapWhenVisible.on(ui.inputPassword),
      ClearAndEnter.value(password).into(ui.inputPassword),

      DismissKeyboard({ tapOutsideSelector: ui.inputUser }),

      TapWhenVisible.on(ui.buttonSubmit),
    ),
};
