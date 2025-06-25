import { Task } from '@serenity-js/core';
import { Click } from '../../Interactions/Utils/Click';
import { WaitForElement } from '../../Interactions/Utils/WaitForElement';
import { WriteInInput } from '../../Interactions/Utils/WriteInInput';
import { LoginUI } from '../../UI/Login/LoginUI';

export const LoginTask = {

  waitForAStartButton: () =>
    Task.where(
      '#actor wait for initial text',
      WaitForElement.toBeVisible(LoginUI.buttonLogin())
    ),
    clickLogin: () =>
        Task.where(
          '#actor clicks on the login button',
          Click.on(LoginUI.buttonLogin())
        ),
    waitForASidebar: () =>
        Task.where(
          '#actor wait for sidebar',
          WaitForElement.toBeVisible(LoginUI.modal())
        ),
    // enterCredentials : () =>
    //     Task.where(
    //       '#actor clicks on the login button',
    //       LoginUI.buttonCloseSidebarIngresar().click()
    //     ),
    enterCredentials : (user:string, password:string) =>
        Task.where(
          '#actor put the credentials',
          WaitForElement.toBeVisible(LoginUI.userInput()),
          WaitForElement.toBeStable(LoginUI.userInput()),
          WriteInInput.text(user).into(LoginUI.userInput()),
          WriteInInput.text(password).into(LoginUI.passwordInput()),
          Click.on(LoginUI.buttonIngresar()),
        ),

}