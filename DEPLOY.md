# Déploiement — simulateur-maprimeadapt.fr

VPS nginx (`root@156.67.31.2`), pas de CI/CD. `dist/` du VPS = source de vérité vivante, pas ce repo.

## Piège `scripts/convert-blog-to-html.js`

Ce script régénère les pages blog depuis `public/blog/*.md` + `scripts/blog-template.html`.
**Le template local est plus ancien que le HTML réellement en prod** (structure Tailwind différente :
bio auteur, blocs CTA, breadcrumbs). Le lancer écraserait les pages blog en ligne par une version
dégradée.

Tant que le template n'est pas remis à niveau sur le HTML prod actuel :
- Le script est retiré de `npm run build` / `npm run build:ssg` (voir `package.json`).
- Il reste accessible sous `build:blog-legacy-DO-NOT-RUN` — ne pas l'exécuter sans avoir d'abord
  mis à jour `scripts/blog-template.html` pour matcher le HTML prod actuel.

## Ordre à suivre pour tout déploiement

1. **Sources** : corriger dans `src/`, `public/`, `scripts/`. Grep l'ancien slug/contenu partout
   (cartes/articles, breadcrumbs, JSON-LD, `og:url`, sitemap, RSS, index blog) avant de builder.
2. **Build** : `npx vite build` dans une copie isolée (pas `npm run build` si le blog n'a pas besoin
   de changer — sinon régénère avec l'ancien template, voir piège ci-dessus). Re-grep le dossier
   `dist/` de sortie : il doit être vide sauf la règle de redirection nginx.
3. **Déploiement** : backup du `dist/` VPS actuel hors du dossier servi (`old-$(date)/`), puis upload.
   Si la config nginx change, `nginx -t` avant tout reload.
4. **Vérification** : `curl -sI` 200 sur les nouvelles pages, `grep -c` ancien slug (doit être 0) et
   nouveau slug (doit être > 0) sur la home servie, clic réel sur les liens pour confirmer l'absence
   de redirection, purge cache navigateur si besoin.

## `index.html` (home) : prérendu patché à la main, pas régénéré

`dist/index.html` et `/var/www/senior-bain/index.html` (copie racine, à garder synchro) sont le
rendu Playwright (`scripts/prerender.js`) d'une session antérieure, **patché à la main** depuis
(changement de hash d'assets JS/CSS après un `vite build`, correction de texte de carte). Le
prérendu n'a **pas** été relancé.

- Tant que les changements sur la home sont limités (hash d'assets, un titre/texte de carte, un
  lien), patcher `dist/index.html` à la main (remplacement de chaîne ciblé, borné et vérifié —
  voir piège script ci-dessous) est plus sûr que de relancer Playwright : ça évite tout effet de
  bord sur le reste du rendu.
- Dès que la home change de **structure** (nouvelle section, nouveau composant, changement de
  layout), il faut relancer `node scripts/prerender.js` sur un build frais, puis diff le résultat
  contre l'`index.html` actuel pour confirmer que seul le changement voulu apparaît.

## Piège des scripts de patch par slicing Python

Un script qui fait `s.find(marker)` puis découpe la chaîne à cet index peut corrompre tout le
fichier si le marker ne matche pas (guillemets/apostrophes typographiques, espaces insécables
`\xa0` fréquents dans le HTML de ce site) : `find()` renvoie `-1`, et la découpe se fait n'importe
où dans le fichier. Toujours `assert idx != -1` juste après chaque recherche de borne, et vérifier
`git diff --stat` avant tout déploiement — un fichier qui double de taille se voit immédiatement.

## Fichiers bloqués côté nginx

`location ~* (\.bak.*|\.md)$ { return 404; }` dans `/etc/nginx/sites-enabled/senior-bain` —
empêche l'exposition publique des `.md` sources et des `.bak-*` laissés par les déploiements
précédents. Ajouté 2026-09-30. Les nouveaux `.bak`/.md créés par un futur déploiement restent
404 automatiquement, pas besoin de les nettoyer un par un — mais évite quand même de les laisser
dans `dist/`, préfère un dossier `old-$(date)/` hors du served root (voir `deploy.sh`).
