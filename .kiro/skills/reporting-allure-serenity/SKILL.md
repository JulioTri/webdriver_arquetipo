---
name: reporting-allure-serenity
description: Configurar e interpretar los reportes del proyecto: Serenity BDD (target/site/serenity/index.html), Allure (allure-results/), Cucumber JSON (reports/cucumber-report.json), wdio-video-reporter, y el crew de Serenity con ArtifactArchiver y Photographer. Cubre cómo añadir artefactos custom, leer fallos en los reportes, configurar screenshots por interacciones vs por fallas, y troubleshoot reportes vacíos. Usar cuando se configure reporting, se diagnostique un fallo desde el reporte, o se necesite añadir artefactos custom.
---

# Skill: Reportes y artefactos del proyecto

## Reportes generados

| Reporte | Ubicación | Generador | Cuándo |
|---|---|---|---|
| **Serenity BDD HTML** | `target/site/serenity/index.html` | `npx serenity-bdd run --features ./features` | Tras cada ejecución |
| **Serenity raw JSON** | `target/site/serenity/*.json` | `@serenity-js/core:ArtifactArchiver` | Durante la ejecución |
| **Allure raw** | `allure-results/` | `@wdio/allure-reporter` | Durante la ejecución (web) |
| **Cucumber JSON** | `reports/cucumber-report.json` | `cucumberOpts.format` | Durante la ejecución |
| **Video** | `allure-results/<test>.webm` | `wdio-video-reporter` | Cuando un test falla (web) |
| **Logs Appium** | `logs/appium/` | `@wdio/appium-service` | Mobile |

---

## Configuración del crew de Serenity

El `crew` se define en `wdio.shared.conf.ts` y se extiende en cada perfil. Define qué Reporters de Serenity se activan.

### Base (compartido)

```typescript
// configs/wdio.shared.conf.ts
serenity: {
  runner: 'cucumber',
  crew: [
    '@serenity-js/console-reporter',
    '@serenity-js/serenity-bdd',
    [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
  ],
},
```

| Componente | Función |
|---|---|
| `@serenity-js/console-reporter` | Imprime resultado en stdout |
| `@serenity-js/serenity-bdd` | Genera el JSON consumido por `serenity-bdd run` |
| `ArtifactArchiver` | Persiste screenshots, JSON y otros artefactos en `target/site/serenity` |

### Extensión web (Photographer)

```typescript
// configs/wdio.web.conf.ts
serenity: {
  crew: [
    ...(shared.serenity?.crew ?? []),
    [
      '@serenity-js/web:Photographer',
      {
        strategy: 'TakePhotosOfFailures',
        // strategy: 'TakePhotosOfInteractions',  // más completo, más lento
      },
    ],
  ],
},
```

**Estrategias del Photographer:**

| Strategy | Cuándo toma screenshots | Costo |
|---|---|---|
| `TakePhotosOfFailures` | Solo cuando una interaction falla | Bajo (default recomendado) |
| `TakePhotosOfInteractions` | Antes y después de cada interaction | Alto |
| `TakePhotosOfFailures` (default) | Solo fallas | — |

⚠️ **Photographer NO se debe activar en mobile** — depende de window handles que rompen en NATIVE_APP. Por eso el proyecto solo lo añade en `wdio.web.conf.ts`, no en shared.

---

## Reporters WDIO (independientes del crew Serenity)

```typescript
// configs/wdio.web.conf.ts
reporters: [
  'spec',                                          // resumen consola
  ['allure', { outputDir: 'allure-results' }],     // Allure
  'json',                                          // JSON wdio
  ['video', {
    saveAllVideos: true,
    videoSlowdownMultiplier: 1,
    videoRenderTimeout: 30,
    outputDir: 'allure-results',                   // se integra con Allure
    addConsoleLogs: true,
  }],
],
```

---

## Generar el reporte HTML de Serenity BDD

### Comando

```bash
npx serenity-bdd run --features ./features
# o
npm run serenity:report
```

Esto consume los JSON en `target/site/serenity/` y produce `target/site/serenity/index.html`.

### Comandos auxiliares

```bash
npm run serenity:update    # baja el JAR de Serenity BDD si falta
npm run serenity:clean     # limpia ./target completo
```

### Flujo automatizado en `scripts/run.mjs`

El orquestador llama `serenity-bdd run` automáticamente tras cada `wdio run`, así que un `npm test:web` ya genera el reporte sin pasos extra.

---

## Generar el reporte HTML de Allure

```bash
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

O en un solo paso:

```bash
npx allure serve allure-results
```

---

## Cómo leer un fallo en cada reporte

### Serenity BDD HTML

`target/site/serenity/index.html` → abre en navegador.

1. **Overview** — % de tests pasando/fallando
2. **Test Results** — lista de escenarios. Click en uno fallido
3. **Detalle del escenario** — pasos con `#actor ...` (las descripciones de Tasks)
4. **Stack trace + screenshot** — al expandir el step que falló
5. **Tags** — filtra por `@form`, `@smoke`, etc.

**Tip:** Los nombres de Tasks aparecen tal cual los definiste en `Task.where('#actor ...')`. Si el reporte muestra descripciones poco claras, mejora las descripciones de tus Tasks.

### Allure

1. **Overview** — gráficas globales
2. **Behaviors** → Features → Scenarios
3. **Failed scenarios** — click expande con video adjunto (si existe)
4. **Categories** — agrupa fallos por tipo (timeout, assertion, etc.)

### Cucumber JSON

`reports/cucumber-report.json` — para procesamiento programático (CI dashboards, scripts custom).

```typescript
import * as fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('reports/cucumber-report.json', 'utf-8'));
const failed = report
  .flatMap((feat: any) => feat.elements)
  .filter((scn: any) => scn.steps.some((s: any) => s.result.status === 'failed'));
```

---

## Adjuntar artefactos custom desde Tasks

### Adjuntar texto (log estructurado)

```typescript
import { Interaction } from '@serenity-js/core';
import { Notepad, notes } from '@serenity-js/core';   // si usas Notepad
import { Log } from '@serenity-js/core';

await actor.attemptsTo(
  Log.the('order id capturado:', orderId),
);
```

`Log.the(...)` aparece como entrada en el reporte de Serenity.

### Adjuntar screenshot manual (web)

```typescript
import { Photographer, TakePhotosOfInteractions } from '@serenity-js/web';

// Forzar screenshot puntual:
await actor.attemptsTo(
  Photographer.takeAPhoto().of('estado-tras-checkout'),
);
```

### Adjuntar archivo JSON al reporte

```typescript
import { Artifact, JSONData } from '@serenity-js/core';

// Dentro de un step o Task:
serenity.announce(
  new Artifact(
    JSONData.fromJSON(orderData),
    'pedido capturado',
  ),
);
```

---

## Tags de Cucumber para filtrar reportes

### En el `.feature`

```gherkin
@smoke @form
Scenario: Registro exitoso
  ...
```

### Ejecutar solo escenarios con tag

```bash
# vía cucumberOpts.tags en config
cucumberOpts: {
  tags: ['@smoke'],
}

# o por línea de comandos
npx wdio run configs/wdio.web.conf.ts --cucumberOpts.tags="@smoke"
```

### Filtrar reporte por tag

Serenity BDD agrupa automáticamente por tags en el dashboard. Útil para:
- `@smoke` — suite rápida pre-deploy
- `@regression` — suite completa
- `@flaky` — tests bajo observación
- `@module-x` — agrupar por módulo de negocio

---

## Configuración del video reporter

```typescript
['video', {
  saveAllVideos: true,           // false = solo en falla (recomendado en CI)
  videoSlowdownMultiplier: 1,    // 1 = velocidad real, 3 = 3x más lento
  videoRenderTimeout: 30,        // segundos máx para renderizar (subir si videos largos)
  outputDir: 'allure-results',   // se integra con Allure si apunta ahí
  addConsoleLogs: true,          // console.log del navegador en el video
}],
```

⚠️ Video reporter usa **ffmpeg** internamente. Verificar que está instalado: `ffmpeg -version`.

---

## Troubleshooting de reportes

### Síntoma: `target/site/serenity/index.html` no se genera

| Causa | Fix |
|---|---|
| `serenity-bdd run` no ejecutado | `npm run serenity:report` |
| Falta el JAR | `npm run serenity:update` |
| `ArtifactArchiver` no en crew | Verificar `wdio.shared.conf.ts` |
| `outputDirectory` mal configurado | Debe ser `target/site/serenity` |

### Síntoma: reporte sin screenshots

| Causa | Fix |
|---|---|
| `Photographer` no añadido en config web | Agregar al crew de `wdio.web.conf.ts` |
| Estrategia muy restrictiva | Cambiar a `TakePhotosOfInteractions` temporalmente |
| `Photographer` activado en mobile | Removerlo del crew mobile (rompe sesión) |

### Síntoma: Allure vacío

| Causa | Fix |
|---|---|
| `@wdio/allure-reporter` no en `reporters` | Agregarlo al config |
| `outputDir` mal configurado | Debe coincidir con el comando `allure generate <dir>` |
| `allure-results/` no se limpió | `rm -rf allure-results` antes de correr |

### Síntoma: video no se genera

| Causa | Fix |
|---|---|
| ffmpeg no instalado | `brew install ffmpeg` (macOS) |
| `videoRenderTimeout` muy bajo | Subir a `60` o más para tests largos |
| Mobile session sin video | Video reporter es solo web, en mobile usar Appium video plugin |

### Síntoma: nombres de Tasks crípticos en el reporte

```typescript
// ❌ Reporte muestra: "Task.where(args...)"
Task.where('login', ...);

// ✅ Reporte muestra: "Pepito inicia sesión con usuario test_user"
Task.where(`#actor inicia sesión con usuario ${ user }`, ...);
```

`#actor` es reemplazado por el nombre real del actor en runtime.

---

## Estructura del directorio target/

```
target/site/serenity/
├── index.html                         # entrada del reporte
├── home.html
├── reports/
│   ├── 4e7a... .json                  # JSON crudo por escenario
│   └── ...
├── *.png                              # screenshots de Photographer
└── style/, js/, images/               # assets del template
```

⚠️ NO commitear `target/`. Añadirlo al `.gitignore`.

---

## Anti-patrones

- ❌ Activar `Photographer` en config mobile (rompe sesión)
- ❌ `TakePhotosOfInteractions` en CI (lentitud + storage)
- ❌ Múltiples reporters Allure y Serenity sin distinguir cuál es la fuente de verdad
- ❌ `Log.the(...)` con datos sensibles (credenciales)
- ❌ Commitear `target/`, `allure-results/`, `reports/`
- ❌ Olvidar `npm run serenity:update` al clonar el repo (no genera reporte HTML)
- ❌ `cucumberOpts.format` mezclado con paths inválidos

---

## Checklist al diagnosticar un fallo desde el reporte

1. [ ] Abrí `target/site/serenity/index.html` en navegador
2. [ ] Identifiqué el escenario fallido
3. [ ] Expandí el step que falló y leí el stack trace completo
4. [ ] Vi el screenshot adjunto (web) o video (Allure)
5. [ ] Verifiqué los logs Appium si es mobile (`logs/appium/`)
6. [ ] Confirmé el `.env.*` cargado en la ejecución (línea `[ENV] cargado: ...`)
7. [ ] Reproduje localmente con el mismo `--mode` y `--platform`
8. [ ] Si es flaky, lo etiqueté con `@flaky` y abrí ticket de investigación
