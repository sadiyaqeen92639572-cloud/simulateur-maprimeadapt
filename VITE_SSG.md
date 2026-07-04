# 📖 Guide Vite SSG - Pré-rendering SEO pour Simulateur MaPrimeAdapt

## 🎯 Objectif

Générer du **HTML statique** au build pour que Google et les IA puissent lire le contenu sans exécuter JavaScript.

---

## 🚀 Utilisation

### Mode Développement (Normal)
```bash
npm run dev
```

### Build Standard (Sans SSG)
```bash
npm run build
```

### Build avec Pré-rendering SSG (Recommandé pour Production)
```bash
npm run build:ssg
```

Ce script va :
1. Lancer le build standard (`vite build`)
2. Lancer le serveur de développement en arrière-plan
3. Exécuter JSDOM pour charger la page et exécuter le JavaScript
4. Sauvegarder le HTML complet dans `dist/index.html`
5. Arrêter le serveur de développement

---

## ✅ Vérification

Après le build SSG, vérifiez que le contenu est bien présent :

```bash
# Vérifier que le H1 est dans le HTML
grep "Simulateurs et Quizz Douche PMR 2026" dist/index.html

# Vérifier que les titres de quiz sont présents
grep "Super Simulateur Aides" dist/index.html

# Vérifier que la FAQ est présente
grep "Quelles sont les conditions" dist/index.html
```

**Résultat attendu** : Le contenu doit être visible dans le HTML source, pas généré par JavaScript.

---

## 🧪 Tests

### Test 1 : Vérification manuelle
```bash
# Ouvrir le fichier dist/index.html
cat dist/index.html | less
```

Cherchez : "Simulateurs et Quizz Douche PMR 2026"

**Attendu** : Le texte est visible dans le HTML.

### Test 2 : Simulation Googlebot
```bash
# Si le site est en ligne
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" https://simulateur-maprimeadapt.fr/ | grep "Simulateurs"
```

**Attendu** : Le contenu est visible dans la réponse HTTP.

### Test 3 : Rich Results Test
1. Allez sur : https://search.google.com/test/rich-results
2. Entrez l'URL de votre site
3. Vérifiez que les JSON-LD sont détectés

---

## 🔧 Configuration

### Fichier : scripts/prerender.js

Le script utilise :
- **JSDOM** : Simule un navigateur headless
- **setTimeout** : Attend 3 secondes que le JS s'exécute
- **fs.writeFileSync** : Sauvegarde le HTML final

### Personnalisation

Si votre application est plus lente, augmentez le délai :

```javascript
// Dans scripts/prerender.js
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 secondes
```

---

## 🚨 Problèmes Courants

### Problème 1 : "Cannot find module 'jsdom'"
**Solution** :
```bash
npm install -D jsdom
```

### Problème 2 : Le contenu n'est pas généré
**Causes possibles** :
- Le délai est trop court (augmentez le setTimeout)
- Le serveur de développement n'est pas démarré
- L'application a une erreur JavaScript

**Solution** :
```bash
# Vérifier que le serveur démarre
npm run dev

# Dans un autre terminal, exécuter le build
npm run build:ssg
```

### Problème 3 : Les images ne s'affichent pas
**Cause** : Les chemins relatifs dans le HTML généré

**Solution** : Les chemins doivent commencer par `/` (absolus) et non `./` (relatifs)

---

## 📊 Comparaison : Avec vs Sans SSG

| Critère | Sans SSG | Avec SSG |
|---------|----------|----------|
| **Taille index.html** | ~2 KB | ~15 KB |
| **Contenu visible immédiatement** | ❌ Non | ✅ Oui |
| **Googlebot lit le contenu** | ❌ Parfois | ✅ Toujours |
| **IA agents (ChatGPT) lisent** | ❌ Rarement | ✅ Souvent |
| **LCP (First Contentful Paint)** | ~3s | ~0.5s |
| **SEO** | ⚠️ Moyen | ✅ Excellent |

---

## 🎓 Ressources

- **Documentation Vite** : https://vitejs.dev/guide/ssr.html
- **JSDOM** : https://github.com/jsdom/jsdom
- **Google Search Central** : https://developers.google.com/search/docs/crawling-indexing/javascript

---

**Note** : Le pré-rendering est une solution intermédiaire. Pour un site avec beaucoup de pages (blog), envisagez une migration vers **Next.js** ou **Astro**.

---

**Date** : 27 mars 2026
**Version** : 1.0
**Compatible** : Vite 6+, React 19+
