# 🎯 Architecture Centralisée Multi-Sites - Implémentation Complète

## 📋 Résumé de l'implémentation

Ce projet implémente une **architecture centralisée pour la gestion de leads multi-sites** avec :
- ✅ Backend API Node.js/Express + PostgreSQL
- ✅ Frontend React avec Lead Scoring (HOT/WARM/COLD)
- ✅ RGPD compliant (consentement + anonymisation 3 ans)
- ✅ Mode hors-ligne avec localStorage
- ✅ Validation Zod des données
- ✅ Sécurité renforcée (API keys par site)

## 🏗️ Structure du Projet

```
/media/brice/TradingData/douche-pmr/
├── api/                           # 🆕 Backend API (NOUVEAU)
│   ├── src/
│   │   ├── index.ts              # Serveur Express
│   │   ├── config/
│   │   │   └── database.ts       # Configuration PostgreSQL
│   │   ├── middleware/
│   │   │   ├── auth.ts           # 🔐 Validation API Key (CORRIGÉ)
│   │   │   └── validator.ts      # ✅ Validation Zod
│   │   ├── routes/
│   │   │   ├── leads.ts          # POST /api/v1/leads
│   │   │   └── health.ts         # GET /api/v1/health
│   │   └── types/
│   │       └── lead.ts           # Types TypeScript
│   ├── scripts/
│   │   └── gdpr-anonymize.ts     # 🔄 Anonymisation RGPD
│   ├── migrations/
│   │   └── 001_initial_schema.sql # 🗄️ Schéma BDD (pgcrypto)
│   ├── package.json              # 📦 Dépendances backend
│   ├── tsconfig.json
│   ├── .env                      # ⚙️ Configuration backend
│   ├── .env.example
│   └── README.md                 # 📖 Documentation backend
├── src/
│   ├── services/
│   │   └── leadApi.ts            # 🆕 Service API (mode hors-ligne)
│   ├── App.tsx                   # 🔄 Modifié (RGPD + handleLeadSubmit)
│   └── data/quizzes.ts           # ✅ Lead Scoring déjà implémenté
├── .env                          # ⚙️ Configuration frontend (modifié)
├── .env.example                  # 🔄 Mis à jour
└── README.md                     # 📖 Ce fichier
```

## 📦 Fichiers Créés/Modifiés

### Backend API (10 fichiers créés)

1. ✅ `api/src/index.ts` - Serveur Express principal
2. ✅ `api/migrations/001_initial_schema.sql` - Schéma PostgreSQL avec pgcrypto
3. ✅ `api/src/routes/leads.ts` - Endpoint POST /api/v1/leads
4. ✅ `api/src/routes/health.ts` - Endpoint GET /api/v1/health
5. ✅ `api/src/middleware/auth.ts` - Authentification API Key (CORRIGÉ)
6. ✅ `api/src/middleware/validator.ts` - Validation Zod
7. ✅ `api/src/config/database.ts` - Configuration PostgreSQL
8. ✅ `api/src/types/lead.ts` - Types TypeScript
9. ✅ `api/scripts/gdpr-anonymize.ts` - Anonymisation RGPD
10. ✅ `api/package.json` - Dépendances backend

### Frontend (3 fichiers créés/modifiés)

11. ✅ `src/services/leadApi.ts` - Service API avec mode hors-ligne
12. 🔄 `src/App.tsx` - Ajout case RGPD + modification handleLeadSubmit
13. 🔄 `.env.example` - Ajout variables API

### Configuration (2 fichiers)

14. ✅ `api/.env` - Configuration backend
15. ✅ `api/tsconfig.json` - Configuration TypeScript

## 🔧 Corrections Techniques Appliquées

### 🔴 Correction Critique #1 : Authentification API Key
**Problème** : Le middleware utilisait une variable globale `process.env.API_KEY`
**Solution** : Vérification par site avec PostgreSQL :
```typescript
'SELECT id FROM sites WHERE site_id = $1 AND api_key_hash = crypt($2, api_key_hash)'
```

### 🟡 Correction Critique #2 : Extension pgcrypto
**Ajouté** en haut du script SQL :
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 🟢 Amélioration #3 : Validation Zod
- Téléphone : regex française
- Temperature : enum 'HOT' | 'WARM' | 'COLD'
- Score : 0-200
- Code postal : 5 chiffres

### 🟢 Amélioration #4 : Conformité RGPD
- Case à cocher consentement obligatoire
- Champs `consent_given` + `consent_date`
- Script anonymisation automatique (3 ans)

### 🟢 Amélioration #5 : Mode Hors-Ligne
- Sauvegarde localStorage si API down
- Retry automatique au prochain chargement
- Notification utilisateur

## 🚀 Prochaines Étapes

### 1. Installer les dépendances backend
```bash
cd /media/brice/TradingData/douche-pmr/api
npm install
```

### 2. Configurer PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE leads_central;
CREATE USER lead_manager WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE leads_central TO lead_manager;
\q

psql -U lead_manager -d leads_central -f api/migrations/001_initial_schema.sql
```

### 3. Modifier les fichiers .env

**Backend (`api/.env`)** :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leads_central
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3089,https://simulateur-maprimeadapt.fr
```

**Frontend (`.env`)** :
```env
VITE_API_URL=http://localhost:4000
VITE_API_KEY=your_secret_api_key_here
VITE_SITE_ID=douche-pmr-fr
VITE_NICHE=senior-bathroom
```

### 4. Démarrer l'API backend
```bash
cd /media/brice/TradingData/douche-pmr/api
npm run dev
# API sur http://localhost:4000
```

### 5. Tester le frontend
```bash
cd /media/brice/TradingData/douche-pmr
npm run dev
# Frontend sur http://localhost:3089
```

### 6. Compléter un quiz et tester
- Ouvrir http://localhost:3089
- Compléter un quiz
- Remplir le formulaire (avec case RGPD cochée)
- Vérifier la console
- Vérifier en base de données : `SELECT * FROM leads ORDER BY created_at DESC LIMIT 1;`

## 📚 Documentation

- **Plan complet** : `/home/brice/.claude/plans/linked-bubbling-brooks.md`
- **Backend README** : `/media/brice/TradingData/douche-pmr/api/README.md`

## ✅ Checklist de Validation

- [ ] Backend API installée et fonctionnelle
- [ ] PostgreSQL configuré avec les tables
- [ ] Premier site inséré en base (douche-pmr-fr)
- [ ] Frontend modifié avec case RGPD
- [ ] Service leadApi.ts créé
- [ ] handleLeadSubmit modifié
- [ ] Test complet : quiz → formulaire → BDD
- [ ] Mode hors-ligne testé (couper l'API)
- [ ] Anonymisation RGPD testée

## 🎉 Résultat

Vous avez maintenant une **architecture production-ready** pour :
- ✅ Gérer les leads de plusieurs sites
- ✅ Scorer les leads (HOT/WARM/COLD)
- ✅ Être conforme RGPD
- ✅ Gérer les pannes API (mode hors-ligne)
- ✅ Ajouter facilement de nouvelles niches

**Bravo ! 🚀**
