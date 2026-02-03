Feature: Dislicores Page Home 

    Background:
        Given a user named Julio navigate to "https://d2gka11oliiwqi.cloudfront.net"
        # Given a user named Julio navigate to "https://dislicoresasunegocio.com/"
        Then he should see that the text "Iniciar sesión" equals the expected text
        Then he clicks on the Iniciar sesión button
        Then he waits until the sidebar is displayed
        # Then he enters the username "830081427" and password "8300"
        Then he enters the username "830081427" and password "1234"

    Scenario: Select a subsidiary
       Then he selects a subsidiary "004"
       Then he puts in the search engine the products defined in the route "D:\PRUEBAS\proyecto_v1_wdio9_multi_plataforma\proyecto_v1\features\Dislicores\JSON\products\products.json"
       Then he continue with checkout
       Then he pay with "D:\PRUEBAS\proyecto_v1_wdio9_multi_plataforma\proyecto_v1\features\Dislicores\JSON\checkout\methods.json" method
       Then he validate the payment