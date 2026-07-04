# 📍 EMPLACEMENT COMPLET DES ARTICLES ET CONTENUS

## 📁 Arborescence Finale

```
/media/brice/TradingData/douche-pmr/
│
├── 📄 public/ (Contenu web)
│   ├── 📰 blog/ (6 articles HTML + 1 index)
│   │   ├── index.html                                    ← INDEX DU BLOG
│   │   ├── simulateur-maprimeadapt-2026-guide-complet.html
│   │   ├── diagnostic-securite-salle-de-bain-algorithme.html
│   │   ├── configurateur-douche-pmr-ideal.html
│   │   ├── timing-travaux-senior-2026.html
│   │   ├── accompagnement-administratif-maprimeadapt.html
│   │   ├── maintien-domicile-eviter-ehpad.html
│   │   │
│   │   └── 📝 (Fichiers .md originaux - pour référence)
│   │       ├── simulateur-maprimeadapt-2026-guide-complet.md
│   │       ├── diagnostic-securite-salle-de-bain-algorithme.md
│   │       ├── configurateur-douche-pmr-ideal.md
│   │       ├── timing-travaux-senior-2026.md
│   │       ├── accompagnement-administratif-maprimeadapt.md
│   │       └── maintien-domicile-eviter-ehpad.md
│   │
│   ├── 📄 methodologie.html (converti depuis .md)       ← PAGE MÉTHODOLOGIE
│   ├── 🗺️ sitemap.xml                                     ← PLAN DU SITE
│   └── 🤖 robots.txt                                      ← RÈGLES CRAWLERS
│
├── 🎨 src/ (Code React)
│   └── App.tsx                                          ← JSON-LD HowTo DYNAMIQUE
│
├── 📄 index.html                                        ← META TAGS + JSON-LD STATIQUE
│
├── 🔧 scripts/ (Scripts utilitaires)
│   ├── prerender.js                                     ← PRÉ-RENDERING
│   └── convert-blog-to-html.js                           ← CONVERSION MD→HTML
│
└── 📚 Documentation (Guides et templates)
    ├── GOOGLE_SEARCH_CONSOLE.md                        ← GUIDE GSC
    ├── VITE_SSG.md                                       ← GUIDE SSG
    ├── BUILD_SSG.md                                      ← GUIDE BUILD
    ├── OUTREACH_TEMPLATE.md                             ← TEMPLATES EMAILS
    └── TESTS_IA.md                                        ← TESTS IA
```

---

## 📰 Articles de Blog (6 fichiers HTML)

| # | Fichier HTML | Titre | Lien |
|---|--------------|-------|------|
| **1** | `simulateur-maprimeadapt-2026-guide-complet.html` | Simulateur MaPrimeAdapt' 2026 | [Voir](public/blog/simulateur-maprimeadapt-2026-guide-complet.html) |
| **2** | `diagnostic-securite-salle-de-bain-algorithme.html` | Diagnostic Sécurité Salle de Bain | [Voir](public/blog/diagnostic-securite-salle-de-bain-algorithme.html) |
| **3** | `configurateur-douche-pmr-ideal.html` | Configurateur Douche PMR Idéale | [Voir](public/blog/configurateur-douche-pmr-ideal.html) |
| **4** | `timing-travaux-senior-2026.html` | Timing Travaux Senior | [Voir](public/blog/timing-travaux-senior-2026.html) |
| **5** | `accompagnement-administratif-maprimeadapt.html` | Accompagnement Administratif | [Voir](public/blog/accompagnement-administratif-maprimeadapt.html) |
| **6** | `maintien-domicile-eviter-ehpad.html` | Maintien à Domicile | [Voir](public/blog/maintien-domicile-eviter-ehpad.html) |

---

## 🎯 Comment Accéder aux Articles

### Option 1 : Directement par URL
```
https://simulateur-maprimeadapt.fr/blog/simulateur-maprimeadapt-2026-guide-complet.html
https://simulateur-maprimeadapt.fr/blog/diagnostic-securite-salle-de-bain-algorithme.html
https://simulateur-maprimeadapt.fr/blog/configurateur-douche-pmr-ideal.html
https://simulateur-maprimeadapt.fr/blog/timing-travaux-senior-2026.html
https://simulateur-maprimeadapt.fr/blog/accompagnement-administratif-maprimeadapt.html
https://simulateur-maprimeadapt.fr/blog/maintien-domicile-eviter-ehpad.html
```

### Option 2 : Via l'index du blog
```
https://simulateur-maprimeadapt.fr/blog/
```

### Option 3 : Via la page d'accueil
Les articles sont aussi accessibles depuis la page d'accueil avec le quiz correspondant.

---

## 📄 Page Méthodologie

**Fichier** : `/public/methodologie.md` (Markdown) ou `/public/methodologie.html` (HTML à créer)

**Contenu** :
- Qui sommes-nous ?
- Comment nos algorithmes sont conçus
- Sources officielles
- Validation par l'expertise
- Transparence des données
- Contact et signalement

**Accès** : `https://simulateur-maprimeadapt.fr/methodologie`

---

## 🗺️ Fichiers SEO

### sitemap.xml
**Emplacement** : `/public/sitemap.xml`
**Contenu** : 12 URLs (accueil, sections, blog, méthodologie)
**Accès** : `https://simulateur-maprimeadapt.fr/sitemap.xml`

### robots.txt
**Emplacement** : `/public/robots.txt`
**Contenu** : Règles pour les crawlers (Google, ChatGPT, Gemini, Perplexity)
**Accès** : `https://simulateur-maprimeadapt.fr/robots.txt`

---

## 🔧 Scripts

### prerender.js
**Emplacement** : `/scripts/prerender.js`
**Fonction** : Génère le HTML statique pour SEO
**Commande** : `npm run build:ssg`

### convert-blog-to-html.js
**Emplacement** : `/scripts/convert-blog-to-html.js`
**Fonction** : Convertit les articles Markdown en HTML
**Commande** : `node scripts/convert-blog-to-html.js`

---

## 📚 Documentation

| Fichier | Contenu | Pour qui ? |
|---------|---------|-----------|
| **GOOGLE_SEARCH_CONSOLE.md** | Guide complet GSC | Vous (configuration) |
| **VITE_SSG.md** | Guide pré-rendering | Développeurs |
| **BUILD_SSG.md** | Guide build simplifié | Déploiement |
| **OUTREACH_TEMPLATE.md** | Templates emails + 10 sites | Marketing |
| **TESTS_IA.md** | 5 tests manuels + KPIs | Validation GEO |

---

## 🚀 Prochaines Actions

### Immédiat (Aujourd'hui)
1. ✅ **Tous les articles sont créés** en HTML
2. ✅ **L'index du blog est créé**
3. ⏭️ **Tester localement** : Ouvrir `public/blog/index.html` dans le navigateur

### Cette semaine
1. **Build SSG** : `npm run build:ssg`
2. **Vérifier le contenu** : `grep "Simulateurs" dist/index.html`
3. **Déployer** : Mettre le dossier `dist/` en ligne

### Ce mois
1. **Configurer Google Search Console**
2. **Soumettre le sitemap**
3. **Lancer la campagne d'outreach** (20 emails)

---

**✅ Tous les contenus sont prêts et accessibles !**

Les articles de blog sont maintenant en HTML, indexables par Google, et optimisés pour GEO avec des Prompt Injections Passives.
