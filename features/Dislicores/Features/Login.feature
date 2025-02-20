Feature: Login on Dislicores

  Scenario: Navigate to the Dislicores QA URL and log in
    Given a user named Julio navigate to "https://d2gka11oliiwqi.cloudfront.net/"
    Then he should see that the text "Iniciar sesión" equals the expected text
    Then he clicks on the Iniciar sesión button
    Then he waits until the sidebar is displayed
    Then he enters the username "1088021485" and password "1234"