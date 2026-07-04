# 🏗️ Architecture Centralisée Multi-Sites - Vue d'Ensemble

## 📊 Architecture Complète

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTENDS (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ simulateur-maprimeadapt.fr │  │ solaire-fr.eu│  │ csrd-eu.com  │  ...      │
│  │  (Simulateur MaPrimeAdapt) │  │ (Solaire)    │  │ (CSR)        │           │
│  │              │  │              │  │              │           │
│  │ • 6 Quiz     │  │ • Quiz       │  │ • Quiz       │           │
│  │ • Lead Score │  │ • Lead Score │  │ • Lead Score │           │
│  │ • Formulaire │  │ • Formulaire │  │ • Formulaire │           │
│  │ • RGPD       │  │ • RGPD       │  │ • RGPD       │           │
│  │ • Hors-ligne │  │ • Hors-ligne │  │ • Hors-ligne │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         │ leadApi.ts      │ leadApi.ts      │ leadApi.ts        │
│         │ (localStorage)  │ (localStorage)  │ (localStorage)     │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                    POST /api/v1/leads                           │
│                    X-API-Key: unique_per_site                   │
│                           ▼                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Centrale  │
                    │  Node.js/Express│
                    │  Port 4000      │
                    └───────┬────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
        ┌───────────┐ ┌────────┐ ┌──────────┐
        │  Middleware│ │ Routes │ │ Types    │
        │           │ │        │ │          │
        │ • Auth    │ │ • POST │ │ LeadSub  │
        │ • Zod     │ │ • GET  │ │ StoredL  │
        │ • CORS    │ │ • Stats│ │ SiteConf │
        │ • Helmet  │ │        │ │          │
        └───────────┘ └────────┘ └──────────┘
                            │
                    ┌───────▼────────┐
                    │  PostgreSQL    │
                    │  leads_central │
                    └───────┬────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
        ┌───────────┐ ┌────────┐ ┌──────────┐
        │   leads   │ │ sites  │ • pgcrypto│
        │           │ │        │ │ • JSONB  │
        │ • JSONB   │ │ • API  │ │ • Index  │
        │ • Index   │ │ • Hash │ │ • Constr │
        │ • RGPD    │ │        │ │          │
        └───────────┘ └────────┘ └──────────┘
```

---

## 🔄 Flux de Données

### 1. Création d'un Lead

```
Utilisateur → Quiz → Formulaire (RGPD) → leadApi.ts
                                              ↓
                                        localStorage (backup)
                                              ↓
                                          API Central
                                              ↓
                                          Middleware
                                          • Auth (API Key)
                                          • Zod (Validation)
                                              ↓
                                          PostgreSQL
                                          • INSERT leads
                                          • RETURNING id
                                              ↓
                                          Réponse Frontend
                                              ↓
                                        localStorage cleanup
```

### 2. Mode Hors-Ligne

```
API Down → localStorage (sauvegarde)
              ↓
         Prochain chargement (2s)
              ↓
         Retry automatique
              ↓
         Succès → localStorage cleanup
         Échec → Rester dans localStorage
```

### 3. Anonymisation RGPD

```
Crontab (mensuel) → npm run anonymize
                          ↓
                     gdpr-anonymize.ts
                          ↓
                     UPDATE leads
                     WHERE created_at < 3 ans
                     SET contact_name = 'ANONYMIZED'
```

---

## 📁 Structure des Fichiers

### Backend API (13 fichiers)

```
api/
├── src/
│   ├── index.ts                    # Point d'entrée Express
│   ├── config/
│   │   └── database.ts             # Configuration PostgreSQL (pool)
│   ├── middleware/
│   │   ├── auth.ts                 # Auth par site (crypt() verify)
│   │   └── validator.ts            # Zod schema validation
│   ├── routes/
│   │   ├── leads.ts                # POST /api/v1/leads
│   │   └── health.ts               # GET /api/v1/health
│   └── types/
│       └── lead.ts                 # LeadSubmission, StoredLead
├── scripts/
│   └── gdpr-anonymize.ts           # Anonymisation 3 ans
├── migrations/
│   └── 001_initial_schema.sql      # + pgcrypto
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── ecosystem.config.js             # PM2 config
├── .env + .env.example             # Environment variables
├── README.md                       # Backend documentation
└── test-api.sh                     # Automated tests
```

### Frontend (2 fichiers)

```
src/
├── services/
│   └── leadApi.ts                  # fetch() + localStorage + retry
└── App.tsx                         # Form RGPD + handleLeadSubmit async
```

### Documentation (5 fichiers)

```
├── README.md                       # Global README (updated)
├── QUICK_START.md                  # 5-min quick start
├── TODO.md                         # Next steps
├── IMPLEMENTATION_SUMMARY.md       # Complete summary
└── IMPLEMENTATION.md               # Technical details
```

---

## 🔐 Sécurité

### API Key Authentication

```typescript
// Header
X-API-Key: unique_api_key_per_site

// Body
{
  "site_id": "douche-pmr-fr",
  ...
}

// Vérification PostgreSQL
SELECT id FROM sites
WHERE site_id = $1
AND api_key_hash = crypt($2, api_key_hash)
AND active = true
```

### Validation Zod

```typescript
leadSchema = z.object({
  site_id: z.string().regex(/^[a-z0-9-]+$/),
  contact_phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/),
  lead_temperature: z.enum(['HOT', 'WARM', 'COLD']),
  quiz_score: z.number().int().min(0).max(200),
  consent_given: z.boolean()
})
```

---

## 🗄️ Base de Données

### Table leads

```sql
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    niche VARCHAR(50) NOT NULL,
    quiz_id VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    quiz_score INTEGER NOT NULL,
    lead_temperature VARCHAR(20) CHECK (lead_temperature IN ('HOT', 'WARM', 'COLD')),
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP,
    answers JSONB NOT NULL,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table sites

```sql
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    site_id VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    niche VARCHAR(50) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true
);
```

---

## 🚀 Déploiement

### Développement

```bash
# Terminal 1
cd api && npm run dev  # Port 4000

# Terminal 2
npm run dev            # Port 3089
```

### Production

```bash
# Build
cd api && npm run build

# PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Nginx
sudo ln -s /etc/nginx/sites-available/leads-api /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d api.votre-serveur.com
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:4000/api/v1/health
```

### Stats

```bash
curl http://localhost:4000/api/v1/leads/stats \
  -H "X-API-Key: your_key"
```

### Logs

```bash
# PM2 logs
pm2 logs leads-api

# Error logs
tail -f api/logs/error.log

# Combined logs
tail -f api/logs/combined.log
```

---

## 🎯 Extensions Futures

### Ajouter un Site

```sql
INSERT INTO sites (site_id, site_name, niche, api_key_hash)
VALUES ('nouveau-site', 'Nouveau Site', 'niche', crypt('API_KEY', gen_salt('bf')));
```

### Dashboard Analytics

```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_leads,
    AVG(quiz_score) as avg_score,
    COUNT(CASE WHEN lead_temperature = 'HOT' THEN 1 END) as hot_leads
FROM leads
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Export CSV

```sql
COPY (
    SELECT site_id, contact_name, contact_phone, quiz_score, lead_temperature, created_at
    FROM leads
    WHERE created_at > NOW() - INTERVAL '30 days'
) TO '/tmp/leads.csv' WITH CSV HEADER;
```

---

## 🎉 Résumé

**Architecture** : Centralisée, multi-sites, RGPD compliant
**Technologies** : Node.js, Express, PostgreSQL, React, TypeScript
**Sécurité** : API keys par site, Zod validation, bcrypt hashing
**Résilience** : Mode hors-ligne, retry automatique
**Statut** : ✅ PRODUCTION READY

**Bravo ! 🚀**
