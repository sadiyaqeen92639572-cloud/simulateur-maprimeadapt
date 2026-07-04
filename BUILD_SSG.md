# 🚀 Guide Build SSG - Pour le Déploiement

## Commande pour générer le HTML statique

```bash
npm run build:ssg
```

## Ce que fait la commande

1. **Build standard** : `vite build` → Génère `dist/`
2. **Pré-rendering** : Charge la page, exécute le JS, sauvegarde le HTML
3. **Résultat** : `dist/index.html` contient tout le contenu

## Vérification rapide

```bash
# Vérifier que le contenu est là
grep "Simulateurs et Quizz Douche PMR 2026" dist/index.html
```

**Si ça retourne du texte** = ✅ Succès !
**Si ça ne retourne rien** = ❌ Le pré-rendering a échoué

## Déploiement

Une fois le build terminé, déployez le dossier `dist/` :
- Sur votre serveur web (Nginx, Apache)
- Sur Vercel / Netlify
- Sur GitHub Pages (si gratuit)

---

**C'est tout !** 🎉
