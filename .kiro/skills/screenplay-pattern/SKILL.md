---
name: screenplay-pattern
description: Implementar Screenplay Pattern con Serenity/JS v3 y WebdriverIO v9 en Web, Mobile (Appium) y API REST. Cubre Tasks, Interactions, Questions, UI Mapping, composición con Task.where, uso correcto de PageElement/By en web, selectores string en mobile, y ChangeApiConfig/Send en API. Usar al crear o refactorizar cualquier componente Screenplay.
---

# Skill: Screenplay Pattern (Serenity/JS v3 + WebdriverIO v9)

## Pregunta obligatoria antes de generar código

```
¿Este componente es para:
1. Web (desktop browser)
2. Mobile nativo (Android/iOS via Appium)
3. API REST
4. Híbrido (WebView)?
```

NO asumir el contexto. Cada plataforma tiene reglas distintas.

---

## Componentes Screenplay y responsabilidades

| Componente | Responsabilidad | Ejemplo |
|---|---|---|
| **Actor** | Quién ejecuta | `actorCalled('Pepito')` |
| **Ability** | Capacidad técnica del actor | `BrowseTheWeb.using(browser)`, `CallAnApi.at(url)` |
| **Task** | Qué hace (negocio) | `LlenarFormulario.conDataset('x')` |
| **Interaction** | Cómo lo hace (técnico) | `Click.on(...)`, `Tap.on(...)` |
| **Question** | Qué observa | `Text.of(...)`, `TextOf(selector)` |
| **UI Mapping** | Dónde está | `LoginUI.buttonLogin()` |

**Regla de oro:** Tasks describen negocio. Interactions describen mecánica. Nunca mezclar.

---

## 🌐 WEB

### Imports correctos (v3)

```typescript
import { Task, Duration, Answerable } from '@serenity-js/core';
import { Click, Enter, Clear, Wait, PageElement, By } from '@serenity-js/web';
import { isClickable, isVisible, not } from '@serenity-js/assertions';
```

### UI Mapping con PageElement

```typescript
// features/web/UI/<Modulo>/<Modulo>UI.ts
import { PageElement, By } from '@serenity-js/web';

export class LoginUI {
  static buttonLogin = () =>
    PageElement.located(By.xpath("//button[@id='btn-login']"))
               .describedAs('button for login');

  static userInput = () =>
    PageElement.located(By.css('input#username'))
               .describedAs('input for user');
}
```

**Prioridad de selectores en Web:**
1. `By.id('...')`
2. `By.css('[data-testid="..."]')`
3. Texto visible (`PageElements.located(...).where(Text, includes('...'))`)
4. `By.css('...')`
5. `By.xpath('...')` (último recurso)

### Task con Task.where

```typescript
// features/web/Tasks/<Modulo>/<Task>.ts
import { Task } from '@serenity-js/core';
import { ClickWhenReady } from '../../shared/Tasks/ClickWhenReady';
import { ClearAndEnter } from '../../shared/Tasks/ClearAndEnter';
import { LoginUI } from '../../UI/Login/LoginUI';

export class LoginTask {
  static signInWith = (user: string, password: string) =>
    Task.where(
      `#actor inicia sesión con el usuario ${ user }`,
      ClearAndEnter.theValue(user).into(LoginUI.userInput()),
      ClearAndEnter.theValue(password).into(LoginUI.passwordInput()),
      ClickWhenReady.on(LoginUI.buttonLogin()),
    );
}
```

### Shared Tasks reutilizables (web)

```typescript
// features/web/shared/Tasks/ClickWhenReady.ts
import { Task, Duration, Answerable } from '@serenity-js/core';
import { Click, Wait, PageElement } from '@serenity-js/web';
import { isClickable } from '@serenity-js/assertions';

export class ClickWhenReady {
  static on = (element: Answerable<PageElement>) =>
    Task.where(`#actor hace clic cuando el elemento está listo`,
      Wait.upTo(Duration.ofSeconds(10)).until(element, isClickable()),
      Click.on(element),
    );
}

// features/web/shared/Tasks/ClearAndEnter.ts
import { Clear, Enter } from '@serenity-js/web';

export class ClearAndEnter {
  static theValue = (value: string) => ({
    into: (element: Answerable<PageElement>) =>
      Task.where(`#actor limpia y escribe "${ value }"`,
        Clear.theValueOf(element),
        Enter.theValue(value).into(element),
      ),
  });
}

// features/web/shared/Tasks/WaitUntilGone.ts
import { Wait } from '@serenity-js/web';
import { isVisible, not } from '@serenity-js/assertions';

export const WaitUntilGone = {
  the: (element: Answerable<PageElement>) =>
    Task.where(`#actor espera que el elemento desaparezca`,
      Wait.upTo(Duration.ofSeconds(30)).until(element, not(isVisible())),
    ),
};
```

### Question (web) — usar APIs nativas

```typescript
import { Text } from '@serenity-js/web';
import { Ensure, equals } from '@serenity-js/assertions';

// Uso directo en Then:
await actor.attemptsTo(
  Ensure.that(Text.of(LoginUI.welcomeMessage()), equals('Bienvenido')),
);
```

### ✅ OBLIGATORIO en Web

- `@serenity-js/web` para todo (Click, Enter, Clear, Wait, Text, PageElement, By)
- `Wait.until(element, isClickable())` o `isVisible()` antes de interactuar
- `Task.where()` para componer Interactions
- `describedAs(...)` en cada PageElement (mejora reportes)

### ❌ PROHIBIDO en Web

- `browser.$(...)` directo en Tasks o Steps
- `Target` (API legacy de Serenity/JS v2)
- `resolveFor(actor)` (anti-patrón)
- `browser.pause()` o `setTimeout`
- Callbacks en `Task.where` (siempre `async/await` en Interactions)

---

## 📱 MOBILE (Android / iOS via Appium)

### ⚠️ Restricción crítica

`@serenity-js/web` **NO funciona** en mobile nativo. Ver skill `serenity-troubleshooting` para detalles.

### Imports correctos para mobile

```typescript
import { Interaction, Task, Question, Duration } from '@serenity-js/core';
import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { browser } from '@wdio/globals';
```

### UI Mapping con strings (no PageElement)

```typescript
// features/mobile/shared/UI/LoginSelectors.ts — interfaz
export interface LoginSelectors {
  buttonLogin: string;
  inputUser: string;
  inputPassword: string;
  buttonSubmit: string;
}

// features/mobile/android/UI/LoginUI.android.ts
import { LoginSelectors } from '../../shared/UI/LoginSelectors';

export const AndroidLoginUI: LoginSelectors = {
  buttonLogin:    '~login-button',         // accessibility id (preferido)
  inputUser:      '~username-input',
  inputPassword:  '~password-input',
  buttonSubmit:   '~submit-button',
};

// features/mobile/ios/UI/LoginUI.ios.ts
export const IOSLoginUI: LoginSelectors = {
  buttonLogin:    '~login-button',
  inputUser:      '~username-input',
  inputPassword:  '~password-input',
  buttonSubmit:   '~submit-button',
};
```

**Prioridad de selectores en Mobile:**
1. Accessibility ID (`~id`) ← preferido siempre
2. iOS Predicate (`-ios predicate string:...`)
3. UiAutomator2 (`android=...`)
4. XPath (último recurso, frágil en mobile)

### PlatformUI Resolver (Android/iOS)

```typescript
// features/mobile/shared/Resolvers/PlatformUI.ts
import { AndroidLoginUI } from '../../android/UI/LoginUI.android';
import { IOSLoginUI }     from '../../ios/UI/LoginUI.ios';
import { LoginSelectors } from '../UI/LoginSelectors';

export class PlatformUI {
  static login(): LoginSelectors {
    return (process.env.MOBILE_PLATFORM || '').toLowerCase() === 'ios'
      ? IOSLoginUI
      : AndroidLoginUI;
  }
}
```

### Interaction (encapsula browser.$)

```typescript
// features/mobile/shared/Interactions/Tap.ts
import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export class Tap extends Interaction {
  static on(selector: string): Tap {
    return new Tap(selector);
  }

  constructor(private readonly selector: string) {
    super(`#actor taps on ${ selector }`);
  }

  async performAs(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const el = await browser.$(this.selector);
    await el.waitForExist({ timeout: 15_000 });
    await el.waitForDisplayed({ timeout: 15_000 });
    await el.click();
  }
}
```

### Task que compone Interactions

```typescript
// features/mobile/shared/Tasks/TapWhenVisible.ts
import { Duration, Task } from '@serenity-js/core';
import { WaitForDisplayed } from '../Interactions/WaitFor';
import { Tap } from '../Interactions/Tap';

export const TapWhenVisible = {
  on: (selector: string) =>
    Task.where(
      `#actor toca ${ selector } cuando está visible`,
      WaitForDisplayed.of(selector, Duration.ofSeconds(15)),
      Tap.on(selector),
    ),
};
```

### Question (mobile)

```typescript
// features/mobile/shared/Questions/TextOf.ts
import { Question } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export const TextOf = (selector: string) =>
  Question.about<string>(`texto de ${ selector }`, async () => {
    const el = await browser.$(selector);
    await el.waitForExist({ timeout: 15_000 });
    return el.getText();
  });
```

### ✅ OBLIGATORIO en Mobile

- Selectores como `string` (NO `PageElement`)
- `browser.$()` solo dentro de Interactions o Questions (encapsulado)
- `waitForExist` + `waitForDisplayed` antes de cada acción
- Resolver `PlatformUI` para diferenciar Android/iOS
- Tasks describen negocio, Interactions tocan WebdriverIO

### ❌ PROHIBIDO en Mobile

- `@serenity-js/web` (no funciona en NATIVE_APP)
- `PageElement`, `By`, `Click`, `Enter`, `Text` de Serenity/JS web
- `browser.$` directo en Tasks o Steps
- Hard waits (`browser.pause`, `setTimeout`)

---

## 🔌 API REST

### Imports correctos

```typescript
import { actorCalled, Task } from '@serenity-js/core';
import { CallAnApi, Send, GetRequest, PostRequest, ChangeApiConfig, LastResponse } from '@serenity-js/rest';
import { Ensure, equals } from '@serenity-js/assertions';
```

### Setup del Actor con CallAnApi

```typescript
// En step Given:
import { actorCalled } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';

actorCalled('Jorge').whoCan(CallAnApi.at(process.env.API_BASE_URL!));
```

### Task: cambiar base URL

```typescript
// features/api/Tasks/UsarApi.ts
import { Task } from '@serenity-js/core';
import { ChangeApiConfig } from '@serenity-js/rest';

export class UsarApi {
  static baseUrl = (url: string) =>
    Task.where(
      `#actor usa la API ${ url }`,
      ChangeApiConfig.setUrlTo(url),
    );
}
```

### Task: GET / POST

```typescript
// features/api/Tasks/ConsultarHealth.ts
import { Task } from '@serenity-js/core';
import { Send, GetRequest } from '@serenity-js/rest';

export class ConsultarHealth {
  static en = (endpoint: string) =>
    Task.where(`#actor consulta ${ endpoint }`,
      Send.a(GetRequest.to(endpoint)),
    );
}

// features/api/Tasks/CrearRecurso.ts
import { Task } from '@serenity-js/core';
import { Send, PostRequest } from '@serenity-js/rest';

export class CrearRecurso {
  static en = (endpoint: string, body: Record<string, unknown>) =>
    Task.where(`#actor crea recurso en ${ endpoint }`,
      Send.a(PostRequest.to(endpoint).with(body)),
    );
}
```

### Question: extraer del response

```typescript
// features/api/Questions/ResponseBody.ts
import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

export const StatusCode = () =>
  Question.about<number>('status code', async actor =>
    LastResponse.status().answeredBy(actor),
  );

// O directamente en el step:
import { LastResponse } from '@serenity-js/rest';
import { Ensure, equals } from '@serenity-js/assertions';

await actor.attemptsTo(
  Ensure.that(LastResponse.status(), equals(200)),
);
```

---

## Composición con Task.where

```typescript
Task.where(
  '#actor hace algo coherente de negocio',
  PrimeraSubTask,        // puede ser Task o Interaction
  SegundaSubTask,
  TerceraInteraction,
);
```

**Reglas:**
- El primer argumento es una descripción legible (`#actor` se reemplaza por el nombre del actor en el reporte)
- Los siguientes son Tasks/Interactions a ejecutar **en orden secuencial**
- NO usar callbacks asíncronos como argumento
- Una Task = una responsabilidad de negocio coherente

---

## Estándares transversales

- TypeScript con `strict: true`
- `async/await` siempre, nunca `.then()`
- `describedAs(...)` en PageElements (web) y descripciones legibles en Tasks/Interactions (mobile)
- Datos de prueba en JSON dentro de `features/[web|api]/Data/`
- DRY: shared Tasks/Interactions reutilizables en `shared/`

---

## Errores arquitectónicos prohibidos

- Tasks que hacen más de una responsabilidad de negocio
- Lógica condicional en Tasks (`if` para decidir qué hacer) — separar en Tasks distintas
- Questions con efectos secundarios (cambiar estado, hacer click, etc.)
- Mezclar `browser.$` + Screenplay en el mismo nivel (Web)
- Reescribir desde cero cuando se puede refactorizar
- Crear nuevas Interactions cuando ya existen las de `@serenity-js/web` (en web)

---

## Checklist de calidad

Antes de entregar cualquier componente:

- [ ] El contexto está claro (Web/Mobile/API)
- [ ] Los imports usan el módulo correcto (`@serenity-js/web` solo en web)
- [ ] Cada Task tiene una descripción `#actor ...` clara y de negocio
- [ ] Los selectores siguen la prioridad correcta (id → testid → texto → css → xpath)
- [ ] No hay `browser.$` fuera de Interactions/Questions (en mobile)
- [ ] No hay hard waits
- [ ] Las Tasks reutilizan Tasks/Interactions existentes en `shared/`
- [ ] PageElements (web) tienen `describedAs(...)`
- [ ] Mobile UI usa `string` y resolver `PlatformUI` cuando aplica multiplataforma
