---
name: cucumber-gherkin
description: Crear, analizar y mantener archivos .feature de Cucumber con Gherkin en español, step definitions en TypeScript con Serenity/JS Screenplay Pattern, y parameter types personalizados ({actor}, {pronoun}). Usar cuando se necesite escribir escenarios BDD, mapear steps a Tasks/Questions, o diagnosticar problemas en features existentes.
---

# Skill: Cucumber + Gherkin para Serenity/JS

## Contexto del proyecto

Este proyecto usa:
- **Cucumber v11** con Gherkin en **español**
- **Serenity/JS v3.31+** con Screenplay Pattern
- **WebdriverIO v9** como runner
- **TypeScript** con `strict: true`
- Parameter types personalizados: `{actor}` y `{pronoun}` (definidos en `features/support/parameter.config.ts`)

---

## Reglas obligatorias antes de generar cualquier cosa

1. **Preguntar el contexto** si no está claro:
   - ¿Es Web, Mobile nativo (Appium) o API REST?
2. **Leer el `.feature` existente** antes de crear steps.
3. **Respetar la estructura de carpetas**:
   - Features → `features/[web|mobile/android|mobile/ios|api]/Features/*.feature`
   - Steps → `features/step-definitions/[web|mobile|api]/*.steps.ts`
4. **Nunca asumir** selectores, Tasks ni Questions — leer los archivos existentes primero.

---

## Estructura de un archivo `.feature`

### Patrón del proyecto (Web)

```gherkin
Feature: <Descripción del módulo funcional>

  @<tag>
  Scenario Outline: <Nombre del escenario en español>
    Given que <actor> <precondición>
    When <actor> <acción principal>
    And <actor> <acción secundaria>
    Then <actor> debería <resultado esperado>

    Examples:
      | actor   | dataset          |
      | Pepito  | datos_ejemplo    |
```

### Patrón del proyecto (Mobile)

```gherkin
Feature: <Descripción del módulo funcional>

  Scenario: <Nombre del escenario>
    Given the user named <actor> opens the application
    When he logs in with username "<usuario>" and password "<clave>"
    Then he should see the home screen
```

### Patrón del proyecto (API)

```gherkin
Feature: <Descripción del módulo de API>

  Scenario: <Nombre del escenario>
    Given que <actor> consume el servicio API
    When <actor> consulta el endpoint "<ruta>"
    Then <actor> debería recibir un código <código>
```

---

## Reglas de Gherkin

### ✅ Obligatorio

- Idioma: **español** para Web y API, **inglés** para Mobile (por convención del proyecto)
- Un escenario = una responsabilidad de negocio
- Usar `Scenario Outline` + `Examples` cuando hay múltiples datasets
- Tags con `@` para filtrar ejecuciones (ej: `@form`, `@login`, `@smoke`)
- Nombres de actores con **mayúscula inicial** (ej: `Pepito`, `Jorge`, `Ana`) — el parameter type `{actor}` usa regex `/[A-Z][a-z]+/`
- Pronombres en inglés para mobile: `he`, `she`, `they`, `his`, `her`, `their`

### ❌ Prohibido

- Detalles técnicos en Gherkin (selectores, XPath, IDs)
- Lógica condicional en steps (`if`, `switch`)
- Más de un `When` por escenario (usar `And`)
- Escenarios dependientes entre sí
- Hard-coded waits en steps

---

## Estructura de un Step Definition

### Patrón Web

```typescript
// features/step-definitions/web/<modulo>.steps.ts
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { <Task> } from '../../web/Tasks/<Modulo>/<Task>';

setDefaultTimeout(200_000);

Given('que {actor} <precondición>', async (actor: Actor) => {
  await actor.attemptsTo(
    <Task>.<metodo>(),
  );
});

When('{actor} <acción> con {string}', async (actor: Actor, dato: string) => {
  await actor.attemptsTo(
    <Task>.<metodo>(dato),
  );
});

Then('{actor} debería <resultado> de acuerdo a {string}', async (actor: Actor, dataset: string) => {
  await actor.attemptsTo(
    <Task>.<metodo>(dataset),
  );
});
```

### Patrón Mobile

```typescript
// features/step-definitions/mobile/<modulo>.steps.ts
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { <Task> } from '../../mobile/shared/Tasks/<Task>';
import { PlatformUI } from '../../mobile/shared/Resolvers/ PlatformUI';

setDefaultTimeout(200_000);

Given('the user named {actor} opens the application', async (_actor: Actor) => {
  // Inicialización si aplica
});

When('{pronoun} logs in with username {string} and password {string}',
  async (actor: Actor, username: string, password: string) => {
    await actor.attemptsTo(
      <Task>.withCredentials(PlatformUI.<modulo>(), username, password),
    );
  },
);
```

### Patrón API

```typescript
// features/step-definitions/api/<modulo>.steps.ts
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { <Task> } from '../../api/Tasks/<Task>';

setDefaultTimeout(120_000);

Given('que {actor} consume el servicio API', async (_actor: Actor) => {
  // Setup del actor con CallAnApi ability
});

When('{actor} consulta el endpoint {string}', async (actor: Actor, endpoint: string) => {
  await actor.attemptsTo(
    <Task>.get(endpoint),
  );
});

Then('{actor} debería recibir un código {int}', async (actor: Actor, statusCode: number) => {
  await actor.attemptsTo(
    Ensure.that(<Question>, equals(statusCode)),
  );
});
```

---

## Parameter types del proyecto

Definidos en `features/support/parameter.config.ts`:

| Parameter | Regex | Transformer | Uso |
|---|---|---|---|
| `{actor}` | `/[A-Z][a-z]+/` | `actorCalled(name)` | Nombre del actor (ej: `Pepito`) |
| `{pronoun}` | `/he\|she\|they\|his\|her\|their/` | `actorInTheSpotlight()` | Referencia al actor activo |

**Regla**: Usar `{actor}` en el primer step del escenario. Usar `{pronoun}` en steps subsiguientes que referencian al mismo actor.

---

## Mapeo Gherkin → Screenplay

| Elemento Gherkin | Elemento Screenplay | Ubicación |
|---|---|---|
| `Given` | Task de precondición / navegación | `Tasks/` |
| `When` | Task de acción principal | `Tasks/` |
| `Then` | Task de verificación o Question + Ensure | `Tasks/` o `Questions/` |
| `And` | Composición dentro de Task existente | `Tasks/` |
| Actor en step | `actorCalled('Nombre')` | `parameter.config.ts` |

---

## Flujo para crear un nuevo escenario

1. **Identificar el módulo** → determinar carpeta en `features/[web|mobile|api]/`
2. **Escribir el `.feature`** → lenguaje de negocio, sin detalles técnicos
3. **Verificar si ya existen Tasks/UI** → leer archivos en `Tasks/` y `UI/`
4. **Crear o reutilizar Tasks** → nunca duplicar lógica existente
5. **Crear el step definition** → importar Tasks, usar `{actor}` / `{pronoun}`
6. **Registrar el step file** en `cucumberOpts.import` del config correspondiente

---

## Checklist de calidad

Antes de entregar cualquier `.feature` o step definition, verificar:

- [ ] El `.feature` no contiene detalles técnicos (selectores, IDs, XPath)
- [ ] Cada escenario tiene una sola responsabilidad
- [ ] Los nombres de actores usan mayúscula inicial
- [ ] El step definition tiene `setDefaultTimeout` (200_000 para web/mobile, 120_000 para API)
- [ ] Cada step delega a una Task (nunca lógica directa en el step)
- [ ] No hay `browser.pause()` ni `setTimeout` en ningún step
- [ ] El archivo está en la carpeta correcta según el contexto (web/mobile/api)
- [ ] Los imports usan rutas relativas correctas desde `step-definitions/`
