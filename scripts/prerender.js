#!/usr/bin/env node
/**
 * Script de pré-rendering pour SEO/GEO
 * Génère un fichier index.html avec le contenu complet (sans JavaScript)
 *
 * Remplace l'ancienne implémentation JSDOM (2026-08-15) : JSDOM n'exécute
 * jamais les <script type="module"> (limitation connue, non implémentée),
 * donc le bundle Vite (toujours en ESM) ne tournait jamais et #root restait
 * vide à chaque build, silencieusement. Playwright pilote un vrai Chrome
 * (réutilise le binaire système via channel:'chrome', pas de téléchargement)
 * et exécute réellement le JS de la page.
 *
 * Démarre lui-même le serveur de preview (`vite preview`) sur un port libre
 * — l'ancien script pointait sur localhost:3090 alors qu'aucun script npm
 * ne sert jamais sur ce port (dev=3089, preview=4173 par défaut), donc la
 * connexion échouait avant même d'atteindre le rendu.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const outputFile = path.join(distDir, 'index.html');

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    (function attempt() {
      fetch(url).then(() => resolve()).catch(() => {
        if (Date.now() > deadline) return reject(new Error(`Timed out waiting for ${url}`));
        setTimeout(attempt, 300);
      });
    })();
  });
}

async function prerender() {
  console.log('🚀 Démarrage du pré-rendering (Playwright)...');

  if (!fs.existsSync(outputFile)) {
    throw new Error(`${outputFile} introuvable — lancer "vite build" avant ce script (voir "npm run build:ssg").`);
  }

  const port = await findFreePort();
  const devServerUrl = `http://localhost:${port}`;
  console.log(`📡 Démarrage de "vite preview" sur ${devServerUrl} ...`);

  // Appelle le binaire vite directement (pas "npx vite") — npx spawnait un process
  // intermédiaire qui n'oubliait de propager SIGTERM à son enfant, laissant le vrai
  // process "vite preview" tourner indéfiniment après la fin du script (confirmé :
  // process orphelin encore vivant après "npm run build:ssg" en 2026-08-15).
  const viteBin = path.resolve(__dirname, '../node_modules/.bin/vite');
  const preview = spawn(viteBin, ['preview', '--port', String(port), '--strictPort'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
    detached: true, // process group séparé, pour pouvoir tuer tous ses enfants d'un coup
  });
  let previewLog = '';
  preview.stdout.on('data', d => { previewLog += d.toString(); });
  preview.stderr.on('data', d => { previewLog += d.toString(); });

  let browser;
  try {
    await waitForServer(devServerUrl);
    console.log('✅ Serveur de preview prêt.');

    // Réutilise le Chrome système déjà installé — évite un téléchargement Playwright.
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await page.goto(devServerUrl, { waitUntil: 'networkidle', timeout: 20000 });
    // Attend qu'un vrai contenu apparaisse dans #root (pas juste que le DOM existe).
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && root.innerHTML.trim().length > 100;
      },
      { timeout: 15000 }
    ).catch(() => { /* on vérifie la longueur réelle juste après, message d'erreur clair plus bas */ });

    const renderedRootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : '';
    });

    if (consoleErrors.length) {
      console.warn('⚠️  Erreurs JS pendant le rendu (n\'empêchent pas forcément le prerender) :');
      consoleErrors.slice(0, 10).forEach(e => console.warn('   -', e));
    }

    const productionTemplate = fs.readFileSync(outputFile, 'utf8');
    let finalHtml = productionTemplate;

    if (renderedRootContent && renderedRootContent.length > 100) {
      finalHtml = productionTemplate.replace('<div id="root"></div>', `<div id="root">${renderedRootContent}</div>`);
      console.log(`✅ Contenu #root injecté avec succès (${renderedRootContent.length} caractères).`);
    } else {
      console.warn(`⚠️  Attention : le rendu du #root a échoué ou est incomplet (${renderedRootContent.length} caractères). On garde le template vide.`);
      if (previewLog) console.warn('--- Log "vite preview" ---\n' + previewLog);
    }

    fs.writeFileSync(outputFile, finalHtml, 'utf8');
    console.log('✅ Pré-rendering terminé !');
    console.log(`📄 Fichier mis à jour : ${outputFile}`);

    if (finalHtml.includes("Simulation MaPrimeAdapt' 2026")) {
      console.log('✅ Contenu vérifié : le H1 est présent dans le HTML');
    } else {
      console.warn('⚠️  Attention : le H1 n\'a pas été trouvé dans le HTML');
    }
    if (finalHtml.includes('Simulateur Cumul Aides 2026')) {
      console.log('✅ Contenu vérifié : le titre du quiz est présent');
    }
    if (finalHtml.includes('href="/blog/"')) {
      console.log('✅ Contenu vérifié : le lien /blog/ est présent (fix orphan 2026-08-15)');
    }
  } finally {
    if (browser) await browser.close();
    try {
      process.kill(-preview.pid, 'SIGKILL'); // tue le groupe entier (vite + ses enfants)
    } catch { /* déjà mort */ }
  }
}

prerender()
  .then(() => process.exit(0)) // filet de sécurité : garantit la sortie même si un
  .catch(err => {              // handle (socket, timer Playwright) traîne encore ouvert
    console.error('❌ Erreur lors du pré-rendering :', err);
    process.exit(1);
  });
