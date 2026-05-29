/**
 * download-apps.mjs
 *
 * Descarga las apps demo oficiales de Sauce Labs desde GitHub Releases:
 *  - Android APK: saucelabs/my-demo-app-android   → ./apps/android/SauceLabs-Demo-App.apk
 *  - iOS .ipa  : saucelabs/my-demo-app-ios       → ./apps/ios/SauceLabs-Demo-App.ipa
 *  - iOS .app  : saucelabs/my-demo-app-ios       → ./apps/ios/SauceLabs-Demo-App.app (extraído del .zip)
 *
 * Uso:
 *   node ./scripts/download-apps.mjs                # descarga todo
 *   node ./scripts/download-apps.mjs --only=android
 *   node ./scripts/download-apps.mjs --only=ios
 *   node ./scripts/download-apps.mjs --force        # re-descarga aunque exista
 *
 * Nota: para device físico iOS, el .ipa de Sauce Labs requiere re-firma con
 * un Apple Developer Account propio. Para Simulator basta el .app.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function getArg(name) {
  return process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
}
const onlyArg = (getArg('only') || '').toLowerCase(); // android | ios | ''
const force = process.argv.includes('--force');

const targets = {
  android: {
    repo: 'saucelabs/my-demo-app-android',
    // El asset principal es el APK no-test (excluye 'androidTest')
    pickAsset: (assets) =>
      assets.find(a => a.name.endsWith('.apk') && !a.name.includes('androidTest')),
    outFile: path.join(ROOT, 'apps', 'android', 'SauceLabs-Demo-App.apk'),
  },
  ios_ipa: {
    repo: 'saucelabs/my-demo-app-ios',
    pickAsset: (assets) =>
      assets.find(a => a.name === 'SauceLabs-Demo-App.ipa') ||
      assets.find(a => a.name.endsWith('.ipa') && !a.name.includes('XCUITest') && !a.name.includes('TestFairy')),
    outFile: path.join(ROOT, 'apps', 'ios', 'SauceLabs-Demo-App.ipa'),
  },
  ios_simulator: {
    repo: 'saucelabs/my-demo-app-ios',
    pickAsset: (assets) =>
      assets.find(a => a.name === 'SauceLabs-Demo-App.Simulator.zip'),
    outFile: path.join(ROOT, 'apps', 'ios', 'SauceLabs-Demo-App.Simulator.zip'),
    postProcess: 'unzip-app',
  },
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function httpJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'arquetipo-downloader',
        'Accept': 'application/vnd.github+json',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpJson(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`GET ${url} → ${res.statusCode}`));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function download(url, outFile) {
  return new Promise((resolve, reject) => {
    ensureDir(outFile);
    const file = fs.createWriteStream(outFile);
    const doGet = (u) => {
      https.get(u, {
        headers: { 'User-Agent': 'arquetipo-downloader' },
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`GET ${u} → ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', (err) => {
        fs.unlink(outFile, () => reject(err));
      });
    };
    doGet(url);
  });
}

async function fetchLatestAsset({ repo, pickAsset }) {
  const release = await httpJson(`https://api.github.com/repos/${repo}/releases/latest`);
  const asset = pickAsset(release.assets || []);
  if (!asset) {
    throw new Error(`No se encontró asset válido en el último release de ${repo} (${release.tag_name})`);
  }
  return { tag: release.tag_name, asset };
}

async function processTarget(key, target) {
  const exists = fs.existsSync(target.outFile);
  if (exists && !force) {
    console.log(`✔  [${key}] ya existe: ${path.relative(ROOT, target.outFile)} (usar --force para re-descargar)`);
    return;
  }
  console.log(`→  [${key}] consultando último release de ${target.repo}...`);
  const { tag, asset } = await fetchLatestAsset(target);
  console.log(`→  [${key}] release ${tag} · asset ${asset.name} (${(asset.size / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`→  [${key}] descargando a ${path.relative(ROOT, target.outFile)}...`);
  await download(asset.browser_download_url, target.outFile);
  console.log(`✔  [${key}] descargado.`);

  if (target.postProcess === 'unzip-app') {
    const outDir = path.dirname(target.outFile);
    console.log(`→  [${key}] descomprimiendo .app en ${path.relative(ROOT, outDir)}...`);
    // El zip trae estructura: Payload/<Name>.app/
    const tmpDir = path.join(outDir, '.tmp-unzip');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });

    const res = spawnSync('unzip', ['-oq', target.outFile, '-d', tmpDir], { stdio: 'inherit' });
    if (res.status !== 0) {
      console.error(`✖  [${key}] unzip falló. Asegúrate de tener 'unzip' instalado.`);
      process.exit(res.status ?? 1);
    }

    const payloadDir = path.join(tmpDir, 'Payload');
    if (!fs.existsSync(payloadDir)) {
      console.error(`✖  [${key}] estructura inesperada: no se encontró Payload/`);
      process.exit(1);
    }
    const appName = fs.readdirSync(payloadDir).find(n => n.endsWith('.app'));
    if (!appName) {
      console.error(`✖  [${key}] no se encontró ningún .app dentro de Payload/`);
      process.exit(1);
    }

    const finalAppPath = path.join(outDir, 'SauceLabs-Demo-App.app');
    fs.rmSync(finalAppPath, { recursive: true, force: true });
    fs.renameSync(path.join(payloadDir, appName), finalAppPath);
    fs.rmSync(tmpDir, { recursive: true, force: true });

    console.log(`✔  [${key}] .app listo en ${path.relative(ROOT, finalAppPath)}`);
  }
}

async function main() {
  const queue = [];
  if (!onlyArg || onlyArg === 'android') queue.push(['android', targets.android]);
  if (!onlyArg || onlyArg === 'ios') {
    queue.push(['ios_ipa', targets.ios_ipa]);
    queue.push(['ios_simulator', targets.ios_simulator]);
  }
  if (queue.length === 0) {
    console.error(`--only debe ser 'android' o 'ios' (recibido: "${onlyArg}")`);
    process.exit(2);
  }
  for (const [key, target] of queue) {
    try {
      await processTarget(key, target);
    } catch (e) {
      console.error(`✖  [${key}] ${e.message}`);
      process.exitCode = 1;
    }
  }
}

main();
