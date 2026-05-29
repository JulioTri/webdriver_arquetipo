---
name: serenity-troubleshooting
description: Diagnosticar y documentar errores, limitaciones e impedimentos de Serenity/JS v3 + WebdriverIO v9 en Web y Mobile (Appium). Incluye el workaround de window handles para NATIVE_APP, alternativas cuando @serenity-js/web no aplica, problemas de timeouts, contextos híbridos WebView, y cómo documentar correctamente cada workaround. Usar cuando aparezca un error técnico, un comportamiento inesperado del framework, o se necesite explicar por qué se aplica un patch.
---

# Skill: Diagnóstico y Workarounds Serenity/JS

## Filosofía del proyecto

> Mobile ≠ Web. Nunca asumir compatibilidad.

Serenity/JS está optimizado para web. En mobile nativo y contextos híbridos hay limitaciones reales del framework que requieren workarounds documentados.

**Reglas para todo workaround:**
1. Documentar **por qué** se aplica (contexto del problema)
2. Documentar **dónde** aplica (alcance: solo mobile, solo iOS, etc.)
3. Documentar **dónde NO replicarlo** (Tasks, Steps, etc.)
4. Citar la fuente o issue oficial cuando sea posible
5. Aislarlo en una sola capa (config, helper, Interaction encapsulada)

---

## 🚨 Problema #1: `getWindowHandle` / `getWindowHandles` en NATIVE_APP

### Síntomas

- Error `unknown command` o HTTP `404` al ejecutar Questions con `PageElement` en mobile
- Mensajes tipo: `Method has not yet been implemented`, `window`, `window/handles`
- Falla aunque los selectores sean correctos

### Causa raíz

`BrowseTheWebWithWebdriverIO` (Serenity/JS) asume modelo de navegación web basado en window handles. Internamente invoca:

- `browser.getWindowHandle()` → `GET /window`
- `browser.getWindowHandles()` → `GET /window/handles`

En contexto `NATIVE_APP` (Appium Android/iOS), estos endpoints **no aplican** porque el concepto de "ventana" es solo del DOM. El driver responde "unknown command" y rompe la resolución de Questions.

### Workaround (ya implementado en `configs/wdio.shared.conf.ts`)

```typescript
before: async function () {
  if (!browser?.isMobile) return;

  const isUnsupported = (error: any) => {
    const msg  = String(error?.message ?? '');
    const name = String(error?.name ?? '');
    return (
      name.includes('UnknownCommand') ||
      msg.includes('unknown command') ||
      msg.includes('window') ||
      msg.includes('window/handles') ||
      msg.includes('404')
    );
  };

  const b = browser as any;
  const FALLBACK_HANDLE = 'NATIVE-APP';   // sin "_" — debe matchear ^[\d.A-Za-z-]+$

  b.overwriteCommand('getWindowHandle', async function (orig: any, ...args: any[]) {
    try { return await orig(...args); }
    catch (e: any) {
      if (isUnsupported(e)) return FALLBACK_HANDLE;
      throw e;
    }
  });

  b.overwriteCommand('getWindowHandles', async function (orig: any, ...args: any[]) {
    try { return await orig(...args); }
    catch (e: any) {
      if (isUnsupported(e)) return [FALLBACK_HANDLE];
      throw e;
    }
  });
}
```

### Alcance

- ✅ Aplica solo si `browser.isMobile === true`
- ❌ No replicar en Tasks, Interactions ni Steps
- ❌ NO usar `_` (underscore) en el handle — el `CorrelationId` de Serenity/JS exige regex `^[\d.A-Za-z-]+$`

### Por qué este patrón está bien

- Aislado en `before` (una sola fuente de verdad)
- Solo se activa en mobile
- Comentado extensamente en el código del proyecto
- Permite que `@serenity-js/core` y `@serenity-js/cucumber` funcionen sin modificación

---

## 🚨 Problema #2: `@serenity-js/web` no funciona en mobile nativo

### Síntomas

- `Click.on(...)`, `Enter.theValue(...)`, `Text.of(...)` fallan en NATIVE_APP
- Errores al evaluar `PageElement.located(By.xpath(...))` con selectores nativos
- Question.about devuelve `undefined` o lanza error de DOM no encontrado

### Causa raíz

`@serenity-js/web` está diseñado para el modelo DOM de un navegador. En contexto Appium NATIVE_APP no hay DOM, sino árbol de elementos nativos.

### Alternativa correcta (Screenplay Pattern preservado)

**No degradar a usar `browser.$` directo en Tasks.** En su lugar:

1. **Crear Interactions custom** que extiendan `Interaction` y encapsulen `browser.$`
2. **Crear Questions custom** con `Question.about<T>(...)`
3. **Selectores como `string`**, no `PageElement`

```typescript
// ✅ CORRECTO — Interaction encapsulada
import { Interaction, UsesAbilities, AnswersQuestions } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export class Tap extends Interaction {
  static on(selector: string) { return new Tap(selector); }

  constructor(private readonly selector: string) {
    super(`#actor taps on ${ selector }`);
  }

  async performAs(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const el = await browser.$(this.selector);
    await el.waitForDisplayed({ timeout: 15_000 });
    await el.click();
  }
}

// ❌ INCORRECTO — browser.$ directo en Task
export const BadLogin = () => Task.where(`#actor login`,
  // NO HACER ESTO
  Interaction.where('clicks', async () => {
    await (await browser.$('~login')).click();
  }),
);
```

---

## 🚨 Problema #3: Selectores con `By.xpath` lentos o frágiles en mobile

### Síntomas

- Tests inestables (flakiness)
- Tiempos de espera que crecen con el tamaño de la app
- iOS especialmente lento con XPath complejos

### Alternativa por plataforma

| Estrategia | Android | iOS | Performance |
|---|---|---|---|
| Accessibility ID (`~id`) | ✅ ideal | ✅ ideal | ⚡ rápido |
| `android=...` (UiAutomator2) | ✅ | ❌ | 🟢 buena |
| `-ios predicate string:...` | ❌ | ✅ | 🟢 buena |
| `-ios class chain:...` | ❌ | ✅ | 🟢 buena |
| XPath | ⚠️ | ⚠️ lento | 🔴 frágil |

**Regla:** pedir al equipo de desarrollo que añada `accessibilityIdentifier` (iOS) y `contentDescription` (Android) a los elementos clave.

---

## 🚨 Problema #4: Contextos NATIVE_APP ↔ WEBVIEW (apps híbridas)

### Síntomas

- Selectores web no encuentran elementos cuando estás en NATIVE_APP
- Selectores nativos no encuentran elementos cuando estás en WEBVIEW
- Cambios de contexto pierden el estado de Serenity/JS

### Patrón recomendado

```typescript
// features/mobile/shared/Interactions/SwitchContext.ts
import { Interaction } from '@serenity-js/core';
import { browser } from '@wdio/globals';

export const SwitchToWebView = () =>
  Interaction.where(`#actor switches to WEBVIEW context`, async () => {
    const contexts = await (browser as any).getContexts();
    const webview = contexts.find((c: string) => c.includes('WEBVIEW'));
    if (!webview) throw new Error('No WEBVIEW context available');
    await (browser as any).switchContext(webview);
  });

export const SwitchToNative = () =>
  Interaction.where(`#actor switches to NATIVE_APP context`, async () => {
    await (browser as any).switchContext('NATIVE_APP');
  });
```

### Reglas para híbrido

- ✅ Validar contexto activo antes de cada acción crítica
- ✅ Encapsular cambios de contexto en Interactions
- ✅ Documentar en cada Task híbrida qué contexto requiere
- ❌ NUNCA mezclar selectores web y nativos sin cambio explícito de contexto

---

## 🚨 Problema #5: Timeouts insuficientes

### Síntomas

- `Function timed out, ensure the promise resolves within X milliseconds`
- Cucumber aborta steps en escenarios largos (formularios extensos, mobile lento)

### Configuración correcta del proyecto

| Lugar | Timeout | Comentario |
|---|---|---|
| `setDefaultTimeout` (web/mobile steps) | `200_000` | Cubre Appium + animaciones |
| `setDefaultTimeout` (api steps) | `120_000` | API más rápida |
| `cucumberOpts.timeout` | `60_000` | Por step individual |
| `Wait.upTo(...)` (web) | `Duration.ofSeconds(10–30)` | Por condición |
| `waitForDisplayed` (mobile) | `15_000 ms` | Por elemento |
| `waitforTimeout` (wdio) | `10_000` | Default WDIO |

**Regla:** subir timeouts solo cuando el problema sea real (red lenta, animaciones largas). NO usarlos para enmascarar flakiness.

---

## 🚨 Problema #6: `Target` o `resolveFor(actor)` (anti-patrones legacy)

### Síntomas

- Código copiado de tutoriales antiguos (Serenity/JS v2)
- Errores de tipos al usar `Target.the(...)`
- Componentes que no se reportan correctamente

### Causa

Son APIs **legacy de v2**. En v3 (`^3.31`) están deprecadas o removidas.

### Alternativa moderna

```typescript
// ❌ v2 legacy
const button = Target.the('login button').located(by.xpath('...'));

// ✅ v3 moderno
const button = () =>
  PageElement.located(By.xpath('...'))
             .describedAs('login button');
```

```typescript
// ❌ v2 anti-patrón
await someQuestion.resolveFor(actor);

// ✅ v3 — Question.answeredBy(actor) o Ensure.that
await actor.attemptsTo(
  Ensure.that(someQuestion, equals(expected)),
);
```

---

## 🚨 Problema #7: Hard waits (`browser.pause`, `setTimeout`)

### Síntomas

- Tests que pasan local pero fallan en CI
- Tiempos de ejecución innecesariamente largos
- Race conditions intermitentes

### Causa

`browser.pause(N)` espera N ms ciegamente sin verificar el estado real del DOM/UI.

### Alternativa correcta

```typescript
// ❌ MAL
await browser.pause(3000);

// ✅ BIEN (web)
await actor.attemptsTo(
  Wait.upTo(Duration.ofSeconds(10)).until(LoginUI.spinner(), not(isVisible())),
);

// ✅ BIEN (mobile, encapsulado en Interaction)
await el.waitForDisplayed({ timeout: 15_000 });
```

---

## 🚨 Problema #8: Reportes Allure/Serenity vacíos o incompletos

### Síntomas

- `target/site/serenity/index.html` no se genera
- Allure no muestra screenshots ni logs
- Reportes parciales tras crash del runner

### Causas comunes y fixes

| Causa | Fix |
|---|---|
| `serenity-bdd update` no ejecutado | `npm run serenity:update` |
| `crew` mal configurada | Verificar `wdio.shared.conf.ts` incluye `@serenity-js/serenity-bdd` y `ArtifactArchiver` |
| Reporter mezclado mal | NO mezclar `@wdio/allure-reporter` y serenity-bdd sin cuidado |
| Falta `outputDirectory` | `[ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ]` |

---

## Plantilla para documentar nuevos workarounds

Cuando aparezca un nuevo impedimento, documentarlo así (al inicio del archivo donde se aplica el patch):

```typescript
/**
 * ⚠️ WORKAROUND <NOMBRE_CORTO> (<plataforma afectada>)
 *
 * Contexto:
 *   <Qué hace Serenity/JS o WDIO que causa el problema>
 *
 * Problema:
 *   <Síntoma observable y por qué falla>
 *
 * Solución:
 *   <Qué hace este código y por qué resuelve>
 *
 * Alcance:
 *   - SOLO se aplica en <condición>
 *   - NO replicar en <Tasks/Steps/Interactions>
 *
 * Referencias:
 *   - <link a docs / issue / handbook>
 */
```

---

## Flujo de diagnóstico

Cuando un test falla:

1. **Leer el mensaje de error completo** (no solo la primera línea)
2. **Identificar el contexto** — ¿web, mobile native, mobile webview, API?
3. **Aislar la capa** — ¿es el selector, la Task, el Wait, la config?
4. **Reproducir mínimamente** — un solo escenario, un solo step
5. **Buscar en docs oficiales**:
   - Serenity/JS handbook: https://serenity-js.org/handbook/
   - Serenity/JS API: https://serenity-js.org/api/
   - WebdriverIO Mobile: https://webdriver.io/docs/api/mobile
6. **NO buscar** en blogs antiguos (pre v3) ni Stack Overflow sin verificar versión
7. **Aplicar workaround** en la capa correcta (config, helper, Interaction)
8. **Documentar** con la plantilla de arriba

---

## Errores prohibidos al "arreglar" problemas

- ❌ Replicar el workaround del config en cada Task
- ❌ Bypassear Screenplay con `browser.$` directo en steps
- ❌ Aumentar timeouts hasta esconder flakiness
- ❌ Comentar tests que fallan en lugar de diagnosticar
- ❌ Crear nuevas Interactions cuando ya existen las del proyecto
- ❌ Mezclar `@serenity-js/web` en mobile

---

## Checklist al cerrar un diagnóstico

- [ ] El error está reproducido y entendido
- [ ] La causa raíz está identificada (no solo el síntoma)
- [ ] El fix está en la capa arquitectónica correcta
- [ ] El workaround está documentado con la plantilla
- [ ] Se verificó que no rompe otros perfiles (web/mobile/api)
- [ ] Se citaron fuentes oficiales (no blogs)
- [ ] El test pasa de forma estable (3 ejecuciones consecutivas)
