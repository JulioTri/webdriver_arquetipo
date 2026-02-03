import { Task } from '@serenity-js/core';
import { ClearAndEnter } from '../../../shared/Tasks/ClearAndEnter';
import { TapWhenVisible } from '../../../shared/Tasks/TapWhenVisible';
import { LoginUI } from '../../UI/LoginUI';

export const Login = {
withCredentials: (user: string, password: string) =>
    Task.where(
      `#actor inicia sesión con credenciales`,
      TapWhenVisible.on(LoginUI.button_login),

      TapWhenVisible.on(LoginUI.input_user),
      ClearAndEnter.value(user).into(LoginUI.input_user),

      TapWhenVisible.on(LoginUI.input_password),
      ClearAndEnter.value(password).into(LoginUI.input_password),

      TapWhenVisible.on(LoginUI.button_ingresar),
    ),
    // successOrError: () =>
    // Task.where(
    //   `#actor verifica resultado del login`,
    //   Check.whether(HomeScreen.marker, isVisible())
    //     .andIfSo(
    //       Wait.until(HomeScreen.marker, isVisible()),
    //     )
    //     .otherwise(
    //       Wait.until(LoginScreen.credentialsError, isVisible()),
    //     ),
    // ),
};
