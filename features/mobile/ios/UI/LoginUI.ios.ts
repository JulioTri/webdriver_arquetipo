// features/mobile/ios/UI/LoginUI.ios.ts
//
// Selectores para Sauce Labs Demo App (com.saucelabs.mydemo.app.ios).
// Flujo: pantalla inicial = catálogo → menú → "Log In".
//
// La app no expone Accessibility IDs explícitos: se usan los `name` UIKit
// (label/title) vía predicate strings de XCUITest cuando es posible.
import { LoginSelectors } from '../../shared/UI/LoginSelectors';

export const IOSLoginUI: LoginSelectors = {
  // Predicate strings: rápidos y estables en XCUITest.
  openLogin: [
    '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "More-tab-item" OR label CONTAINS[c] "More")',
    '-ios predicate string:label == "Log In" OR name == "Log In"',
  ],

  inputUser: '-ios predicate string:type == "XCUIElementTypeTextField" AND (label CONTAINS[c] "Username" OR value CONTAINS[c] "Username")',
  inputPassword: '-ios predicate string:type == "XCUIElementTypeSecureTextField" AND (label CONTAINS[c] "Password" OR value CONTAINS[c] "Password")',
  buttonSubmit: '-ios predicate string:type == "XCUIElementTypeButton" AND (label == "Login" OR name == "Login")',
};
