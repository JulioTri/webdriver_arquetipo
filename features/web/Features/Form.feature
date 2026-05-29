@web @form @regression
Feature: Gestión de formulario Practice Form

  @smoke @happy-path
  Scenario Outline: Registro exitoso de estudiante
    Given que <actor> accede al formulario de registro
    When <actor> diligencia el formulario con "<dataset>"
    Then <actor> envía la información
    Then <actor> debería ver los datos registrados correctamente de acuerdo a "<dataset>"

    Examples:
      | actor   | dataset            |
      | Pepito  | datos_estudiante   |
