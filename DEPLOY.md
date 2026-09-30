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

## Fichiers bloqués côté nginx

`location ~* (\.bak.*|\.md)$ { return 404; }` dans `/etc/nginx/sites-enabled/senior-bain` —
empêche l'exposition publique des `.md` sources et des `.bak-*` laissés par les déploiements
précédents. Ajouté 2026-09-30. Les nouveaux `.bak`/.md créés par un futur déploiement restent
404 automatiquement, pas besoin de les nettoyer un par un — mais évite quand même de les laisser
dans `dist/`, préfère un dossier `old-$(date)/` hors du served root (voir `deploy.sh`).
