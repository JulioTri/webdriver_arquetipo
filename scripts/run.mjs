import { spawnSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helpers para leer args
function getArg(name) {
  return process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
}

const modeArg = getArg('mode');
const platformArg = getArg('platform'); // android | ios

// IMPORTANTE: evita usar process.env.PLATFORM como "mode" cuando PLATFORM es android/ios
// Deja MODE como el env para elegir suite/mode. PLATFORM queda para capabilities si lo necesitas.
const mode = (process.env.MODE || modeArg || 'web').toLowerCase();
const platform = (platformArg || process.env.MOBILE_PLATFORM || '').toLowerCase();

let envFile = '.env';

if (mode === 'web') envFile = '.env.web';
if (mode === 'web_movil') envFile = '.env.web_movil';
if (mode === 'api') envFile = '.env.api';

if (mode === 'movil' && platform === 'android') {
  envFile = '.env.movil.android';
}

if (mode === 'movil' && platform === 'ios') {
  envFile = '.env.movil.ios';
}

// Cargar env si existe
const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`[ENV] cargado: ${envFile}`);
} else {
  console.log(`[ENV] usando valores por defecto (.env o process.env)`);
}

/**
 * Modos soportados:
 * - web
 * - web_movil
 * - movil (nativo, requiere platform android/ios si separas configs)
 * - desktop
 * - api
 * - all (ejecuta todos secuencialmente)
 */
const modeToConfig = {
  web: './configs/wdio.web.conf.ts',
  web_movil: './configs/wdio.web_mobile.conf.ts',

  // si antes era un solo config para móvil nativo, ahora lo dividimos:
  movil_android: './configs/wdio.android.conf.ts',
  movil_ios: './configs/wdio.ios.conf.ts',

  // aliases opcionales:
  android_app: './configs/wdio.android.app.conf.ts',
  ios_app: './configs/wdio.ios.app.conf.ts',

  desktop: './configs/wdio.desktop.conf.ts',
  api: './configs/wdio.api.conf.ts',
  services: './configs/wdio.api.conf.ts',
};

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runWdio(configPath) {
  run('npx', ['wdio', 'run', configPath]);
}

function runReport() {
  run('npx', ['serenity-bdd', 'run', '--features', './features']);
}

function resolveMobileConfig() {
  // Permite:
  // --mode=movil --platform=android
  // --mode=movil --platform=ios
  if (!platform) return null;

  if (platform === 'android') return modeToConfig.movil_android;
  if (platform === 'ios') return modeToConfig.movil_ios;

  return null;
}

// ======== ALL ========
if (mode === 'all') {
  const sequence = ['web', 'web_movil', 'movil', 'desktop', 'api'];

  for (const m of sequence) {
    let configPath = modeToConfig[m];

    if (m === 'movil') {
      // En modo all, si no especificas platform, corre Android por defecto (o cambia a iOS si prefieres)
      const mobileConfig = resolveMobileConfig() ?? modeToConfig.movil_android;
      configPath = mobileConfig;
    }

    if (!configPath) continue;

    console.log(`\n==============================`);
    console.log(` Ejecutando modo: ${m}${m === 'movil' ? ` (${platform || 'android'})` : ''}`);
    console.log(` Config: ${configPath}`);
    console.log(`==============================\n`);

    runWdio(configPath);
  }

  runReport();
  process.exit(0);
}

// ======== SINGLE MODE ========
let configPath = modeToConfig[mode];

// Resolver móvil nativo por platform
if (mode === 'movil' || mode === 'mobile') {
  const mobileConfig = resolveMobileConfig();
  if (!mobileConfig) {
    console.error(`Modo "movil" requiere --platform=android|ios (o MOBILE_PLATFORM=android|ios)`);
    console.error(`Ejemplos:`);
    console.error(`  npm run test:movil:android`);
    console.error(`  npm run test:movil:ios`);
    process.exit(2);
  }
  configPath = mobileConfig;
}

if (!configPath) {
  console.error(`Modo no soportado: ${mode}`);
  console.error(`Usa MODE=web|web_movil|movil|desktop|api o --mode=...`);
  process.exit(2);
}

runWdio(configPath);
runReport();
