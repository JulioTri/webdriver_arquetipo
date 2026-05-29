// features/mobile/shared/UI/LoginSelectors.ts
//
// Contrato de selectores para el flujo de Login.
// `openLogin` es opcional: en apps donde el login no es la pantalla inicial
// (ej. Sauce Labs Demo App), aquí se declara cómo navegar hasta él.
export interface LoginSelectors {
  /** Selectores para abrir la pantalla de Login (en orden de tap). Opcional. */
  openLogin?: string[];
  /** Input de usuario / email. */
  inputUser: string;
  /** Input de contraseña. */
  inputPassword: string;
  /** Botón que envía el formulario de login. */
  buttonSubmit: string;

  /** Compatibilidad hacia atrás (algunas apps tienen un "ingresa" inicial). */
  buttonLogin?: string;
}
