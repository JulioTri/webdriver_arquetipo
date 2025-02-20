import { Task } from '@serenity-js/core';
import { Click } from '../../Interactions/Utils/Click';
import { WaitForElement } from '../../Interactions/Utils/WaitForElement';
import { WriteInInput } from '../../Interactions/Utils/WriteInInput';
import { LoginUI } from '../../UI/Login/LoginUI';

export const LoginTask = {
    clickLogin: () =>
        Task.where(
          '#actor clicks on the login button',
          Click.on(LoginUI.buttonLogin())
        ),
    waitForASidebar: () =>
        Task.where(
          '#actor clicks on the login button',
          WaitForElement.toBeVisible(LoginUI.modal())
        ),
    // enterCredentials : () =>
    //     Task.where(
    //       '#actor clicks on the login button',
    //       LoginUI.buttonCloseSidebarIngresar().click()
    //     ),
    enterCredentials : (user:string, password:string) =>
        Task.where(
          '#actor clicks on the login button',
          WriteInInput.text(user).into(LoginUI.userInput()),
          WriteInInput.text(password).into(LoginUI.passwordInput()),
          Click.on(LoginUI.buttonIngresar()),
        ),

}