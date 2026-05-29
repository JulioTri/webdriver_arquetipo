@api @smoke
Feature: Validación básica de APIs

  @health-check @happy-path
  Scenario: Consultar health del servicio
    Given que Jorge consume el servicio API
    When Jorge consulta el endpoint "/status/200"
    Then Jorge debería recibir un código 200
