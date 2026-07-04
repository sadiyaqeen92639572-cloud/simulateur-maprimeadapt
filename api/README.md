# Leads API - Architecture Centralisée Multi-Sites

API Node.js/Express pour la gestion centralisée des leads multi-sites avec PostgreSQL.

## 🏗️ Architecture

```
Frontends (React) → API Centralisée → PostgreSQL (leads + sites)
```

## ✨ Fonctionnalités

- ✅ **Multi-sites** : Gestion de plusieurs niches avec `site_id`
- ✅ **Sécurité** : API keys par site avec hash bcrypt (pgcrypto)
- ✅ **Validation** : Zod pour validation stricte des données
- ✅ **RGPD compliant** : Consentement obligatoire, anonymisation auto (3 ans)
- ✅ **Résilience** : Mode hors-ligne frontend avec localStorage
- ✅ **JSONB flexible** : Stockage des réponses quiz spécifiques par niche
- ✅ **Lead Scoring** : HOT/WARM/COLD déjà implémenté frontend

## 📦 Installation

```bash
cd /media/brice/TradingData/douche-pmr/api
npm install
```

## ⚙️ Configuration

1. **Copier le fichier .env** :
```bash
cp .env.example .env
```

2. **Modifier les variables** :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leads_central
DB_USER=postgres
DB_PASSWORD=your_password

PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3089,https://simulateur-maprimeadapt.fr
```

## 🗄️ Base de données

1. **Créer la BDD** :
```bash
sudo -u postgres psql
CREATE DATABASE leads_central;
CREATE USER lead_manager WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE leads_central TO lead_manager;
\q
```

2. **Exécuter les migrations** :
```bash
psql -U lead_manager -d leads_central -f migrations/001_initial_schema.sql
```

3. **Générer une API key pour un nouveau site** :
```sql
INSERT INTO sites (site_id, site_name, niche, api_key_hash)
VALUES (
  'nouveau-site-fr',
  'Nom du Site',
  'niche',
  crypt('VOTRE_API_KEY_ICI', gen_salt('bf'))
);
```

## 🚀 Démarrage

**Développement** :
```bash
npm run dev
# API disponible sur http://localhost:4000
```

**Production** :
```bash
npm run build
npm start
```

## 🧪 Tests

**Health check** :
```bash
curl http://localhost:4000/api/v1/health
```

**Créer un lead** :
```bash
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here" \
  -d '{
    "site_id": "douche-pmr-fr",
    "niche": "senior-bathroom",
    "quiz_id": "aides-financieres",
    "quiz_title": "Super Simulateur Aides Globales 2026",
    "contact_name": "Jean Dupont",
    "contact_phone": "0612345678",
    "contact_zip": "75001",
    "quiz_score": 85,
    "lead_temperature": "HOT",
    "answers": {"status": "proprio", "age": "80_plus"},
    "consent_given": true,
    "consent_date": "2026-03-26T10:00:00Z"
  }'
```

## 🔄 Anonymisation RGPD (CNIL)

**Exécuter manuellement** :
```bash
npm run anonymize
```

**Crontab pour automatique (mensuel)** :
```bash
0 2 1 * * cd /var/www/leads-api && npm run anonymize
```

## 📊 Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/leads` | Créer un nouveau lead |
| GET | `/api/v1/leads/stats` | Statistiques (30 derniers jours) |
| GET | `/api/v1/health` | Health check |

## 🔐 Sécurité

- ✅ API keys par site avec hash bcrypt
- ✅ Validation Zod des données entrantes
- ✅ CORS configuré par origines autorisées
- ✅ Helmet pour headers HTTP sécurisés
- ✅ RGPD compliant (consentement + anonymisation)

## 📁 Structure

```
api/
├── src/
│   ├── index.ts              # Serveur Express
│   ├── config/
│   │   └── database.ts       # Configuration PostgreSQL
│   ├── middleware/
│   │   ├── auth.ts           # Validation API Key
│   │   └── validator.ts      # Validation Zod
│   ├── routes/
│   │   ├── leads.ts          # Endpoint leads
│   │   └── health.ts         # Health check
│   └── types/
│       └── lead.ts           # Types TypeScript
├── scripts/
│   └── gdpr-anonymize.ts     # Anonymisation RGPD
├── migrations/
│   └── 001_initial_schema.sql
├── package.json
├── tsconfig.json
└── .env
```

## 🚀 Déploiement Production

Voir le plan complet dans `/home/brice/.claude/plans/linked-bubbling-brooks.md` pour :
- Configuration Nginx
- SSL avec Let's Encrypt
- PM2 pour gestion processus
- Backups automatisés
