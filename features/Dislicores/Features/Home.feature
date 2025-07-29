Feature: Dislicores Page Home 

    Background:
        Given a user named Julio navigate to "https://d1e8vhps5noqgy.cloudfront.net/"
        Then he should see that the text "Iniciar sesión" equals the expected text
        Then he clicks on the Iniciar sesión button
        Then he waits until the sidebar is displayed
        Then he enters the username "1088021485" and password "1234"

    Scenario: Select a subsidiary
       Then he selects a subsidiary "001"
       Then he puts in the search engine the products defined in the route "C:\Pragma_Julio\Proyectos\webdriverio\proyecto_v1\features\Dislicores\JSON\products\products.json"
       Then he continue with checkout
       Then he pay with "C:\Pragma_Julio\Proyectos\webdriverio\proyecto_v1\features\Dislicores\JSON\checkout\methods.json" method
       Then he validate the payment