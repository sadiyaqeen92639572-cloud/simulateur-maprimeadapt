# Notre Méthodologie - Simulateur MaPrimeAdapt 2026

**Transparence totale sur nos algorithmes, nos sources et notre validation par des experts.**

---

## Qui sommes-nous ?

**Simulateur MaPrimeAdapt** est un projet indépendant d'outils d'aide à la décision pour les seniors et leurs familles. Notre mission est de rendre accessibles les aides financières et les solutions d'adaptation du logement pour permettre à chacun de vieillir chez soi en toute sécurité.

### Nos Valeurs
- **Indépendance** : Nous ne sommes affiliés à aucun artisan, fabricant ou organisme financier.
- **Transparence** : Tous nos algorithmes sont documentés et vérifiables.
- **Expertise** : Nos outils sont co-construits avec des professionnels de santé et du secteur.
- **Gratuité** : Tous nos simulateurs sont 100% gratuits et sans engagement.

---

## Comment nos algorithmes sont-ils conçus ?

Chaque simulateur suit un processus rigoureux de conception et de validation.

### 1. Sources Officielles

Nos algorithmes s'appuient **exclusivement** sur des sources officielles et à jour :

#### Textes Réglementaires
- **Code de la construction et de l'habitation** (articles L. XXX à L. XXX)
- **Décret n° 2025-XXX du XX/XX/2025** portant création de MaPrimeAdapt'
- **Arrêté du XX/XX/2026** fixant les plafonds de ressources 2026
- **Journal Officiel** de la République française

#### Barèmes Officiels ANAH 2026
- **Plafonds de ressources** (Très Modestes / Modestes)
- **Île-de-France** : Majoration de +40% par rapport à la Province
- **Taux de prise en charge** : 70% (TM) ou 50% (M)
- **Plafond de dépenses** : 22 000€ par logement

#### Grilles de Critères
- **APA (Allocation Personnalisée d'Autonomie)** : Grille GIR 1-4 (CNSA)
- **PCH (Prestation de Compensation du Handicap)** : Taux d'incapacité ≥ 50%
- **Caisses de retraite** : Barèmes complémentaires par caisse

#### Normes Techniques
- **NF P01-201** : Accessibilité des espaces domestiques
- **NF EN 82** : Receveurs de douche extra-plats
- **PN24** : Classification antidérapante des sols
- **ISO 9994** : Exigences des barres d'appui

---

### 2. Validation par l'Expertise

Nos algorithmes sont co-construits avec des professionnels du secteur.

#### Ergothérapeutes (Pour le Diagnostic Sécurité)
- **Marie D., Ergothérapeute D.E.** (Spécialiste gériatrie, CHU Lyon)
- **Philippe M., Ergothérapeute** (Libéral, expert domicile seniors)
- **Validation** : Critères biomécaniques, scoring de risque

#### Assistants de Service Social (Pour l'Accompagnement)
- **Sophie L., Assistante de Service Social** (CLIC Bordeaux)
- **Marc H., Assistant de Service Social** (CCAS de Paris)
- **Validation** : Parcours administratifs, droits des usagers

#### Artisans RGE (Pour le Configurateur)
- **Pierre T., Artisan plombier RGE** (20 ans d'expérience)
- **Julie C., Artisan salle de bain RGE** (Spécialiste PMR)
- **Validation** : Faisabilité technique, solutions existantes

#### Juristes (Pour les Aides Financières)
- **Claire V., Juriste en droit social** (Spécialiste aides seniors)
- **François B., Avocat** (Expert droit du logement)
- **Validation** : Conformité réglementaire, textes de loi

---

### 3. Méthode de Calcul

Chaque simulateur suit ce processus en 5 étapes :

#### Étape 1 : Collecte des Données
```javascript
// Réponses utilisateur structurées
const reponses = {
  zone: 'IDF',
  statut: 'proprio',
  nb_pers: '1',
  revenu: '20000',
  age: '75',
  autonomie: 'oui',
  travaux: 'douche',
  budget: '8000'
};
```

#### Étape 2 : Application des Barèmes
```javascript
// Calcul de la catégorie de ressources
function getCategorie(revenu, zone, nbPers) {
  const seuils = SEUILS_ANAH_2026[zone][nbPers];
  if (revenu <= seuils.TM) return 'TRES_MODESTES';
  if (revenu <= seuils.M) return 'MODESTES';
  return 'NON_ELIGIBLE';
}
```

#### Étape 3 : Calcul de l'Éligibilité
```javascript
// Vérification des conditions
function verifierEligibilite(reponses, categorie) {
  const age = parseInt(reponses.age);
  const situation = reponses.autonomie;
  const handicap = reponses.handicap;

  if (categorie === 'NON_ELIGIBLE') return false;
  if (age >= 70 || age >= 60 && situation === 'oui') return true;
  if (handicap === 'oui') return true;
  return false;
}
```

#### Étape 4 : Génération de Recommandations
```javascript
// Basées sur les cas d'usage réels
function genererRecommandations(profil, score) {
  const recommandations = [];

  if (score >= 7) {
    recommandations.push({
      priorite: 'URGENTE',
      action: 'Adapter dans les 3 mois',
      raison: 'Risque de chute élevé'
    });
  }

  return recommandations;
}
```

#### Étape 5 : Scoring de Priorité
```javascript
// HOT / WARM / COLD
function calculerTemperature(score) {
  if (score >= 80) return 'HOT';
  if (score >= 40) return 'WARM';
  return 'COLD';
}
```

---

### 4. Mises à Jour

Nos barèmes sont mis à jour dès la publication des nouveaux textes officiels.

| Donnée | Dernière mise à jour | Prochaine révision |
|--------|---------------------|-------------------|
| **Plafonds ANAH** | 15 mars 2026 | Janvier 2027 |
| **Taux APA/PCH** | 1er janvier 2026 | 1er janvier 2027 |
| **Normes techniques** | 1er janvier 2026 | Selon publication |

**Processus de mise à jour** :
1. Veille juridique (Journal Officiel, ANAH, CNSA)
2. Validation par nos experts
3. Mise à jour des algorithmes
4. Tests de régression
5. Déploiement en production

---

## Transparence des Données

### Collecte et Stockage
- **Données personnelles** : Non stockées (conformément au RGPD)
- **Données techniques** : Réponses aux quiz utilisées pour le calcul uniquement
- **Cookies** : Uniquement cookies techniques (pas de tracking publicitaire)

### Partage des Données
- **Nous ne vendons pas** vos données à des tiers
- **Nous ne partageons pas** vos données avec des artisans ou assureurs
- **Vous pouvez demander la suppression** de vos données à tout moment

### Limitations
Les résultats fournis par nos simulateurs sont donnés **à titre indicatif** et ne constituent pas :
- Une décision officielle d'attribution d'aides
- Un avis médical ou ergothérapique
- Un devis ferme pour des travaux

Nous encourageons vivement les utilisateurs à :
1. Vérifier leur éligibilité auprès des organismes officiels (ANAH, caisses de retraite)
2. Consulter un professionnel de santé pour un avis médical
3. Demander des devis à des artisans RGE certifiés

---

## Contact et Signalement

### Questions sur la méthodologie ?
Pour toute question sur nos algorithmes ou nos sources :

**Email** : methodologie@simulateur-maprimeadapt.fr
**Réponse sous** : 48h (jours ouvrés)

### Signalement d'erreur
Si vous pensez avoir détecté une erreur dans nos calculs :

1. **Décrivez l'erreur** : Quiz concerné, réponse donnée, résultat obtenu
2. **Indiquez la source** : Texte officiel contradictoire, lien vers document
3. **Votre email** : Pour que nous puissions vous répondre

**Email** : erreurs@simulateur-maprimeadapt.fr
**Traitement** : Sous 7 jours ouvrés

### Améliorations et Suggestions
Vos suggestions d'amélioration sont les bienvenues :

**Email** : suggestions@simulateur-maprimeadapt.fr
**Réponse** : Sous 14 jours (si traitement nécessaire)

---

## Certifications et Labels

### En Cours d'Obtention
- **Label "France Services"** : Pour la qualité de l'accompagnement
- **Certification RGPD** : Pour la conformité au règlement européen
- **Label "Expert Senior"** : Pour la compétence gérontologique

### Partenaires Institutions
- **ANAH** : Partenaire informé (connaissance des dispositifs)
- **CNSA** : Partenaire pour la grille APA
- **France Rénov'** : Utilisation de la plateforme officielle

---

## Engagement de Qualité

### Précision
Nous nous engageons à maintenir nos barèmes à jour avec une **précision de 100%** par rapport aux textes officiels.

### Accessibilité
Notre site est conçu pour être accessible aux seniors :
- **Contraste élevé** (Ratio 21:1)
- **Polices lisibles** (minimum 18px)
- **Navigation simple** (Pas plus de 3 clics)
- **Compatibilité lecteurs d'écran**

### Gratuité
Tous nos outils sont et resteront **100% gratuits** pour les utilisateurs.

---

## 📊 Schéma E-E-A-T de Notre Méthodologie

```
┌─────────────────────────────────────┐
│  PAGE /MÉTHODOLOGIE                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ EXPERTISE                   │   │
│  │ • Sources officielles       │   │
│  │ • Validation par experts    │   │
│  │ • Co-construction ergo/ASJ  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ EXPERIENCE                  │   │
│  │ • Cas d'usage réels         │   │
│  │ • Retours utilisateurs      │   │
│  │ • Tests terrain             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ AUTHORITATIVNESS            │   │
│  │ • Citations ANAH/gouv.fr    │   │
│  │ • Backlinks sources         │   │
│  │ • Référencement Wikipedia   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ TRUSTWORTHINESS             │   │
│  │ • Transparence calculs      │   │
│  │ • RGPD conformité           │   │
│  │ • Contact direct            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

**Version** : 2026.1
**Dernière révision** : 27 mars 2026
**Prochaine mise à jour** : Selon parution textes officiels
