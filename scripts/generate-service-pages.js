#!/usr/bin/env node
/**
 * generate-service-pages.js
 * Rend les pages "service / money page" nationales (top-level URL /<slug>/)
 * à partir de content/services/*.md via scripts/service-template.html.
 *
 * Format markdown attendu (métadonnées en gras, pas de front-matter) :
 *   # H1 de la page
 *   **Title** : Balise <title> complète (optionnel, sinon H1 + suffixe)
 *   **Description** : Meta description (~150-160 car.)
 *   **Breadcrumb** : Libellé court du fil d'ariane
 *   **Date** : 3 septembre 2026
 *   **DateISO** : 2026-09-03
 *
 *   ... corps markdown ...
 *
 *   ## FAQ
 *   ### Question 1 ?
 *   Réponse 1 (un ou plusieurs paragraphes).
 *   ### Question 2 ?
 *   Réponse 2.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../content/services');
const templatePath = path.resolve(__dirname, 'service-template.html');
const publicDir = path.resolve(__dirname, '../public');
const distDir = path.resolve(__dirname, '../dist');

marked.setOptions({ gfm: true, breaks: false });

// Liens "À lire aussi" par slug (cross-linking money pages + blog + simulateur)
const RELATED = {
    'douche-senior': [
        ['/douche-pmr/', 'Douche PMR : normes, prix et aides 2026'],
        ['/salle-de-bain-pmr/', 'Aménager une salle de bain PMR aux normes'],
        ['/blog/prix-douche-senior-apres-aides.html', 'Prix d’une douche senior : le vrai reste à charge'],
        ['/?quiz=aides-cumulables', 'Simulateur : estimer mes aides MaPrimeAdapt’'],
    ],
    'douche-pmr': [
        ['/salle-de-bain-pmr/', 'Salle de bain PMR : normes et dimensions'],
        ['/douche-senior/', 'Remplacer une baignoire par une douche senior'],
        ['/blog/normes-techniques-pmr-fauteuil-roulant.html', 'Normes techniques PMR pour fauteuil roulant'],
        ['/?quiz=configurateur-douche', 'Configurateur : ma douche PMR idéale'],
    ],
    'salle-de-bain-pmr': [
        ['/douche-pmr/', 'Douche PMR : prix et aides 2026'],
        ['/douche-senior/', 'Douche senior : prix du remplacement de baignoire'],
        ['/blog/cumul-aides-2026.html', 'Cumuler les aides en 2026'],
        ['/?quiz=aides-cumulables', 'Simulateur : mon reste à charge'],
    ],
};

function meta(content, key) {
    const m = content.match(new RegExp('\\*\\*' + key + '\\*\\*\\s*:\\s*(.+)'));
    return m ? m[1].trim() : '';
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildFaq(faqRaw) {
    // faqRaw : bloc texte après "## FAQ"
    const items = [];
    const parts = faqRaw.split(/^###\s+/m).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
        const nl = p.indexOf('\n');
        const q = (nl === -1 ? p : p.slice(0, nl)).trim();
        const a = (nl === -1 ? '' : p.slice(nl + 1)).trim();
        if (q && a) items.push({ q, a });
    }
    const html = items.map(({ q, a }) => `
        <details>
            <summary>${esc(q)}<i data-lucide="plus" class="w-5 h-5 text-blue-600 flex-shrink-0"></i></summary>
            ${marked.parse(a).replace(/<table>/g,'<div class="tbl-scroll"><table>').replace(/<\/table>/g,'</table></div>')}
        </details>`).join('');
    const jsonld = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a.replace(/\s+/g, ' ').trim() },
        })),
    }, null, 2);
    return { html, jsonld };
}

function buildRelated(slug) {
    const rows = RELATED[slug] || [];
    return rows.map(([href, label]) => `
        <a href="${href}" class="flex items-center justify-between gap-3 bg-stone-100 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 rounded-2xl px-5 py-4 no-underline text-stone-800 font-medium transition-colors">
            <span>${esc(label)}</span>
            <i data-lucide="arrow-right" class="w-4 h-4 text-blue-600 flex-shrink-0"></i>
        </a>`).join('');
}

function run() {
    if (!fs.existsSync(srcDir)) {
        console.error('⚠️  content/services/ absent — rien à générer.');
        return;
    }
    const template = fs.readFileSync(templatePath, 'utf8');
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const slug = file.replace('.md', '');
        const raw = fs.readFileSync(path.join(srcDir, file), 'utf8');

        const h1 = (raw.match(/^#\s+(.+)/m) || [, slug])[1].trim();
        const title = meta(raw, 'Title') || `${h1} | Simulateur MaPrimeAdapt`;
        const description = meta(raw, 'Description');
        const breadcrumb = meta(raw, 'Breadcrumb') || h1;
        const date = meta(raw, 'Date') || 'septembre 2026';
        const dateIso = meta(raw, 'DateISO') || new Date().toISOString().split('T')[0];

        // Corps = entre le H1 et "## FAQ" ; FAQ = après "## FAQ"
        let body = raw
            .replace(/^#\s+.+\r?\n/, '')
            .replace(/^\*\*(Title|Description|Breadcrumb|Date|DateISO)\*\*\s*:.*\r?\n/gm, '')
            .trim();
        let faqRaw = '';
        const faqSplit = body.split(/^##\s+FAQ\s*$/m);
        if (faqSplit.length > 1) {
            body = faqSplit[0].trim();
            faqRaw = faqSplit[1].trim();
        }

        const wrapTables = (html) => html.replace(/<table>/g, '<div class="tbl-scroll"><table>').replace(/<\/table>/g, '</table></div>');
        const contentHtml = wrapTables(marked.parse(body));
        const { html: faqHtml, jsonld: faqJsonld } = buildFaq(faqRaw);
        const relatedHtml = buildRelated(slug);

        const out = template
            .replace(/{{title}}/g, esc(title))
            .replace(/{{description}}/g, esc(description))
            .replace(/{{h1}}/g, esc(h1))
            .replace(/{{breadcrumb}}/g, esc(breadcrumb))
            .replace(/{{slug}}/g, slug)
            .replace(/{{date}}/g, esc(date))
            .replace(/{{date_iso}}/g, dateIso)
            .replace(/{{content}}/g, contentHtml)
            .replace(/{{faq_html}}/g, faqHtml)
            .replace(/{{faq_jsonld}}/g, faqJsonld)
            .replace(/{{related_html}}/g, relatedHtml);

        for (const base of [publicDir, distDir]) {
            if (base === distDir && !fs.existsSync(distDir)) continue;
            const dir = path.join(base, slug);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'index.html'), out);
        }
        console.log(`✅ Page service générée : /${slug}/`);
    }
}

run();
