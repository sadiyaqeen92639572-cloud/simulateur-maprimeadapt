# 🚀 Guide de Démarrage Rapide - Architecture Centralisée Leads

## 📋 Vue d'ensemble

Ce projet implémente une **architecture centralisée multi-sites** pour la gestion des leads avec :
- Backend API Node.js/Express + PostgreSQL
- Frontend React avec Lead Scoring
- Conformité RGPD
- Mode hors-ligne

## ⚡ Démarrage Rapide (5 min)

### 1. Installation Backend (2 min)

```bash
# Aller dans le dossier API
cd /media/brice/TradingData/douche-pmr/api

# Installer les dépendances
npm install

# Copier et configurer .env
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL
```

### 2. Configuration PostgreSQL (1 min)

```bash
# Créer la base de données
sudo -u postgres psql
CREATE DATABASE leads_central;
CREATE USER lead_manager WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE leads_central TO lead_manager;
\q

# Exécuter les migrations
psql -U lead_manager -d leads_central -f migrations/001_initial_schema.sql
```

### 3. Démarrage (1 min)

```bash
# Terminal 1 : Démarrer l'API backend
cd /media/brice/TradingData/douche-pmr/api
npm run dev
# → API sur http://localhost:4000

# Terminal 2 : Démarrer le frontend
cd /media/brice/TradingData/douche-pmr
npm run dev
# → Frontend sur http://localhost:3089
```

### 4. Test (1 min)

```bash
# Ouvrir http://localhost:3089
# Compléter un quiz
# Remplir le formulaire (cocher la case RGPD)
# Vérifier : SELECT * FROM leads ORDER BY created_at DESC LIMIT 1;
```

## 🔧 Configuration

### Variables d'environnement Backend (`api/.env`)

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

### Variables d'environnement Frontend (`.env`)

```env
VITE_API_URL=http://localhost:4000
VITE_API_KEY=your_secret_api_key_here
VITE_SITE_ID=douche-pmr-fr
VITE_NICHE=senior-bathroom
```

**IMPORTANT** : L'API_KEY doit correspondre à celle générée dans la base de données :

```sql
-- Voir les sites et leurs API keys
SELECT site_id, site_name, niche FROM sites;

-- Régénérer une API key pour un site
UPDATE sites
SET api_key_hash = crypt('NOUVELLE_API_KEY', gen_salt('bf'))
WHERE site_id = 'douche-pmr-fr';
```

## 🧪 Tests

### Test automatique

```bash
cd /media/brice/TradingData/douche-pmr/api

# Exporter les variables
export API_URL=http://localhost:4000
export API_KEY=your_secret_api_key_here

# Lancer les tests
./test-api.sh
```

### Test manuel

```bash
# Health check
curl http://localhost:4000/api/v1/health

# Créer un lead
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here" \
  -d '{
    "site_id": "douche-pmr-fr",
    "niche": "senior-bathroom",
    "quiz_id": "test",
    "quiz_title": "Test Quiz",
    "contact_name": "Jean Dupont",
    "contact_phone": "0612345678",
    "contact_zip": "75001",
    "quiz_score": 85,
    "lead_temperature": "HOT",
    "answers": {"test": "data"},
    "consent_given": true,
    "consent_date": "2026-03-26T10:00:00Z"
  }'
```

## 📊 Vérification Base de Données

```bash
# Se connecter
psql -U lead_manager -d leads_central

# Voir les leads récents
SELECT id, site_id, contact_name, quiz_score, lead_temperature, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;

# Voir les sites configurés
SELECT * FROM sites;

# Compter les leads par température
SELECT lead_temperature, COUNT(*)
FROM leads
GROUP BY lead_temperature;

# Quitter
\q
```

## 🆕 Ajouter un Nouveau Site

```sql
-- 1. Ajouter le site en base
INSERT INTO sites (site_id, site_name, niche, api_key_hash)
VALUES (
  'nouveau-site-fr',
  'Nom du Nouveau Site',
  'nouvelle-niche',
  crypt('API_KEY_UNIQUE_POUR_CE_SITE', gen_salt('bf'))
);

-- 2. Configurer les variables frontend du nouveau site
-- VITE_API_URL=https://api.votre-serveur.com
-- VITE_API_KEY=API_KEY_UNIQUE_POUR_CE_SITE
-- VITE_SITE_ID=nouveau-site-fr
-- VITE_NICHE=nouvelle-niche

-- 3. Copier leadApi.ts dans le nouveau projet
-- 4. Modifier handleLeadSubmit comme dans App.tsx
```

## 🔄 Anonymisation RGPD

```bash
# Manuel (une fois)
cd /media/brice/TradingData/douche-pmr/api
npm run anonymize

# Automatique (mensuel via crontab)
0 2 1 * * cd /var/www/leads-api && npm run anonymize
```

## 🐛 Dépannage

### L'API ne démarre pas

```bash
# Vérifier si PostgreSQL tourne
sudo systemctl status postgresql

# Vérifier les logs
npm run dev 2>&1 | tee api.log

# Vérifier la connexion BDD
psql -U lead_manager -d leads_central -c "SELECT 1;"
```

### Erreur "API Key invalide"

```bash
# Vérifier que l'API_KEY correspond
psql -U lead_manager -d leads_central

SELECT site_id, api_key_hash FROM sites WHERE site_id = 'douche-pmr-fr';

# Régénérer si nécessaire
UPDATE sites
SET api_key_hash = crypt('VOTRE_API_KEY', gen_salt('bf'))
WHERE site_id = 'douche-pmr-fr';
```

### Le lead n'est pas créé

```bash
# Vérifier les logs API
# Vérifier que le consentement est true
# Vérifier le format du téléphone (0612345678 ou +33612345678)

# Tester avec curl
curl -v -X POST http://localhost:4000/api/v1/leads ...
```

## 📚 Documentation Complète

- **Plan d'implémentation** : `/home/brice/.claude/plans/linked-bubbling-brooks.md`
- **Guide backend** : `/media/brice/TradingData/douche-pmr/api/README.md`
- **Détails implémentation** : `/media/brice/TradingData/douche-pmr/IMPLEMENTATION.md`

## ✅ Checklist Production

- [ ] Modifier `.env` pour la production
- [ ] Configurer Nginx reverse proxy
- [ ] Installer SSL (Let's Encrypt)
- [ ] Configurer PM2 pour gérer le processus
- [ ] Mettre en place les backups automatiques
- [ ] Configurer la crontab d'anonymisation RGPD
- [ ] Surveiller les logs avec Winston
- [ ] Configurer un monitoring (Uptime, etc.)

## 🎉 Succès !

Votre architecture centralisée est prête ! Vous pouvez maintenant :
- ✅ Gérer les leads de plusieurs sites
- ✅ Scorer automatiquement les leads
- ✅ Être conforme RGPD
- ✅ Gérer les pannes (mode hors-ligne)
- ✅ Ajouter facilement de nouvelles niches

**Bravo ! 🚀**
