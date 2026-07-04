-- Extension nécessaire pour crypt() et gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table unique pour tous les sites avec JSONB flexible
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    niche VARCHAR(50) NOT NULL,
    quiz_id VARCHAR(100) NOT NULL,
    quiz_title VARCHAR(255) NOT NULL,

    -- Contact info
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_zip VARCHAR(10),

    -- Lead scoring (déjà implémenté dans frontend)
    quiz_score INTEGER NOT NULL,
    lead_temperature VARCHAR(20) NOT NULL CHECK (lead_temperature IN ('HOT', 'WARM', 'COLD')),

    -- RGPD Compliance
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,

    -- Quiz answers (flexible JSONB pour réponses spécifiques par quiz)
    answers JSONB NOT NULL,

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_site_id CHECK (site_id ~ '^[a-z0-9-]+$')
);

-- Index pour performances
CREATE INDEX idx_leads_site_id ON leads(site_id);
CREATE INDEX idx_leads_niche ON leads(niche);
CREATE INDEX idx_leads_temperature ON leads(lead_temperature);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_quiz_score ON leads(quiz_score);

-- Index JSONB pour requêter dans answers
CREATE INDEX idx_leads_answers ON leads USING GIN(answers);

-- Table pour configurer les sites autorisés
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    site_id VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    niche VARCHAR(50) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer le premier site (douche-pmr)
-- NOTE: Remplacez 'your_secret_api_key_here' par votre vraie clé API secrète
INSERT INTO sites (site_id, site_name, niche, api_key_hash)
VALUES ('douche-pmr-fr', 'Simulateur MaPrimeAdapt - Douche PMR', 'senior-bathroom', crypt('your_secret_api_key_here', gen_salt('bf')));
