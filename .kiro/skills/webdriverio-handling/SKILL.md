---
name: webdriverio-handling
description: Usar WebdriverIO v9 en TypeScript tanto de forma directa (scripts standalone, sin patrón) como encapsulado dentro de Screenplay Pattern (Interactions y Questions). Cubre browser/$, $$, mobile commands (swipe, scrollIntoView, longPress, action API), addCommand/overwriteCommand, manejo de contextos NATIVE_APP/WEBVIEW, capabilities, custom commands y cuándo elegir cada enfoque. Usar cuando se necesite escribir código WDIO puro, encapsularlo en una Interaction de Serenity, o decidir entre ambos enfoques.
---

# Skill: Manejo de WebdriverIO v9 (directo y dentro de Screenplay)

## Cuándo usar cada enfoque

| Escenario | Enfoque recomendado |
|---|---|
| Test de regresión BDD del proyecto | **Screenplay** (encapsulado en Interactions) |
| Spike rápido / prototipo / debug local | **WDIO directo** (script standalone) |
| Hooks de configuración (`before`, `after` en wdio.*.conf.ts) | **WDIO directo** |
| Workarounds del framework (overwriteCommand) | **WDIO directo** en config |
| Acción reutilizable en múltiples Tasks | **Interaction** que encapsule WDIO |
| Question reutilizable | **Question.about** que encapsule WDIO |
| Mobile (Appium) — cualquier acción nativa | **Interaction** encapsulando `browser.$` |
| Web — el comando ya existe en `@serenity-js/web` | **NO usar WDIO directo**, usar Screenplay/web |

**Regla del proyecto:** En Tasks y Steps **NUNCA** se usa `browser.$` directo. Se permite WDIO directo solo en:
1. Archivos `configs/wdio.*.conf.ts` (hooks `before`/`after`)
2. Clases que extienden `Interaction` o crean `Question.about`
3. Scripts standalone fuera de `features/` (debug, exploración)

---

## 1. WebdriverIO directo (sin Screenplay)

### Imports correctos en v9

```typescript
import { browser, $, $$, expect, driver } from '@wdio/globals';
```

- `browser` y `driver` son alias del mismo objeto en mobile
- `$` y `$$` están disponibles como globales o vía `browser.$` / `browser.$$`
- TypeScript: usar SIEMPRE `await` (v8+ es 100% async, ya no existe sync mode)

### Selectores básicos

```typescript
// CSS (web)
const button = await $('button#submit');
const inputs = await $$('input.form-control');

// XPath
const link = await $('//a[text()="Continuar"]');

// Accessibility ID (mobile, preferido)
const loginBtn = await $('~login-button');

// Android UiAutomator2
const androidEl = await $('android=new UiSelector().text("Aceptar")');

// iOS predicate / class chain
const iosEl = await $('-ios predicate string:label == "Submit"');
const iosChain = await $('-ios class chain:**/XCUIElementTypeButton[`label == "OK"`]');
```

### Acciones básicas

```typescript
// Click + setValue + clearValue
await (await $('~username')).click();
await (await $('~username')).setValue('pepito');
await (await $('~username')).clearValue();

// Verificaciones
const text = await (await $('h1')).getText();
const visible = await (await $('~spinner')).isDisplayed();
const enabled = await (await $('button')).isEnabled();
const value = await (await $('input')).getValue();

// Esperas (recomendado en lugar de browser.pause)
await (await $('~loader')).waitForExist({ timeout: 15_000 });
await (await $('~loader')).waitForDisplayed({ timeout: 15_000, reverse: true });
await (await $('button')).waitForClickable({ timeout: 10_000 });
```

### Patrón "guardar referencia" (performance)

`$()` consulta el DOM cada vez. Si vas a usar el elemento varias veces, guárdalo:

```typescript
// ❌ MAL — 3 queries al DOM
await (await $('~submit')).waitForDisplayed();
await (await $('~submit')).waitForClickable();
await (await $('~submit')).click();

// ✅ BIEN — 1 query
const submit = await $('~submit');
await submit.waitForDisplayed();
await submit.waitForClickable();
await submit.click();
```

### Mobile commands enriquecidos (WDIO v9)

WebdriverIO v9 añade comandos mobile que abstraen Appium. Preferir estos sobre `mobile: ...` crudos cuando estén disponibles:

```typescript
// Long press
await (await $('~Contacts')).longPress();

// Swipe en dirección (cross-platform)
await browser.swipe({ direction: 'up', percent: 0.6 });

// Scroll hasta elemento (cross-platform)
await (await $('~Settings')).scrollIntoView({ direction: 'down', maxScrolls: 10 });

// Comando Appium crudo (cuando WDIO no lo abstrae)
await driver.execute('mobile: swipeGesture', {
  direction: 'down',
  percent: 0.8,
});
```

### Action API (gestos personalizados)

Cuando los comandos enriquecidos no son suficientes:

```typescript
const rect = await browser.getWindowRect();
const x = Math.floor(rect.width * 0.5);
const startY = Math.floor(rect.height * 0.7);
const endY = Math.floor(rect.height * 0.3);

await browser
  .action('pointer', { parameters: { pointerType: 'touch' } })
  .move({ x, y: startY })
  .down()
  .pause(120)
  .move({ x, y: endY })
  .up()
  .perform();
```

### Manejo de contextos (apps híbridas)

```typescript
const contexts = await (browser as any).getContexts();
// devuelve algo como: ['NATIVE_APP', 'WEBVIEW_com.example.app']

const webview = contexts.find((c: string) => typeof c === 'string' && c.includes('WEBVIEW'));
if (!webview) throw new Error('No WEBVIEW context available');

await (browser as any).switchContext(webview);
// ... interactuar con el DOM ...
await (browser as any).switchContext('NATIVE_APP');
```

### Capabilities y session info

```typescript
const platform = String(browser.capabilities.platformName ?? '').toLowerCase();
const isAndroid = platform === 'android';
const isIOS = platform === 'ios';
const isMobile = browser.isMobile;
const isW3C = browser.isW3C;
```

### Custom commands (`addCommand` / `overwriteCommand`)

Solo en configs/hooks, nunca en Tasks:

```typescript
// configs/wdio.shared.conf.ts (hook before)
before: async function () {
  if (!browser?.isMobile) return;

  // Añadir nuevo comando
  (browser as any).addCommand('clickWithRetry',
    async function (this: WebdriverIO.Element, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try { return await this.click(); }
        catch (e) { if (i === retries - 1) throw e; }
      }
    },
    true, // attachToElement
  );

  // Sobrescribir uno existente (caso real del proyecto)
  (browser as any).overwriteCommand('getWindowHandle',
    async function (orig: any, ...args: any[]) {
      try { return await orig(...args); }
      catch { return 'NATIVE-APP'; }
    },
  );
}
```

### Script standalone (debug / exploración)

```typescript
// scripts/debug-mobile.ts
import { remote } from 'webdriverio';

(async () => {
  const browser = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:app': './apps/android/app.apk',
    },
  });

  await browser.$('~login-button').click();
  console.log('clicked');
  await browser.deleteSession();
})();
```

Ejecutar con `tsx`: `npx tsx scripts/debug-mobile.ts`

---

## 2. WebdriverIO encapsulado en Screenplay

### Cuándo escribir una Interaction custom

- El proyecto está en mobile y `@serenity-js/web` no aplica
- Se necesita un gesto custom (swipe con coordenadas calculadas, longPress, etc.)
- La acción se reutilizará en múltiples Tasks
- Hay lógica de plataforma (Android vs iOS)

### Plantilla de Interaction encapsulando WDIO

```typescript
// features/mobile/shared/Interactions/<Nombre>.ts
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

### Plantilla de Interaction funcional (con `Interaction.where`)

Útil cuando la acción no necesita constructor con params complejos. Patrón usado en `DismissKeyboard` y `ScrollToBottomSafe` del proyecto:

```typescript
// features/mobile/shared/Interactions/<Nombre>.ts
import { Interaction } from '@serenity-js/core';
import { browser } from '@wdio/globals';

type Options = {
  maxSwipes?: number;
  pressMs?: number;
};

export const ScrollUp = (options: Options = {}) => {
  const cfg = {
    maxSwipes: options.maxSwipes ?? 10,
    pressMs: options.pressMs ?? 120,
  };

  const perform = async () => {
    const rect = await browser.getWindowRect();
    const x = Math.floor(rect.width * 0.5);
    const startY = Math.floor(rect.height * 0.7);
    const endY = Math.floor(rect.height * 0.3);

    for (let i = 0; i < cfg.maxSwipes; i++) {
      await browser
        .action('pointer', { parameters: { pointerType: 'touch' } })
        .move({ x, y: startY })
        .down()
        .pause(cfg.pressMs)
        .move({ x, y: endY })
        .up()
        .perform();
    }
  };

  return Interaction.where(`#actor scrolls up`, perform);
};
```

### Plantilla de Question encapsulando WDIO

```typescript
// features/mobile/shared/Questions/IsVisible.ts
import { Question } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export const IsVisible = (selector: string) =>
  Question.about<boolean>(`si ${ selector } está visible`, async () => {
    const el = await browser.$(selector);
    return el.isDisplayed().catch(() => false);
  });
```

```typescript
// features/mobile/shared/Questions/AttributeOf.ts
import { Question } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export const AttributeOf = (selector: string, attribute: string) =>
  Question.about<string | null>(`${ attribute } de ${ selector }`, async () => {
    const el = await browser.$(selector);
    await el.waitForExist({ timeout: 15_000 });
    return el.getAttribute(attribute);
  });
```

### Acción que difiere por plataforma

```typescript
// features/mobile/shared/Interactions/HideKeyboard.ts
import { Interaction } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export const HideKeyboard = () => Interaction.where(
  `#actor oculta el teclado`,
  async () => {
    const platform = String(browser.capabilities.platformName ?? '').toLowerCase();

    if (platform === 'android') {
      try { await (browser as any).hideKeyboard(); return; }
      catch { /* fallback */ }
    }

    if (platform === 'ios') {
      try { await browser.execute('mobile: hideKeyboard'); return; }
      catch { /* ignore */ }
    }
  },
);
```

---

## 3. Reglas de encapsulación

### ❌ NUNCA hacer (en Tasks o Steps)

```typescript
// MAL: WDIO directo en step
When('Pepito hace login', async () => {
  await (await $('~user')).setValue('pepito');   // ❌
  await (await $('~submit')).click();             // ❌
});

// MAL: WDIO directo en Task
export const BadLogin = () => Task.where(
  `#actor login`,
  Interaction.where('clicks submit', async () => {
    await (await browser.$('~submit')).click();   // ❌ inline en Task
  }),
);
```

### ✅ SIEMPRE hacer

```typescript
// BIEN: encapsulado en Interaction reutilizable
export class Tap extends Interaction {
  // ... implementación con browser.$ ...
}

// BIEN: Task compuesta con Interactions
export const Login = {
  withCredentials: (ui: LoginSelectors, user: string, password: string) =>
    Task.where(`#actor inicia sesión con credenciales`,
      TapWhenVisible.on(ui.inputUser),
      ClearAndEnter.value(user).into(ui.inputUser),
      TapWhenVisible.on(ui.buttonSubmit),
    ),
};

// BIEN: Step delega a Task
When('{pronoun} logs in with username {string} and password {string}',
  async (actor: Actor, user: string, password: string) => {
    await actor.attemptsTo(
      Login.withCredentials(PlatformUI.login(), user, password),
    );
  },
);
```

---

## 4. Comandos WDIO clave (referencia rápida)

### Navegación (web)
| Comando | Uso |
|---|---|
| `browser.url(path)` | Navegar a URL |
| `browser.back()` / `browser.forward()` | Historial |
| `browser.refresh()` | Recargar |
| `browser.getUrl()` | URL actual |
| `browser.getTitle()` | Título página |

### Element queries
| Comando | Uso |
|---|---|
| `$(selector)` / `browser.$(...)` | Un elemento |
| `$$(selector)` / `browser.$$(...)` | Lista de elementos |
| `el.$('child')` / `el.$$('child')` | Búsqueda anidada |
| `el.parentElement()` | Padre directo |

### Interacciones
| Comando | Uso |
|---|---|
| `el.click({ button, x, y })` | Click con opciones |
| `el.doubleClick()` | Doble click |
| `el.setValue(text)` | Escribir (reemplaza) |
| `el.addValue(text)` | Concatenar |
| `el.clearValue()` | Vaciar input |
| `el.scrollIntoView()` | Scroll hasta el elemento |
| `el.dragAndDrop(target)` | Drag & drop |

### Esperas
| Comando | Uso |
|---|---|
| `el.waitForExist({ timeout })` | Existe en DOM |
| `el.waitForDisplayed({ timeout, reverse })` | Visible (reverse=invisible) |
| `el.waitForClickable({ timeout })` | Clickable |
| `el.waitForEnabled({ timeout })` | Habilitado |
| `browser.waitUntil(fn, { timeout })` | Condición custom |

### Mobile específicos (v9)
| Comando | Uso |
|---|---|
| `el.longPress({ duration })` | Long press |
| `el.scrollIntoView({ direction, maxScrolls })` | Scroll hasta el elemento |
| `browser.swipe({ direction, percent })` | Swipe direccional |
| `browser.getContexts()` | Listar contextos disponibles |
| `browser.switchContext(name)` | Cambiar contexto |
| `browser.execute('mobile: <gesture>', params)` | Comando Appium crudo |
| `browser.hideKeyboard()` | Ocultar teclado (Android) |

### Estado del browser
| Comando | Uso |
|---|---|
| `browser.isMobile` | bool — sesión mobile |
| `browser.isAndroid` / `browser.isIOS` | bool — plataforma |
| `browser.capabilities` | Capabilities activas |
| `browser.getWindowRect()` | `{ x, y, width, height }` |

---

## 5. Anti-patrones comunes

| Anti-patrón | Por qué está mal | Alternativa |
|---|---|---|
| `browser.pause(3000)` | Espera ciega, lenta y frágil | `waitForDisplayed` / `Wait.until` |
| `await $('btn').click()` (sin await en `$()`) | TypeError en runtime | `await (await $('btn')).click()` o guardar ref |
| `browser.$` en Tasks/Steps | Rompe Screenplay | Encapsular en Interaction |
| Repetir `$()` para mismo elemento | Múltiples queries al DOM | Guardar referencia |
| `setTimeout` para esperar UI | No bloquea el flujo correctamente | `browser.waitUntil` |
| `try/catch` que swallow errors silenciosamente | Tests verde-en-falso | Loggear o re-lanzar |
| `addCommand` dentro de un step | Ejecuta en cada test | Definir en hook `before` del config |
| `mobile: scroll` sin parámetros válidos por plataforma | `mobile: scrollGesture` (Android) ≠ `mobile: scroll` (iOS) | Usar `el.scrollIntoView()` cuando se pueda |

---

## 6. Decisión rápida: ¿directo o encapsulado?

```
¿El código vive en features/ o se ejecutará dentro de un escenario Cucumber?
├── SÍ
│   ├── ¿Es web y existe en @serenity-js/web?
│   │   └── SÍ → usar Click/Enter/Wait/Text de Serenity (NO WDIO)
│   └── NO existe en @serenity-js/web (mobile, gesto custom, etc.)
│       └── → encapsular en Interaction o Question
└── NO (config, hook, script standalone)
    └── → WDIO directo permitido
```

---

## Checklist de calidad

- [ ] No hay `browser.$` ni `$()` directo en Tasks ni Steps
- [ ] WDIO directo solo en configs, Interactions, Questions o scripts standalone
- [ ] Cada elemento usado >1 vez está guardado en variable
- [ ] No hay `browser.pause()` ni `setTimeout`
- [ ] Esperas usan `waitFor*` o `waitUntil` con timeout explícito
- [ ] `addCommand`/`overwriteCommand` solo en hooks de config, con comentario explicativo
- [ ] Comandos mobile usan API enriquecida v9 (`longPress`, `swipe`, `scrollIntoView`) cuando aplica
- [ ] Acciones que difieren por plataforma chequean `browser.capabilities.platformName`
- [ ] Cambios de contexto (NATIVE_APP/WEBVIEW) son explícitos y documentados
