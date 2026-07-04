#!/bin/bash

# Script de test pour l'API Leads
# Ce script teste tous les endpoints principaux

echo "🧪 Tests API Leads"
echo "=================="

# Configuration
API_URL="${API_URL:-http://localhost:4000}"
API_KEY="${API_KEY:-your_secret_api_key_here}"

echo ""
echo "📍 API URL: $API_URL"
echo "🔑 API Key: $API_KEY"
echo ""

# Test 1: Health Check
echo "1️⃣  Test Health Check..."
HEALTH_RESPONSE=$(curl -s "$API_URL/api/v1/health")
echo "Réponse: $HEALTH_RESPONSE"
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "✅ Health check OK"
else
    echo "❌ Health check FAILED"
fi
echo ""

# Test 2: Créer un lead
echo "2️⃣  Test Création Lead..."
LEAD_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/leads" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "site_id": "douche-pmr-fr",
    "niche": "senior-bathroom",
    "quiz_id": "test-quiz",
    "quiz_title": "Quiz Test",
    "contact_name": "Test User",
    "contact_phone": "0612345678",
    "contact_zip": "75001",
    "quiz_score": 85,
    "lead_temperature": "HOT",
    "answers": {"test": "data"},
    "consent_given": true,
    "consent_date": "2026-03-26T10:00:00Z"
  }')

echo "Réponse: $LEAD_RESPONSE"
if echo "$LEAD_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Création lead OK"

    # Extraire lead_id
    LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"lead_id":[0-9]*' | grep -o '[0-9]*')
    echo "📋 Lead ID: $LEAD_ID"
else
    echo "❌ Création lead FAILED"
fi
echo ""

# Test 3: Vérifier les stats
echo "3️⃣  Test Statistiques..."
STATS_RESPONSE=$(curl -s "$API_URL/api/v1/leads/stats?site_id=douche-pmr-fr" \
  -H "X-API-Key: $API_KEY")
echo "Réponse: $STATS_RESPONSE"
if echo "$STATS_RESPONSE" | grep -q "success"; then
    echo "✅ Stats OK"
else
    echo "❌ Stats FAILED"
fi
echo ""

# Test 4: Validation des erreurs
echo "4️⃣  Test Validation Erreurs..."
echo "4a. Test sans API Key..."
NO_KEY_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/leads" \
  -H "Content-Type: application/json" \
  -d '{}')
if echo "$NO_KEY_RESPONSE" | grep -q "API Key manquante"; then
    echo "✅ Validation API Key OK"
else
    echo "❌ Validation API Key FAILED"
fi

echo "4b. Test téléphone invalide..."
INVALID_PHONE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/leads" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "site_id": "douche-pmr-fr",
    "niche": "test",
    "quiz_id": "test",
    "quiz_title": "test",
    "contact_name": "Test",
    "contact_phone": "invalid-phone",
    "quiz_score": 50,
    "lead_temperature": "WARM",
    "answers": {},
    "consent_given": true
  }')
if echo "$INVALID_PHONE_RESPONSE" | grep -q "Téléphone invalide"; then
    echo "✅ Validation téléphone OK"
else
    echo "❌ Validation téléphone FAILED"
fi

echo "4c. Test sans consentement RGPD..."
NO_CONSENT_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/leads" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "site_id": "douche-pmr-fr",
    "niche": "test",
    "quiz_id": "test",
    "quiz_title": "test",
    "contact_name": "Test",
    "contact_phone": "0612345678",
    "quiz_score": 50,
    "lead_temperature": "WARM",
    "answers": {},
    "consent_given": false
  }')
if echo "$NO_CONSENT_RESPONSE" | grep -q "Consentement RGPD requis"; then
    echo "✅ Validation RGPD OK"
else
    echo "❌ Validation RGPD FAILED"
fi
echo ""

echo "=================="
echo "🎉 Tests terminés !"
echo ""
echo "📝 Pour vérifier en base de données :"
echo "   psql -U lead_manager -d leads_central -c 'SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;'"
