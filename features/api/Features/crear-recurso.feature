@api @regression
Feature: Creación de recursos

  @post @happy-path
  Scenario: Crear un recurso con POST
    Given que Jorge consume el servicio API
    When Jorge crea un recurso en "/post" con:
      | name  | Julio |
      | role  | qa    |
    Then Jorge debería recibir un código 200
    Then Jorge debería ver el nombre "Julio" en la respuesta
