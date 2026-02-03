Feature: Login on Dislicores app

  Background:
      Given the user opens the application


  @happy-path
  Scenario: Successful login
    When the user logs in with username "1088021485" and password "1234"
    #Then the user should be logged in successfully and see the home screen

  @negative
  Scenario: Login fails due to invalid credentials
    When the user logs in with username "1088021485" and password "1234"
    #Then an invalid credentials error should be displayed and the execution should stop
