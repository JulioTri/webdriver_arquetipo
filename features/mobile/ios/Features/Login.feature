@mobile @ios @login @regression
Feature: Login en Sauce Labs Demo App (iOS)

  La app abre en el catálogo. El test navega al menú "More" y entra al
  formulario de Log In. Credenciales válidas publicadas por Sauce Labs
  en la propia app: bob@example.com / 10203040.

  Background:
    Given the user named Julio opens the application


  @smoke @happy-path
  Scenario: Successful login with valid credentials
    When he logs in with username "bob@example.com" and password "10203040"
    #Then the products catalog should be displayed for the logged in user

  @negative
  Scenario: Login fails with invalid credentials
    When he logs in with username "invalid@example.com" and password "wrong-pass"
    #Then an invalid credentials error should be displayed
