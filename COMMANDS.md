# 🔧 Commandes Utiles - Architecture Centralisée

## 📋 Table des Matières

- [Backend API](#backend-api)
- [PostgreSQL](#postgresql)
- [Frontend](#frontend)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Monitoring](#monitoring)
- [Dépannage](#dépannage)

---

## Backend API

### Installation

```bash
cd /media/brice/TradingData/douche-pmr/api
npm install
```

### Développement

```bash
# Démarrer en mode développement
npm run dev

# Démarrer avec logs
npm run dev 2>&1 | tee api.log
```

### Production

```bash
# Compiler
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Arrêter
pm2 stop leads-api

# Redémarrer
pm2 restart leads-api

# Supprimer
pm2 delete leads-api
```

### Logs

```bash
# Logs PM2
pm2 logs leads-api

# Logs en temps réel
pm2 logs leads-api --lines 100

# Logs fichier
tail -f api/logs/error.log
tail -f api/logs/out.log
tail -f api/logs/combined.log
```

---

## PostgreSQL

### Connexion

```bash
# Se connecter
sudo -u postgres psql

# Se connecter à la BDD
psql -U lead_manager -d leads_central
```

### Création Base de Données

```bash
sudo -u postgres psql
CREATE DATABASE leads_central;
CREATE USER lead_manager WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE leads_central TO lead_manager;
\q
```

### Migrations

```bash
# Exécuter les migrations
psql -U lead_manager -d leads_central -f api/migrations/001_initial_schema.sql

# Vérifier les tables
psql -U lead_manager -d leads_central
\dt
\d leads
\d sites
```

### Requêtes Utiles

```sql
-- Voir les leads récents
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;

-- Voir les sites
SELECT * FROM sites;

-- Compter par température
SELECT lead_temperature, COUNT(*) FROM leads GROUP BY lead_temperature;

-- Moyenne des scores par site
SELECT site_id, AVG(quiz_score), COUNT(*) FROM leads GROUP BY site_id;

-- Leads des 30 derniers jours
SELECT * FROM leads WHERE created_at > NOW() - INTERVAL '30 days';

-- Leads HOT
SELECT * FROM leads WHERE lead_temperature = 'HOT' ORDER BY created_at DESC;

-- Anonymiser un lead spécifique
UPDATE leads SET
  contact_name = 'ANONYMIZED',
  contact_phone = 'ANONYMIZED',
  contact_zip = '00000'
WHERE id = X;

-- Vider la table (DANGER!)
TRUNCATE leads RESTART IDENTITY CASCADE;
```

### Backup

```bash
# Backup manuel
pg_dump -U lead_manager leads_central > backup_$(date +%Y%m%d).sql

# Backup compressé
pg_dump -U lead_manager leads_central | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
psql -U lead_manager -d leads_central < backup_20260326.sql
```

---

## Frontend

### Installation

```bash
cd /media/brice/TradingData/douche-pmr
npm install
```

### Développement

```bash
# Démarrer
npm run dev

# Port par défaut : 3089
```

### Build

```bash
# Build pour production
npm run build

# Preview du build
npm run preview
```

---

## Tests

### Backend

```bash
cd /media/brice/TradingData/douche-pmr/api

# Test avec le script
export API_URL=http://localhost:4000
export API_KEY=your_secret_api_key_here
./test-api.sh
```

### Frontend

```bash
# Ouvrir le navigateur
http://localhost:3089

# Compléter un quiz
# Remplir le formulaire
# Vérifier la console
```

### Manuel

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

---

## Déploiement

### Nginx

```bash
# Créer la configuration
sudo nano /etc/nginx/sites-available/leads-api

# Activer
sudo ln -s /etc/nginx/sites-available/leads-api /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

### SSL

```bash
# Installer Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d api.votre-serveur.com

# Renouvellement automatique (crontab)
0 2 * * * certbot renew --quiet
```

### PM2

```bash
# Installer
npm install -g pm2

# Démarrer
pm2 start ecosystem.config.js

# Sauvegarder
pm2 save

# Démarrage automatique
pm2 startup
```

---

## Monitoring

### Health Checks

```bash
# API health
curl http://localhost:4000/api/v1/health

# Stats
curl http://localhost:4000/api/v1/leads/stats \
  -H "X-API-Key: your_api_key"
```

### Logs

```bash
# PM2 logs
pm2 logs leads-api

# Logs fichiers
tail -f api/logs/combined.log

# Erreurs seulement
tail -f api/logs/error.log
```

### Performance

```bash
# Voir les processus PM2
pm2 list

# Monitoring en temps réel
pm2 monit

# Stats
pm2 show leads-api
```

---

## Dépannage

### API ne démarre pas

```bash
# Vérifier si PostgreSQL tourne
sudo systemctl status postgresql

# Vérifier les logs
npm run dev 2>&1 | grep -i error

# Vérifier la connexion BDD
psql -U lead_manager -d leads_central -c "SELECT 1;"
```

### Erreur "API Key invalide"

```bash
# Vérifier les sites
psql -U lead_manager -d leads_central
SELECT site_id, api_key_hash FROM sites;

# Régénérer une clé
UPDATE sites
SET api_key_hash = crypt('NOUVELLE_CLE', gen_salt('bf'))
WHERE site_id = 'douche-pmr-fr';
```

### Lead non créé

```bash
# Vérifier les logs API
pm2 logs leads-api --lines 50

# Vérifier les données envoyées
curl -v -X POST http://localhost:4000/api/v1/leads ...

# Vérifier en base
psql -U lead_manager -d leads_central
SELECT * FROM leads ORDER BY created_at DESC LIMIT 1;
```

### Mode hors-ligne

```bash
# Vider le localStorage
# Dans la console du navigateur :
localStorage.removeItem('pending_leads')

# Voir les leads en attente
localStorage.getItem('pending_leads')
```

---

## RGPD

### Anonymisation

```bash
# Manuelle
cd api
npm run anonymize

# Automatique (crontab)
0 2 1 * * cd /var/www/leads-api && npm run anonymize
```

### Vérification

```sql
-- Leads non anonymisés
SELECT COUNT(*) FROM leads WHERE contact_name != 'ANONYMIZED';

-- Leads anonymisés
SELECT COUNT(*) FROM leads WHERE contact_name = 'ANONYMIZED';

-- Leads de plus de 3 ans non anonymisés
SELECT COUNT(*) FROM leads
WHERE created_at < NOW() - INTERVAL '3 years'
AND contact_name != 'ANONYMIZED';
```

---

## 🔧 Astuces

### Recherche dans les leads

```sql
-- Rechercher par téléphone
SELECT * FROM leads WHERE contact_phone LIKE '%0612%';

-- Rechercher par nom
SELECT * FROM leads WHERE contact_name ILIKE '%dupont%';

-- Leads par site
SELECT * FROM leads WHERE site_id = 'douche-pmr-fr';
```

### Export CSV

```sql
COPY (
    SELECT site_id, contact_name, contact_phone, quiz_score, lead_temperature, created_at
    FROM leads
    WHERE created_at > NOW() - INTERVAL '30 days'
) TO '/tmp/leads.csv' WITH CSV HEADER;
```

### Stats avancées

```sql
-- Leads par jour (30 derniers jours)
SELECT
    DATE(created_at) as date,
    COUNT(*) as total,
    AVG(quiz_score) as avg_score,
    COUNT(CASE WHEN lead_temperature = 'HOT' THEN 1 END) as hot,
    COUNT(CASE WHEN lead_temperature = 'WARM' THEN 1 END) as warm,
    COUNT(CASE WHEN lead_temperature = 'COLD' THEN 1 END) as cold
FROM leads
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 📚 Référence

- **Backend** : [api/README.md](api/README.md)
- **Quick Start** : [QUICK_START.md](QUICK_START.md)
- **Architecture** : [ARCHITECTURE.md](ARCHITECTURE.md)
- **Plan** : [.claude/plans/linked-bubbling-brooks.md](.claude/plans/linked-bubbling-brooks.md)

---

**Bon courage ! 🚀**
