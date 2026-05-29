// features/mobile/android/UI/LoginUI.android.ts
//
// Selectores para Sauce Labs Demo App (com.saucelabs.mydemoapp.android).
// Flujo: pantalla inicial = catálogo → menú lateral → "Log In".
//
// Referencia layout: app/src/main/res/layout/fragment_login.xml
//   nameET     → input usuario
//   passwordET → input contraseña
//   loginBtn   → botón Login
import { LoginSelectors } from '../../shared/UI/LoginSelectors';

const PKG = 'com.saucelabs.mydemoapp.android';

export const AndroidLoginUI: LoginSelectors = {
  // 1) Tap en el menú hamburguesa de la AppBar para desplegar el drawer.
  // 2) Tap en "Log In" dentro del drawer.
  openLogin: [
    '~View menu',                              // accessibility id (contentDescription)
    '//android.widget.TextView[@text="Log In"]',
  ],

  inputUser: `//*[@resource-id="${PKG}:id/nameET"]`,
  inputPassword: `//*[@resource-id="${PKG}:id/passwordET"]`,
  buttonSubmit: `//*[@resource-id="${PKG}:id/loginBtn"]`,
};
