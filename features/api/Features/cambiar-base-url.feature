@api @regression
Feature: Cambio temporal de base URL usando FakerAPI

  @config
  Scenario: Cambiar la base URL a FakerAPI y consultar usuarios
    Given que Jorge consume el servicio API
    When Jorge cambia la base URL a "https://fakerapi.it"
    And Jorge consulta 5 usuario en FakerAPI
    Then Jorge debería recibir un código 200
    And Jorge debería ver un total de 5 registro en FakerAPI
    And Jorge debería ver el status "OK" en FakerAPI
