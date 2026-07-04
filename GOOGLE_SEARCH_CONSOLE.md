# 📊 Guide Configuration Google Search Console

## 🎯 Objectif
Configurer Google Search Console pour suivre les performances SEO, les Core Web Vitals et l'indexation du site Simulateur MaPrimeAdapt.

---

## 📋 Étape 1 : Créer une propriété Search Console

1. **Accéder à Google Search Console**
   - URL : https://search.google.com/search-console
   - Connectez-vous avec votre compte Google

2. **Ajouter une propriété**
   - Cliquez sur "Ajouter une propriété"
   - Sélectionnez "Prefixe d'URL" (recommandé)
   - Entrez : `https://simulateur-maprimeadapt.fr/`

---

## 🔐 Étape 2 : Vérifier la propriété du site

### Méthode 1 : Fichier HTML (Recommandée)

1. **Télécharger le fichier de vérification**
   - Google vous fournira un fichier HTML (ex: `google123456789.html`)
   - Téléchargez ce fichier

2. **Placer le fichier dans le dossier public**
   ```bash
   cp ~/Downloads/google123456789.html /media/brice/TradingData/douche-pmr/public/
   ```

3. **Déployer et vérifier**
   ```bash
   npm run build
   # Déployer le dossier dist sur votre serveur
   ```
   - Cliquez sur "Valider" dans Search Console

### Méthode 2 : Meta Tag (Alternative)

1. **Copier le meta tag fourni par Google**
   ```html
   <meta name="google-site-verification" content="votre_code_de_verification" />
   ```

2. **Ajouter dans index.html**
   - Placez-le dans le `<head>`, après les autres meta tags

3. **Valider dans Search Console**

---

## 🗺️ Étape 3 : Soumettre le Sitemap

1. **Accéder à la section Sitemaps**
   - Menu de gauche → "Sitemaps"

2. **Ajouter le sitemap**
   - Entrez : `sitemap.xml`
   - Cliquez sur "Envoyer"

3. **Vérifier l'indexation**
   - Attendez quelques heures
   - Vérifiez que les URLs sont indexées

---

## 📈 Étape 4 : Configurer les paramètres importants

### Paramètres d'exploration

**Menu de gauche** → "Paramètres" → "Paramètres d'exploration"

1. **Vitesse d'exploration**
   - Laissez sur "Utiliser la valeur par défaut recommandée par Google"
   - Ou augmentez si vous avez un serveur robuste

2. **Limiter la vitesse** (optionnel)
   - Utile si le serveur est sous forte charge

### Paramètres d'indexation

**Menu de gauche** → "Paramètres" → "Paramètres d'indexation"

1. **Domaine préféré**
   - Sélectionnez : `https://simulateur-maprimeadapt.fr/` (avec www)
   - Ou : `https://simulateur-maprimeadapt.fr/` (sans www)
   - **Important** : Choisissez une version et gardez-la cohérente

2. **Cible géographique**
   - Sélectionnez : "France"
   - Utile pour le SEO local

---

## 🔍 Étape 5 : Surveiller les Core Web Vitals

**Menu de gauche** → "Expérience" → "Core Web Vitals"

### Objectifs à atteindre

1. **LCP (Largest Contentful Paint)** : < 2.5s
   - Temps de chargement du plus grand élément
   - **Cible** : Bon (< 2.5s)

2. **FID (First Input Delay)** : < 100ms
   - Délai avant la première interaction
   - **Cible** : Bon (< 100ms)

3. **CLS (Cumulative Layout Shift)** : < 0.1
   - Décalage cumulé de la mise en page
   - **Cible** : Bon (< 0.1)

### Actions correctives si problèmes

**Si LCP > 2.5s** :
- Optimiser les images (WebP, compression)
- Utiliser Vite SSG (pré-rendering)
- Minimiser le JavaScript

**Si CLS > 0.1** :
- Ajouter des dimensions explicites aux images
- Réserver de l'espace pour les éléments dynamiques
- Éviter d'insérer du contenu au-dessus du contenu existant

---

## 📊 Étape 6 : Surveiller les performances

### Rapport de performance

**Menu de gauche** → "Performance"

**Métriques clés à suivre** :
1. **Total des clics** : Nombre de visiteurs depuis Google
2. **Total des impressions** : Nombre d'affichages dans les résultats
3. **CTR (Click-Through Rate)** : clics / impressions
4. **Position moyenne** : Classement moyen dans les résultats

**Filtres utiles** :
- Par pays : France
- Par appareil : Mobile / Desktop
- Par date : 30 derniers jours
- Par requête : "simulateur maprimeadapt", "douche pmr", etc.

### Rapport de couverture

**Menu de gauche** → "Indexation" → "Pages"

**Statuts possibles** :
- ✅ **Validé** : Indexée et apparaît dans Google
- ⚠️ **Avertissement** : Indexée mais avec problèmes
- ❌ **Erreur** : Non indexée (à corriger)
- ℹ️ **Exclue** : Intentionnellement non indexée

---

## 🎯 Étape 7 : Définir des objectifs de suivi

### Objectifs à atteindre (30 jours)

1. **Indexation**
   - [ ] 100% des pages importantes indexées
   - [ ] Sitemap entièrement traité

2. **Performance**
   - [ ] Core Web Vitals au vert (Bon)
   - [ ] LCP < 2.5s
   - [ ] CLS < 0.1

3. **Visibilité**
   - [ ] Apparaître dans les résultats pour "simulateur MaPrimeAdapt' 2026"
   - [ ] Position moyenne < 20 pour les mots-clés cibles
   - [ ] CTR > 3%

---

## 🔧 Étape 8 : Intégrations supplémentaires

### Connecter Google Analytics 4

1. **Créer une propriété GA4**
   - URL : https://analytics.google.com

2. **Obtenir l'ID de mesure**
   - Format : `G-XXXXXXXXXX`

3. **Ajouter dans index.html**
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

### Connecter Google Tag Manager (Optionnel)

1. **Créer un conteneur GTM**
   - URL : https://tagmanager.google.com

2. **Ajouter le code dans index.html**
   - Placez-le dans le `<head>`

---

## 📅 Étape 9 : Plan de vérification régulière

### Quotidien (Première semaine)
- [ ] Vérifier les erreurs d'exploration
- [ ] Surveiller les Core Web Vitals
- [ ] Vérifier l'indexation des nouvelles pages

### Hebdomadaire
- [ ] Analyser les performances (clics, impressions, CTR)
- [ ] Identifier les nouvelles opportunités de mots-clés
- [ ] Vérifier les problèmes de sécurité

### Mensuel
- [ ] Rapport complet de performance
- [ ] Analyse des Core Web Vitals
- [ ] Ajuster la stratégie SEO selon les résultats

---

## 🎓 Ressources utiles

- **Documentation Search Console** : https://developers.google.com/search/docs
- **Rich Results Test** : https://search.google.com/test/rich-results
- **PageSpeed Insights** : https://pagespeed.web.dev/
- **Mobile-Friendly Test** : https://search.google.com/test/mobile-friendly

---

## ✅ Checklist de vérification

- [ ] Propriété créée dans Search Console
- [ ] Site vérifié (fichier HTML ou meta tag)
- [ ] Sitemap soumis et validé
- [ ] Paramètres d'exploration configurés
- [ ] Domaine préféré défini
- [ ] Cible géographique : France
- [ ] Core Web Vitals vérifiés
- [ ] Rapport de performance analysé
- [ ] Google Analytics 4 connecté
- [ ] Plan de vérification régulière établi

---

**Note** : Cette configuration est un processus continu. Surveillez régulièrement les performances et ajustez selon les résultats.

**Date de création** : 27 mars 2026
**Version** : 1.0
