#!/usr/bin/env node
/**
 * Script de pré-rendering pour SEO/GEO
 * Génère un fichier index.html avec le contenu complet (sans JavaScript)
 * Compatible Vite 6+ et React 19
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerender() {
  console.log('🚀 Démarrage du pré-rendering...');

  // URL du serveur de développement
  const devServerUrl = 'http://localhost:3090';
  const outputFile = path.resolve(__dirname, '../dist/index.html');

  try {
    // Simuler un navigateur avec JSDOM
    const dom = await JSDOM.fromURL(devServerUrl, {
      resources: "usable",
      runScripts: "dangerously"
    });

    // Attendre que la page soit chargée (Vite can be slow)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Récupérer le contenu du root
    const rootElement = dom.window.document.getElementById('root');
    const renderedRootContent = rootElement ? rootElement.innerHTML : "";

    // Charger le template de production (généré par Vite build)
    const productionTemplate = fs.readFileSync(outputFile, 'utf8');

    let finalHtml = productionTemplate;
    if (renderedRootContent && renderedRootContent.length > 100) {
      // Injecter le contenu rendu dans le template
      finalHtml = productionTemplate.replace('<div id="root"></div>', `<div id="root">${renderedRootContent}</div>`);
      console.log('✅ Contenu #root injecté avec succès.');
    } else {
      console.warn('⚠️  Attention : Le rendu du #root a échoué ou est incomplet. On garde le template vide.');
    }

    // Écrire dans le fichier de sortie
    fs.writeFileSync(outputFile, finalHtml, 'utf8');

    console.log('✅ Pré-rendering terminé !');
    console.log(`📄 Fichier mis à jour : ${outputFile}`);

    // Vérifier que le contenu est bien présent
    if (finalHtml.includes('Simulateur MaPrimeAdapt 2026')) {
      console.log('✅ Contenu vérifié : Le H1 est présent dans le HTML');
    } else {
      console.warn('⚠️  Attention : Le H1 n\'a pas été trouvé dans le HTML');
    }

    if (finalHtml.includes('Simulateur Cumul Aides 2026')) {
      console.log('✅ Contenu vérifié : Le titre du quiz est présent');
    }

    // Fermer JSDOM
    dom.window.close();

  } catch (error) {
    console.error('❌ Erreur lors du pré-rendering :', error);
    process.exit(1);
  }
}

// Exécuter le pré-rendering
prerender();
