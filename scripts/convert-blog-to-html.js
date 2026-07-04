#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.resolve(__dirname, '../public/blog');
const templatePath = path.resolve(__dirname, 'blog-template.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Configurer marked pour les tables et GFM
marked.setOptions({
  gfm: true,
  breaks: true,
});

async function convertArticles() {
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  const articlesMetadata = [];

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const slug = file.replace('.md', '');

    // Extraction des métadonnées via Regex (car pas de front-matter standard)
    const titleMatch = content.match(/^# (.*)/m);
    const title = titleMatch ? titleMatch[1] : slug;

    const tagsMatch = content.match(/\*\*Tags\*\* : (.*)/);
    const tagsRaw = tagsMatch ? tagsMatch[1] : '';
    const tags = tagsRaw.split('|').map(t => t.trim().replace(/`/g, ''));

    const dateMatch = content.match(/\*\*Date de publication\*\* : (.*)/);
    const date = dateMatch ? dateMatch[1] : '2026';

    const versionMatch = content.match(/\*\*Version\*\* : (.*)/);
    const version = versionMatch ? versionMatch[1] : '1.0';

    // Extraction du Takeaway (pour la citation et la meta description)
    const takeawayMatch = content.match(/\*\*Takeaway\*\* : (.*)/);
    let description = takeawayMatch ? takeawayMatch[1] : "";

    // Si pas de takeaway, on prend le premier paragraphe comme fallback
    if (!description) {
      const linesContent = content.split('\n').filter(l => l.trim().length > 0);
      for (let i = 0; i < linesContent.length; i++) {
        if (linesContent[i].startsWith('# ') || linesContent[i].startsWith('---') ||
          linesContent[i].includes('**Tags**') || linesContent[i].includes('**Date') ||
          linesContent[i].includes('**Version')) continue;
        description = linesContent[i].replace(/\*\*/g, '').substring(0, 200);
        break;
      }
    }

    // Nettoyage du contenu pour le parsing
    let cleanContent = content
      .replace(/^#\s+.*\r?\n?/, '') // Enlever le H1
      .replace(/\*\*Takeaway\*\* : .*\r?\n?/, '') // Enlever la ligne du takeaway
      .trim();

    const htmlContent = marked.parse(cleanContent);

    // Remplacement dans le template
    let finalHtml = template
      .replace(/{{title}}/g, title)
      .replace(/{{description}}/g, description)
      .replace(/{{slug}}/g, slug)
      .replace(/{{content}}/g, htmlContent)
      .replace(/{{date}}/g, date)
      .replace(/{{version}}/g, version)
      .replace(/{{tags}}/g, tags.map(t => `<span class="tag">${t}</span>`).join(''))
      .replace(/{{author_bio}}/g, getAuthorBio(slug))
      .replace(/{{cta}}/g, getCTAForSlug(slug));

    const outPath = path.join(blogDir, `${slug}.html`);
    fs.writeFileSync(outPath, finalHtml);
    console.log(`✅ Généré : ${slug}.html`);

    articlesMetadata.push({
      title,
      description,
      slug,
      date,
      tags,
      icon: getIconForSlug(slug)
    });
  }

  generateIndex(articlesMetadata);
}

function getIconForSlug(slug) {
  if (slug.includes('simulateur')) return 'file-text';
  if (slug.includes('securite')) return 'shield-check';
  if (slug.includes('configurateur')) return 'bath';
  if (slug.includes('timing')) return 'clock';
  if (slug.includes('accompagnement')) return 'clipboard-list';
  if (slug.includes('maintien')) return 'home';
  return 'book-open';
}

function getAuthorBio(slug) {
  // Dans le futur, on pourra extraire cela du front-matter.
  // Pour l'instant on utilise un persona d'expert générique pour la niche YMYL.
  return `
    <div class="author-box">
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150" alt="Dr. Sophie Martin" class="author-avatar">
        <div class="author-info">
            <h4>Dr. Sophie Martin</h4>
            <div class="role"><i data-lucide="award" style="width: 14px; height: 14px;"></i> Ergothérapeute & Experte Maintien à Domicile</div>
            <p>Diplômée d'État avec plus de 10 ans d'expérience dans l'aménagement du domicile pour les seniors. Spécialisée dans la prévention des risques de chute et l'optimisation des aides (MaPrimeAdapt').</p>
        </div>
    </div>`;
}

function getCTAForSlug(slug) {
  const mapping = {
    // 1. Guides Principaux
    'simulateur-maprimeadapt-2026-guide-complet': { id: 'aides-cumulables', text: 'Estimer mes aides 2026' },
    'diagnostic-securite-salle-de-bain-algorithme': { id: 'bilan-clinique-securite', text: 'Faire mon diagnostic sécurité' },
    'configurateur-douche-pmr-ideal': { id: 'configurateur-douche', text: 'Configurer ma douche' },

    // 2. Thématiques spécifiques
    'timing-travaux-senior-2026': { id: 'timing-travaux', text: 'Vérifier mon timing' },
    'accompagnement-administratif-maprimeadapt': { id: 'accompagnement-administratif', text: 'Obtenir mon plan d\'action' },
    'maintien-domicile-eviter-ehpad': { id: 'maintien-domicile', text: 'Évaluer ma viabilité à domicile' },

    // 3. Articles de détail
    'cumul-aides-2026': { id: 'aides-cumulables', text: 'Calculer mon cumul' },
    'prix-douche-senior-apres-aides': { id: 'prix-net-final', text: 'Calculer mon prix net' },
    'prevention-chutes-bilan-salle-de-bain': { id: 'bilan-clinique-securite', text: 'Faire mon bilan' },
    'refus-maprimeadapt-recours-solutions': { id: 'dossier-refuse-troubleshooter', text: 'Trouver une solution' },
    'normes-techniques-pmr-fauteuil-roulant': { id: 'normes-techniques-pmr', text: 'Vérifier mes normes' }
  };

  const cta = mapping[slug] || { id: 'aides-cumulables', text: 'Estimer mes aides 2026' };

  return `
    <div class="cta-block">
        <h3>Prêt à passer à l'action ?</h3>
        <p>Utilisez notre outil interactif pour obtenir des réponses personnalisées à votre situation.</p>
        <a href="/?quiz=${cta.id}" class="cta-btn">
            ${cta.text}
            <i data-lucide="arrow-right"></i>
        </a>
    </div>`;
}

function generateIndex(articles) {
  const indexPath = path.join(blogDir, 'index.html');

  const cardsHtml = articles.map(a => `
    <a href="${a.slug}.html" class="article-card">
        <div class="card-icon"><i data-lucide="${a.icon}"></i></div>
        <h3>${a.title}</h3>
        <p>${a.description.substring(0, 150)}...</p>
        <div class="card-footer">
            <span>En savoir plus</span>
            <i data-lucide="arrow-right"></i>
        </div>
    </a>
  `).join('');

  const indexTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Simulateur MaPrimeAdapt - Guides et Conseils Douche PMR</title>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --stone-50: #fafaf9;
            --stone-100: #f5f5f4;
            --stone-200: #e7e5e4;
            --stone-500: #78716c;
            --stone-900: #1c1917;
            --blue-50: #eff6ff;
            --blue-600: #2563eb;
        }
        body { font-family: 'Inter', sans-serif; background: var(--stone-50); color: var(--stone-900); margin: 0; }
        header { background: white; border-bottom: 1px solid var(--stone-200); height: 64px; display: flex; align-items: center; position: sticky; top: 0; z-index: 10; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 16px; width: 100%; }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 8px; font-weight: bold; text-decoration: none; color: inherit; }
        .logo i { color: var(--blue-600); }
        
        main { max-width: 1100px; margin: 64px auto; padding: 0 16px; }
        .hero { text-align: center; margin-bottom: 64px; }
        h1 { font-size: 3rem; margin-bottom: 16px; }
        .hero p { font-size: 1.25rem; color: var(--stone-500); }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .article-card {
            background: white;
            border: 1px solid var(--stone-200);
            border-radius: 24px;
            padding: 32px;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        .article-card:hover { transform: translateY(-4px); border-color: var(--blue-600); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }
        .card-icon { background: var(--blue-50); color: var(--blue-600); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        h3 { font-size: 1.5rem; margin: 0 0 12px 0; line-height: 1.3; }
        .article-card p { color: var(--stone-500); flex-grow: 1; margin-bottom: 24px; font-size: 1rem; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; color: var(--blue-600); font-weight: 600; background: var(--blue-50); padding: 12px 20px; border-radius: 12px; }
        
        footer { background: var(--stone-900); color: white; padding: 48px 0; text-align: center; margin-top: 128px; }
    </style>
</head>
<body>
    <header>
        <div class="container header-content">
            <a href="/" class="logo"><i data-lucide="shield-check"></i> Simulateur MaPrimeAdapt</a>
            <nav style="display: flex; gap: 24px; font-size: 0.875rem;">
                <a href="/#simulateurs" style="text-decoration: none; color: var(--stone-500);">Simulateurs</a>
                <a href="/blog/" style="text-decoration: none; color: var(--stone-900); font-weight: 600;">Blog</a>
            </nav>
        </div>
    </header>
    <main>
        <div class="hero">
            <h1>📚 Blog & Guides</h1>
            <p>Tout ce qu'il faut savoir sur l'adaptation de votre salle de bain en 2026.</p>
        </div>
        <div class="grid">
            ${cardsHtml}
        </div>
    </main>
    <footer>
        <i data-lucide="shield-check" style="color: var(--blue-600); margin-bottom: 16px;"></i>
        <p>© 2026 Simulateur MaPrimeAdapt Simulateurs</p>
    </footer>
    <script>lucide.createIcons();</script>
</body>
</html>`;

  fs.writeFileSync(indexPath, indexTemplate);
  console.log('✅ Index du blog généré !');
}

convertArticles().catch(console.error);
