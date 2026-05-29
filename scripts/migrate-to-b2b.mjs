/**
 * migrate-to-b2b.mjs
 *
 * Migra a b2b-automatizacion-webdriverio_v5 las mejoras introducidas en este
 * arquetipo, SIN alterar features, steps, Tasks, UI ni step-definitions.
 *
 * Lo que aplica (idempotente):
 *  1. Crea ./apps/{android,ios}/.gitkeep si faltan
 *  2. Copia scripts/download-apps.mjs si falta
 *  3. Endurece configs/wdio.ios.conf.ts (timeouts WDA, showXcodeLog, firma
 *     condicional, app resuelto, bundleId opcional) — solo si NO está
 *     endurecido todavía
 *  4. Inyecta 'wdio:enforceWebDriverClassic': true en configs/wdio.api.conf.ts
 *     si falta
 *  5. Añade líneas de apps/ al .gitignore si faltan
 *  6. Añade scripts apps:download* al package.json si faltan
 *  7. Añade bloques nuevos al AGENTS.md (tags, enforceWebDriverClassic,
 *     bundleId, sincronización) si no están presentes
 *
 * NO toca: features/, step-definitions/, Tasks, Interactions, Questions, UI,
 * supports/, .env.* del proyecto destino.
 *
 * Uso:
 *   node ./scripts/migrate-to-b2b.mjs --target=/ruta/al/b2b              # dry-run
 *   node ./scripts/migrate-to-b2b.mjs --target=/ruta/al/b2b --apply      # ejecuta
 *   node ./scripts/migrate-to-b2b.mjs --target=/ruta/al/b2b --apply --force-config-ios
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_ROOT = path.resolve(__dirname, '..');

function getArg(name) {
  return process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
}
const TARGET = path.resolve(getArg('target') ?? '');
const APPLY = process.argv.includes('--apply');
const FORCE_CONFIG_IOS = process.argv.includes('--force-config-ios');

if (!TARGET || !fs.existsSync(TARGET)) {
  console.error('✖  Pasa --target=/ruta/al/b2b-automatizacion-webdriverio_v5');
  process.exit(2);
}
if (!fs.existsSync(path.join(TARGET, 'package.json'))) {
  console.error(`✖  ${TARGET} no parece un proyecto Node (sin package.json)`);
  process.exit(2);
}
if (path.resolve(TARGET) === SRC_ROOT) {
  console.error('✖  --target apunta al propio arquetipo. Aborta.');
  process.exit(2);
}

const log = (...args) => console.log('   ', ...args);
const action = (sym, msg) => console.log(`${sym} ${msg}`);

// ------------------------------ helpers ------------------------------------
function read(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}
function write(p, content) {
  if (!APPLY) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
function copyIfMissing(src, dst, label) {
  if (fs.existsSync(dst)) {
    action('✔', `[skip] ${label} ya existe → ${path.relative(TARGET, dst)}`);
    return false;
  }
  if (!fs.existsSync(src)) {
    action('—', `[skip] ${label} no existe en arquetipo → ${path.relative(SRC_ROOT, src)}`);
    return false;
  }
  action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] copiar ${label} → ${path.relative(TARGET, dst)}`);
  if (APPLY) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
  return true;
}
function ensureLine(filePath, line, label) {
  const cur = read(filePath) ?? '';
  if (cur.includes(line)) {
    action('✔', `[skip] ${label} (ya existe línea)`);
    return false;
  }
  action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] ${label}`);
  if (APPLY) {
    const sep = cur && !cur.endsWith('\n') ? '\n' : '';
    write(filePath, cur + sep + line + '\n');
  }
  return true;
}
function appendBlockIfMissing(filePath, marker, block, label) {
  const cur = read(filePath) ?? '';
  if (cur.includes(marker)) {
    action('✔', `[skip] ${label} (marker ya presente)`);
    return false;
  }
  action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] ${label}`);
  if (APPLY) {
    const sep = cur && !cur.endsWith('\n') ? '\n' : '';
    write(filePath, cur + sep + '\n' + block);
  }
  return true;
}

// ------------------------- 1) apps/ scaffolding ----------------------------
function step1_appsScaffold() {
  console.log('\n[1] Carpeta apps/ con .gitkeep');
  const targets = [
    path.join(TARGET, 'apps', 'android', '.gitkeep'),
    path.join(TARGET, 'apps', 'ios', '.gitkeep'),
  ];
  for (const f of targets) {
    if (fs.existsSync(f)) {
      action('✔', `[skip] ${path.relative(TARGET, f)} ya existe`);
      continue;
    }
    action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] crear ${path.relative(TARGET, f)}`);
    if (APPLY) {
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, '');
    }
  }
  copyIfMissing(
    path.join(SRC_ROOT, 'apps', 'README.md'),
    path.join(TARGET, 'apps', 'README.md'),
    'apps/README.md',
  );
}

// ------------------------- 2) download-apps.mjs ----------------------------
function step2_downloadScript() {
  console.log('\n[2] scripts/download-apps.mjs');
  copyIfMissing(
    path.join(SRC_ROOT, 'scripts', 'download-apps.mjs'),
    path.join(TARGET, 'scripts', 'download-apps.mjs'),
    'download-apps.mjs',
  );
}

// ------------------------- 3) Hardening wdio.ios.conf.ts -------------------
function step3_iosHardening() {
  console.log('\n[3] Hardening configs/wdio.ios.conf.ts');
  const dst = path.join(TARGET, 'configs', 'wdio.ios.conf.ts');
  const cur = read(dst);
  if (cur === null) {
    action('—', '[skip] no existe wdio.ios.conf.ts en target');
    return;
  }

  const hasHardening =
    cur.includes('wdaLaunchTimeout') &&
    cur.includes('showXcodeLog') &&
    cur.includes('IOS_WDA_BUNDLE_ID');

  if (hasHardening && !FORCE_CONFIG_IOS) {
    action('✔', '[skip] iOS config ya endurecido (usa --force-config-ios para sobrescribir)');
    return;
  }

  // Tomamos el config actual del arquetipo como referencia y hacemos un patch
  // mínimo: insertamos las capabilities/timeouts que falten.
  // Estrategia conservadora: añadimos un bloque "extras" si detectamos el
  // patrón "capabilities: [{".
  const additions = [
    {
      key: 'wdaLaunchTimeout',
      block: `
  // ▼ Endurecimiento WDA (migrado desde arquetipo) ▼
  // La 1ra compilación de WebDriverAgent puede tardar 2–4 minutos.
  connectionRetryTimeout: 360_000,
  connectionRetryCount: 0,
  // ▲ Endurecimiento WDA ▲
`,
      anchor: /(\n\s*hostname:\s*process\.env\.APPIUM_HOST[^\n]*,\n)/,
    },
  ];

  let next = cur;
  let changed = false;
  for (const a of additions) {
    if (next.includes(a.key)) continue;
    if (a.anchor && a.anchor.test(next)) {
      next = next.replace(a.anchor, `$1${a.block}`);
      changed = true;
    }
  }

  // Inyectar capabilities adicionales si no están
  const capsPatch = [
    `'appium:wdaLaunchTimeout': 240_000,`,
    `'appium:wdaConnectionTimeout': 240_000,`,
    `'appium:wdaStartupRetries': 2,`,
    `'appium:wdaStartupRetryInterval': 10_000,`,
    `'appium:showXcodeLog': true,`,
  ];
  for (const line of capsPatch) {
    if (next.includes(line)) continue;
    next = next.replace(
      /('appium:noReset'\s*:\s*[^,\n]+,)/,
      `$1\n    ${line}`,
    );
    changed = true;
  }

  // Hacer condicionales updatedWDABundleId / xcodeOrgId / bundleId si están hardcoded
  if (next.includes(`'appium:updatedWDABundleId'`) && !next.includes('IOS_WDA_BUNDLE_ID\n')) {
    // ya existe envar-driven? si no, no tocar — es complejo y arriesgado.
    // En su lugar, dejamos un comentario al inicio de capabilities con el patrón sugerido.
  }

  if (!changed) {
    action('—', '[skip] no se encontró ancla segura para insertar el hardening (revisar manualmente)');
    return;
  }

  // Backup
  if (APPLY) {
    fs.copyFileSync(dst, dst + '.bak');
    fs.writeFileSync(dst, next);
  }
  action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] hardening WDA insertado (backup en .bak)`);
}

// ------------------------- 4) enforceWebDriverClassic en api ---------------
function step4_apiEnforceClassic() {
  console.log('\n[4] enforceWebDriverClassic en wdio.api.conf.ts');
  const dst = path.join(TARGET, 'configs', 'wdio.api.conf.ts');
  const cur = read(dst);
  if (cur === null) {
    action('—', '[skip] no existe wdio.api.conf.ts en target');
    return;
  }
  if (cur.includes('wdio:enforceWebDriverClassic')) {
    action('✔', '[skip] flag ya presente');
    return;
  }
  // Inserta la línea después de "browserName" en cada capability
  const next = cur.replace(
    /(browserName:\s*['"][^'"]+['"]\s*,)/g,
    `$1\n      'wdio:enforceWebDriverClassic': true,`,
  );
  if (next === cur) {
    action('—', '[skip] no se encontró browserName para inyectar el flag (revisar manualmente)');
    return;
  }
  action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] inyectar enforceWebDriverClassic`);
  if (APPLY) {
    fs.copyFileSync(dst, dst + '.bak');
    fs.writeFileSync(dst, next);
  }
}

// ------------------------- 5) .gitignore -----------------------------------
function step5_gitignore() {
  console.log('\n[5] .gitignore (ignorar binarios apps/)');
  const dst = path.join(TARGET, '.gitignore');
  const lines = [
    '# Apps mobile (binarios descargados, no versionar)',
    'apps/android/*.apk',
    'apps/ios/*.ipa',
    'apps/ios/*.app',
    'apps/ios/*.zip',
    '!apps/**/.gitkeep',
  ];
  for (const line of lines) {
    ensureLine(dst, line, `gitignore: ${line}`);
  }
}

// ------------------------- 6) package.json scripts -------------------------
function step6_packageScripts() {
  console.log('\n[6] package.json: scripts apps:download*');
  const dst = path.join(TARGET, 'package.json');
  const cur = read(dst);
  if (!cur) {
    action('—', '[skip] no existe package.json');
    return;
  }
  const pkg = JSON.parse(cur);
  pkg.scripts ??= {};

  const newScripts = {
    'apps:download': 'node ./scripts/download-apps.mjs',
    'apps:download:android': 'node ./scripts/download-apps.mjs --only=android',
    'apps:download:ios': 'node ./scripts/download-apps.mjs --only=ios',
  };

  let changed = false;
  for (const [k, v] of Object.entries(newScripts)) {
    if (pkg.scripts[k]) {
      action('✔', `[skip] script ${k} ya existe`);
      continue;
    }
    action(APPLY ? '✚' : '·', `[${APPLY ? 'apply' : 'dry'}] añadir script: ${k}`);
    pkg.scripts[k] = v;
    changed = true;
  }

  if (changed && APPLY) {
    fs.writeFileSync(dst, JSON.stringify(pkg, null, 2) + '\n');
  }
}

// ------------------------- 7) AGENTS.md blocks -----------------------------
function step7_agentsMd() {
  console.log('\n[7] AGENTS.md: bloques de reglas migrados');
  const dst = path.join(TARGET, 'AGENTS.md');
  if (!fs.existsSync(dst)) {
    action('—', '[skip] no existe AGENTS.md en target');
    return;
  }

  const blocks = [
    {
      marker: '🛡️ Regla obligatoria: `wdio:enforceWebDriverClassic`',
      label: 'enforceWebDriverClassic block',
      grep: /## 🌐 Reglas Web([\s\S]*?)(?=\n---\n|\n## )/,
      content: `
### 🛡️ Regla obligatoria: \`wdio:enforceWebDriverClassic\`

Toda capability de navegador en \`configs/wdio.<modo>.conf.ts\` que cree el agente
DEBE incluir \`'wdio:enforceWebDriverClassic': true\`. Esto fuerza a WebdriverIO
v9 a usar el protocolo WebDriver Classic en lugar de WebDriver BiDi (default
en v9), evitando incompatibilidades con \`@serenity-js/web\` v3.31.x y con
Chrome/Firefox cuando aún no soportan ciertos comandos BiDi.

#### Aplica a: configs Web y Web mobile, configs API que arranquen navegador.
#### NO aplica a: mobile nativo (Android/iOS) ni Appium Windows.

\`\`\`typescript
capabilities: [
  {
    browserName: 'chrome',
    'wdio:enforceWebDriverClassic': true,   // ← obligatorio
  },
],
\`\`\`
`,
    },
    {
      marker: '🏷️ Tags de Cucumber (OBLIGATORIO)',
      label: 'tags block',
      content: `

---

## 🏷️ Tags de Cucumber (OBLIGATORIO)

Todo \`.feature\` DEBE estar etiquetado con al menos un tag de canal y un tag
de propósito para permitir ejecución selectiva vía \`--tags=...\`.

### Convención de tags

| Categoría | Tags válidos | Dónde aplica |
|---|---|---|
| Canal / plataforma | \`@web\`, \`@mobile\`, \`@android\`, \`@ios\`, \`@api\`, \`@desktop\` | Feature |
| Suite | \`@smoke\`, \`@regression\` | Feature o Scenario |
| Tipo | \`@happy-path\`, \`@negative\`, \`@edge-case\` | Scenario |
| Estado | \`@wip\`, \`@skip\`, \`@flaky\` | Scenario (excluir con \`not\`) |

### Ejecución por tags

\`scripts/run.mjs\` acepta \`--tags=\` o \`TAGS=\` y los reenvía como
\`--cucumberOpts.tags=<expr>\`. Sintaxis: \`and\`, \`or\`, \`not\`, paréntesis.

\`\`\`bash
npm test -- --mode=web --tags=@smoke
npm test -- --mode=api --tags="@regression and not @wip"
\`\`\`
`,
    },
    {
      marker: '🧪 Verificación obligatoria del Bundle ID / Package en Mobile',
      label: 'bundleId verification block',
      content: `

---

## 🧪 Verificación obligatoria del Bundle ID / Package en Mobile

Antes de fijar \`IOS_APP_BUNDLE_ID\` o \`ANDROID_APP_PACKAGE\` en cualquier
\`.env.movil.*\`, leer el identificador **real** del binario. Es la causa #1
de errores de runtime tipo:

* iOS: \`FBSApplicationLibrary returned nil for "<bundle_id>"\`
* iOS: \`App with bundle identifier '<bundle_id>' unknown\`
* Android: \`Activity used to start app doesn't exist\`

### Comandos para verificar

\`\`\`bash
# iOS desde .app
/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" ./apps/ios/<App>.app/Info.plist

# iOS desde simulador booted
xcrun simctl listapps booted | grep -i CFBundleIdentifier

# Android desde .apk
aapt dump badging ./apps/android/<App>.apk | grep -E "package|launchable"
\`\`\`

### Reglas
1. NO inventar el bundle id basándose en el nombre del repo o binario.
2. Si se proporciona \`appium:app\`, el \`bundleId\`/\`appPackage\` se vuelve
   opcional: Appium lo deduce. **Preferir esta forma.**
3. Re-verificar al actualizar el binario.

### Tabla síntoma → causa → acción

| Mensaje | Causa | Acción |
|---|---|---|
| \`bundle identifier '...' unknown\` | Solo \`bundleId\`, sin \`app\`, y app no instalada | Pasar \`appium:app\` |
| \`FBSApplicationLibrary returned nil\` | bundleId declarado != real | Leer Info.plist y corregir \`.env\` |
| \`Activity '...' doesn't exist\` | \`appActivity\` desactualizado | \`aapt dump badging\` |
| timeout en \`POST /session\` (iOS) | WDA aún compila | Subir \`wdaLaunchTimeout\` |
| \`xcodebuild exit 65/75\` | WDA quiso firmar en simulador | NO enviar \`updatedWDABundleId\`/\`xcodeOrgId\` en Simulator |
`,
    },
  ];

  for (const b of blocks) {
    const cur = read(dst) ?? '';
    if (cur.includes(b.marker)) {
      action('✔', `[skip] ${b.label} ya presente`);
      continue;
    }
    appendBlockIfMissing(dst, b.marker, b.content, `añadir ${b.label}`);
  }
}

// ------------------------------ run ----------------------------------------
console.log(`\n=== Migración arquetipo → ${TARGET}`);
console.log(`Modo: ${APPLY ? 'APPLY (escribe cambios)' : 'DRY-RUN (solo previsualiza)'}\n`);

step1_appsScaffold();
step2_downloadScript();
step3_iosHardening();
step4_apiEnforceClassic();
step5_gitignore();
step6_packageScripts();
step7_agentsMd();

console.log('\n— Hecho —');
if (!APPLY) {
  console.log('Para aplicar realmente, vuelve a correr con --apply');
  console.log('Para forzar reescritura del config iOS aunque ya esté endurecido: añadir --force-config-ios');
}
