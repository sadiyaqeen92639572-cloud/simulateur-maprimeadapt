import { Calculator, ShieldAlert, Bath, Clock, ClipboardList, Home, AlertCircle, ShieldCheck } from 'lucide-react';

export type Answer = {
  id: string;
  label: string;
  score?: number;
  value?: string;
};

export type Question = {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'single' | 'multiple';
  answers: Answer[];
};

export type QuizResult = {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  details: string[];
  leadScore?: number;
  leadTemperature?: 'HOT' | 'WARM' | 'COLD';
  relatedQuiz?: string; // ID of a recommended next quiz
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  questions: Question[];
  calculateResult: (answers: Record<string, any>) => QuizResult;
};

export const quizzes: Quiz[] = [
  {
    id: 'aides-cumulables',
    title: "Simulateur Cumul Aides 2026",
    description: "Calculez le cumul réel (MaPrimeAdapt' + APA + Caisse de Retraite + Crédit d'impôt) pour minimiser votre reste à charge.",
    icon: Calculator,
    color: 'bg-blue-500',
    questions: [
      {
        id: 'zone',
        title: "Où se situe votre logement principal ?",
        answers: [
          { id: 'z1', label: "Île-de-France", value: 'IDF' },
          { id: 'z2', label: "Autre région (province)", value: 'province' }
        ]
      },
      {
        id: 'status',
        title: "Vous êtes...",
        answers: [
          { id: 's1', label: "Propriétaire occupant", value: 'proprio' },
          { id: 's2', label: "Locataire (parc privé ou social)", value: 'locataire' }
        ]
      },
      {
        id: 'nb_pers',
        title: "Nombre de personnes dans le foyer ?",
        answers: [
          { id: 'n1', label: "1 personne", value: '1' },
          { id: 'n2', label: "2 personnes", value: '2' },
          { id: 'n3', label: "3 personnes ou plus", value: '3' }
        ]
      },
      {
        id: 'revenu',
        title: "Revenu fiscal de référence du foyer ?",
        answers: [
          { id: 'r1', label: "Très modeste (ex: < 18k€ en province)", value: 'tres_modeste' },
          { id: 'r2', label: "Modeste (ex: 18k - 23k€)", value: 'modeste' },
          { id: 'r3', label: "Intermédiaire / Supérieur", value: 'autre' }
        ]
      },
      {
        id: 'apa',
        title: "Bénéficiez-vous de l'APA (GIR 1 à 4) ?",
        answers: [
          { id: 'apa1', label: "Oui", value: 'oui' },
          { id: 'apa2', label: "Non", value: 'non' },
          { id: 'apa3', label: "Demande en cours", value: 'en_cours' }
        ]
      },
      {
        id: 'retraite',
        title: "Êtes-vous rattaché à une caisse de retraite (Agirc-Arrco, Carsat...) ?",
        answers: [
          { id: 'ret1', label: "Oui", value: 'oui' },
          { id: 'ret2', label: "Non", value: 'non' }
        ]
      }
    ],
    calculateResult: (answers) => {
      let aides_totales = 0;
      const details = [];
      const isModeste = answers.revenu === 'modeste' || answers.revenu === 'tres_modeste';

      if (isModeste && answers.status === 'proprio') {
        const taux = answers.revenu === 'tres_modeste' ? 0.7 : 0.5;
        const base = 8000;
        const mpa = base * taux;
        aides_totales += mpa;
        details.push(`✅ MaPrimeAdapt' : ${Math.round(mpa)}€ estimé (${taux * 100}% du projet).`);
      }

      if (answers.apa === 'oui' || answers.apa === 'en_cours') {
        const apa_estim = 1200;
        aides_totales += apa_estim;
        details.push(`✅ APA (GIR 1-4) : Cumul possible (~${apa_estim}€ en moyenne pour la douche).`);
      }

      if (answers.retraite === 'oui' && isModeste) {
        const ret_estim = 800;
        aides_totales += ret_estim;
        details.push(`✅ Aide Caisse de Retraite : Jusqu'à ${ret_estim}€ cumulables.`);
      }

      if (answers.revenu === 'autre') {
        const ci = 5000 * 0.25;
        aides_totales += ci;
        details.push(`✅ Crédit d'impôt (25%) : Mobilisable si non éligible à MaPrimeAdapt'.`);
      }

      details.push(`👉 Total des aides cumulées : environ ${Math.round(aides_totales)}€.`);
      details.push("⚠️ Les aides sont soumises à la validation d'un ergothérapeute et d'un AMO.");

      return {
        title: "Bilan Cumul Aides 2026",
        description: `Vous pouvez cumuler jusqu'à ${Math.round(aides_totales)}€ d'aides pour vos travaux.`,
        type: aides_totales > 2000 ? 'success' : 'info',
        details: details,
        leadScore: aides_totales > 4000 ? 90 : 50,
        leadTemperature: aides_totales > 4000 ? 'HOT' : 'WARM',
        relatedQuiz: 'prix-net-final'
      };
    }
  },
  {
    id: 'prix-net-final',
    title: "Quel prix pour ma douche APRES aides ?",
    description: "Passez du prix catalogue au prix réel. Calculez votre reste à charge final après déduction de toutes les subventions.",
    icon: Bath,
    color: 'bg-emerald-500',
    questions: [
      {
        id: 'projet_type',
        title: "Type de projet envisagé ?",
        answers: [
          { id: 'pt1', label: "Standard (Baignoire -> Douche)", value: 'standard' },
          { id: 'pt2', label: "Complet (Douche + WC + Sols)", value: 'complet' },
          { id: 'pt3', label: "Luxe (Matériaux premium + Design)", value: 'luxe' }
        ]
      },
      {
        id: 'revenu_cat',
        title: "Votre catégorie de revenus ?",
        answers: [
          { id: 'rc1', label: "Très Modestes", value: 'TM' },
          { id: 'rc2', label: "Modestes", value: 'M' },
          { id: 'rc3', label: "Intermédiaires / Hauts", value: 'H' }
        ]
      },
      {
        id: 'autonomie_gir',
        title: "Niveau d'autonomie ?",
        answers: [
          { id: 'ag1', label: "GIR 1 à 4 (Perte d'autonomie)", value: 'GIR14' },
          { id: 'ag2', label: "GIR 5 à 6 (Autonome)", value: 'GIR56' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const prix_public = answers.projet_type === 'standard' ? 6500 : answers.projet_type === 'complet' ? 9500 : 14000;
      let aides = 0;
      if (answers.revenu_cat === 'TM') aides = prix_public * 0.7;
      else if (answers.revenu_cat === 'M') aides = prix_public * 0.5;
      else if (answers.autonomie_gir === 'GIR14') aides = 1500;
      const reste_a_charge = prix_public - aides;
      return {
        title: "Votre Devis Net Estimé",
        description: `Pour un projet à ${prix_public}€, votre reste à charge tombe à ${Math.round(reste_a_charge)}€ après aides.`,
        type: 'success',
        details: [
          `Prix catalogue estimé : ${prix_public}€`,
          `Total subventions déduites : -${Math.round(aides)}€`,
          `💳 Reste à payer : ${Math.round(reste_a_charge)}€`,
          "✅ Financement possible en 3x ou 4x sans frais sur le reste à charge."
        ],
        leadScore: 85,
        leadTemperature: 'HOT',
        relatedQuiz: 'configurateur-douche'
      };
    }
  },
  {
    id: 'bilan-clinique-securite',
    title: "Bilan Clinique Sécurité SDB",
    description: "Diagnostic médicalisé de votre salle de bain : évaluez vos risques de chute en 13 points cliniques clés.",
    icon: ShieldAlert,
    color: 'bg-rose-500',
    questions: [
      {
        id: 'q1_marche',
        title: "Hauteur de la marche pour entrer dans la douche/baignoire ?",
        answers: [
          { id: 'q1a', label: "Plus de 15 cm (Risque Critique)", score: 4 },
          { id: 'q1b', label: "Entre 5 et 15 cm (Risque Modéré)", score: 2 },
          { id: 'q1c', label: "Moins de 5 cm / Plain-pied", score: 0 }
        ]
      },
      {
        id: 'q2_maintien',
        title: "Barres de maintien disponibles ?",
        answers: [
          { id: 'q2a', label: "Aucune (Risque de chute accru)", score: 3 },
          { id: 'q2b', label: "Une seule", score: 1 },
          { id: 'q2c', label: "Conforme (Douche + WC + Sortie)", score: 0 }
        ]
      },
      {
        id: 'q3_chutes',
        title: "Historique de chutes (12 derniers mois) ?",
        answers: [
          { id: 'q3a', label: "Plusieurs chutes", score: 5 },
          { id: 'q3b', label: "Une seule chute", score: 3 },
          { id: 'q3c', label: "Aucune", score: 0 }
        ]
      }
    ],
    calculateResult: (answers) => {
      let score = 0;
      if (answers.q1_marche === 'q1a') score += 4;
      if (answers.q1_marche === 'q1b') score += 2;
      if (answers.q2_maintien === 'q2a') score += 3;
      if (answers.q2_maintien === 'q2b') score += 1;
      if (answers.q3_chutes === 'q3a') score += 5;
      if (answers.q3_chutes === 'q3b') score += 3;
      const intensity = score >= 8 ? 'CRITIQUE' : score >= 4 ? 'ALERTE' : 'STABLE';
      const type = score >= 4 ? 'warning' : 'success';
      return {
        title: `Bilan : État ${intensity}`,
        description: `Votre score clinique est de ${score}/12. Une intervention est préconisée.`,
        type: type,
        details: [
          score >= 8 ? "🔴 URGENCE : Votre installation actuelle présente un danger immédiat." : "🟡 PRÉVENTION : Votre installation doit être sécurisée pour anticiper une chute.",
          "👉 Recommandation : Pose d'un receveur extra-plat PN18 et barres d'appui contrastées.",
          "✅ MaPrimeAdapt' peut financer jusqu'à 70% de cette mise aux normes."
        ],
        leadScore: score * 10,
        leadTemperature: score >= 8 ? 'HOT' : 'WARM',
        relatedQuiz: 'aides-cumulables'
      };
    }
  },
  {
    id: 'dossier-refuse-troubleshooter',
    title: "Pourquoi mon dossier Anah a été refusé ?",
    description: "Analyse des causes de rejet MaPrimeAdapt' et plan d'action pour débloquer vos aides financières.",
    icon: AlertCircle,
    color: 'bg-red-600',
    questions: [
      {
        id: 'refus_cause',
        title: "Motif du refus invoqué ?",
        answers: [
          { id: 'c1', label: "Dossier incomplet", value: 'incomplet' },
          { id: 'c2', label: "Conditions de ressources non remplies", value: 'ressources' },
          { id: 'c3', label: "Logement moins de 15 ans", value: 'age_logement' },
          { id: 'c4', label: "Autre / Je ne sais pas", value: 'autre' }
        ]
      },
      {
        id: 'amo_presence',
        title: "Étiez-vous accompagné par un AMO ?",
        answers: [
          { id: 'amo1', label: "Oui, un AMO habilité", value: 'oui' },
          { id: 'amo2', label: "Non, j'ai fait seul", value: 'non' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const details = [];
      if (answers.refus_cause === 'incomplet') details.push("📍 Action : Vérifiez la liste des pièces. Souvent, c'est l'attestation de l'AMO ou le devis RGE qui pose problème.");
      else if (answers.refus_cause === 'age_logement') details.push("📍 Verdict : MaPrimeAdapt' exige un logement de plus de 15 ans. Utilisez le Crédit d'Impôt à 25% à la place.");
      if (answers.amo_presence === 'non') details.push("💡 Important : L'accompagnement AMO est OBLIGATOIRE. Son absence cause 40% des refus.");
      details.push("👉 Solution : Nous pouvons mandater un expert pour auditer votre dossier et lancer un recours gracieux.");
      return {
        title: "Plan de Recours Personnalisé",
        description: "Votre dossier est bloqué mais des solutions existent.",
        type: 'info',
        details: details,
        leadScore: 95,
        leadTemperature: 'HOT',
        relatedQuiz: 'normes-techniques-pmr'
      };
    }
  },
  {
    id: 'normes-techniques-pmr',
    title: "Mon projet respecte-t-il les normes PMR 2026 ?",
    description: "Vérification technique des dimensions (fauteuil roulant, giration, hauteurs) pour une douche 100% conforme.",
    icon: ShieldCheck,
    color: 'bg-indigo-600',
    questions: [
      {
        id: 'giration',
        title: "Espace de rotation disponible dans la SDB ?",
        answers: [
          { id: 'g1', label: "Cercle de 1,50 m libre", value: 'conforme' },
          { id: 'g2', label: "Moins de 1,50 m", value: 'non_conforme' }
        ]
      },
      {
        id: 'receveur_dim',
        title: "Dimensions du receveur ?",
        answers: [
          { id: 'rd1', label: "120 x 90 cm (ou plus)", value: 'conforme' },
          { id: 'rd2', label: "Moins de 120 x 90 cm", value: 'non_conforme' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const isConforme = answers.giration === 'conforme' && answers.receveur_dim === 'conforme';
      return {
        title: isConforme ? "Projet Techniquement Conforme" : "Points de Non-Conformité Détectés",
        description: isConforme ? "Votre projet respecte les normes d'accessibilité 2026." : "Attention, certaines dimensions bloqueront l'obtention des aides.",
        type: isConforme ? 'success' : 'warning',
        details: [
          answers.giration === 'non_conforme' ? "❌ Espace de giration insuffisant (1,50m obligatoire pour fauteuil)." : "✅ Espace de giration OK.",
          answers.receveur_dim === 'non_conforme' ? "❌ Receveur trop petit (120x90cm minimum pour PMR)." : "✅ Dimensions receveur OK.",
          "👉 Note : Un écart de 2cm sur le ressaut peut entraîner un refus de subvention."
        ],
        leadScore: 70,
        leadTemperature: 'WARM',
        relatedQuiz: 'configurateur-douche'
      };
    }
  },
  {
    id: 'configurateur-douche',
    title: "Trouver la douche idéale pour MA situation",
    description: "Découvrez en 7 questions la configuration de douche la plus adaptée à votre mobilité, votre salle de bain et votre style.",
    icon: Bath,
    color: 'bg-emerald-500',
    questions: [
      {
        id: 'q_espace',
        title: "Comment décririez-vous l'espace de votre salle de bain actuelle ?",
        answers: [
          { id: 'esp1', label: "Petite et étroite", value: 'petite' },
          { id: 'esp2', label: "Moyenne", value: 'moyenne' },
          { id: 'esp3', label: "Grande et spacieuse", value: 'grande' }
        ]
      },
      {
        id: 'q_existant',
        title: "Que souhaitez-vous remplacer ?",
        answers: [
          { id: 'ex1', label: "Une baignoire classique", value: 'baignoire' },
          { id: 'ex2', label: "Une petite cabine de douche", value: 'douche' },
          { id: 'ex3', label: "Création d'un nouvel espace (rien à remplacer)", value: 'rien' }
        ]
      },
      {
        id: 'q_mobilite',
        title: "Comment vous déplacez-vous au quotidien ?",
        answers: [
          { id: 'mob1', label: "Totalement seul(e)", value: 'seul' },
          { id: 'mob2', label: "Avec une canne", value: 'canne' },
          { id: 'mob3', label: "Avec un déambulateur", value: 'deambulateur' },
          { id: 'mob4', label: "En fauteuil roulant", value: 'fauteuil' }
        ]
      },
      {
        id: 'q_toilette',
        title: "Comment préférez-vous faire votre toilette ?",
        answers: [
          { id: 'toi1', label: "Debout en autonomie", value: 'debout' },
          { id: 'toi2', label: "Assis(e) pour plus de confort", value: 'assis' },
          { id: 'toi3', label: "J'ai besoin de l'aide d'un proche ou d'un soignant", value: 'aidant' }
        ]
      },
      {
        id: 'q_priorite',
        title: "Quelle est votre priorité absolue pour ce projet ?",
        answers: [
          { id: 'pri1', label: "La sécurité avant tout", value: 'securite' },
          { id: 'pri2', label: "L'esthétique et le design", value: 'esthetique' },
          { id: 'pri3', label: "La facilité d'entretien", value: 'entretien' },
          { id: 'pri4', label: "Le respect d'un budget serré", value: 'budget' }
        ]
      },
      {
        id: 'q_sensibilite',
        title: "Avez-vous des sensibilités particulières sous la douche ?",
        answers: [
          { id: 'sen1', label: "Peur de glisser", value: 'glissade' },
          { id: 'sen2', label: "Crainte des brûlures ou de l'eau froide", value: 'brulure' },
          { id: 'sen3', label: "Besoin de repères visuels clairs", value: 'visuel' },
          { id: 'sen4', label: "Aucune", value: 'aucune' }
        ]
      },
      {
        id: 'q_style',
        title: "Quel style d'aménagement correspond le mieux à vos envies ?",
        answers: [
          { id: 'sty1', label: "Design et moderne avec accessoires invisibles", value: 'moderne' },
          { id: 'sty2', label: "Classique et rassurant", value: 'classique' },
          { id: 'sty3', label: "100% fonctionnel et médicalisé", value: 'medical' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const { q_espace, q_mobilite, q_toilette, q_priorite, q_sensibilite, q_style } = answers;
      let packName = "Pack Zen Discret";
      let type: 'success' | 'warning' | 'info' = 'success';
      if (q_toilette === 'aidant') {
        packName = "Pack Sécurité Maximale (Spécial Aidant)";
        type = 'info';
      } else if (q_style === 'moderne' && q_priorite === 'esthetique') {
        packName = "Pack Confort & Design";
      } else if (q_style === 'medical' || q_priorite === 'securite') {
        packName = "Pack 100% Fonctionnel";
      }
      const espaceText = q_espace === 'petite' ? 'petite' : q_espace === 'moyenne' ? 'moyenne' : 'spacieuse';
      const mobiliteText = q_mobilite === 'seul' ? 'seul' : q_mobilite === 'canne' ? 'avec une canne' : q_mobilite === 'deambulateur' ? 'avec un déambulateur' : 'en fauteuil roulant';
      const prioriteText = q_priorite === 'securite' ? 'la sécurité' : q_priorite === 'esthetique' ? "l'esthétique" : q_priorite === 'entretien' ? "l'entretien" : 'au budget';
      const summary = `Pour votre salle de bain plutôt ${espaceText}, avec un usage ${mobiliteText} et une priorité à ${prioriteText}, nous recommandons :`;
      const details = [summary];
      if (q_mobilite === 'fauteuil') {
        details.push("✅ Receveur : Encastré (zéro ressaut) avec zone de giration de 1,50m.");
      } else {
        details.push("✅ Receveur : Extra-plat antidérapant (PN24 minimum).");
      }
      if (q_toilette === 'aidant') {
        details.push("✅ Parois : Mi-hauteur (portes pivotantes) pour faciliter l'intervention d'un soignant sans l'éclabousser.");
      } else if (q_espace === 'petite') {
        details.push("✅ Parois : Coulissantes ou pliantes pour un gain de place maximal.");
      } else {
        details.push("✅ Parois : Grande paroi fixe en verre Sécurit (Walk-in) avec traitement anti-calcaire.");
      }
      if (q_toilette === 'assis' || q_toilette === 'aidant') {
        if (q_style === 'moderne') {
          details.push("✅ Assise : Siège rabattable design et discret (fixation murale invisible).");
        } else {
          details.push("✅ Assise : Siège ergonomique avec accoudoirs et dossier pour un maintien optimal.");
        }
      } else {
        details.push("✅ Assise : Barre de maintien verticale (station debout privilégiée).");
      }
      if (q_sensibilite === 'brulure') {
        details.push("✅ Robinetterie : Mitigeur thermostatique corps froid anti-brûlure.");
      } else if (q_sensibilite === 'visuel') {
        details.push("✅ Robinetterie : Modèle ergonomique avec repères de couleurs très contrastés.");
      } else {
        details.push("✅ Robinetterie : Colonne de douche ergonomique facile à manipuler.");
      }
      if (q_style === 'moderne') {
        details.push("✅ Accessoires : Barres d'appui design (finition chromée ou noire) intégrées, faisant office de porte-serviettes.");
      } else {
        details.push("✅ Accessoires : Barres d'appui classiques contrastées pour une préhension optimale et sécurisante.");
      }
      let leadScore = 0;
      if (answers.q_existant === 'baignoire') leadScore += 30;
      if (answers.q_existant === 'douche') leadScore += 10;
      if (q_mobilite === 'fauteuil' || q_mobilite === 'deambulateur') leadScore += 30;
      if (q_toilette === 'aidant') leadScore += 20;
      if (q_priorite === 'securite') leadScore += 20;
      const leadTemperature = leadScore >= 70 ? 'HOT' : leadScore >= 40 ? 'WARM' : 'COLD';
      return {
        title: packName,
        description: "Voici la configuration idéale générée par notre algorithme en fonction de vos habitudes de vie :",
        type: type,
        details: details,
        leadScore,
        leadTemperature,
        relatedQuiz: 'timing-travaux'
      };
    }
  },
  {
    id: 'timing-travaux',
    title: "Quel est le meilleur moment pour faire mes travaux ?",
    description: "Découvrez en 6 questions si vous devez adapter votre salle de bain maintenant ou plus tard, et les impacts financiers.",
    icon: Clock,
    color: 'bg-purple-500',
    questions: [
      {
        id: 't_age',
        title: "Quel est votre âge actuel ?",
        answers: [
          { id: 'ta1', label: "Moins de 65 ans", value: 'moins_65' },
          { id: 'ta2', label: "Entre 65 et 75 ans", value: '65_75' },
          { id: 'ta3', label: "Plus de 75 ans", value: 'plus_75' }
        ]
      },
      {
        id: 't_horizon',
        title: "À quel horizon envisagez-vous ces travaux ?",
        answers: [
          { id: 'th1', label: "Dans l'année", value: '1_an' },
          { id: 'th2', label: "D'ici 3 ans", value: '3_ans' },
          { id: 'th3', label: "D'ici 5 ans ou plus", value: '5_ans' }
        ]
      },
      {
        id: 't_autonomie',
        title: "Quel est votre niveau d'autonomie aujourd'hui ?",
        answers: [
          { id: 'tau1', label: "Totalement autonome", value: 'autonome' },
          { id: 'tau2', label: "Aide légère (ménage, courses)", value: 'aide_legere' },
          { id: 'tau3', label: "Aide quotidienne (toilette, repas)", value: 'aide_quotidienne' }
        ]
      },
      {
        id: 't_chutes',
        title: "Avez-vous un historique de chutes ou d'hospitalisations récentes ?",
        answers: [
          { id: 'tc1', label: "Non, aucune chute", value: 'non' },
          { id: 'tc2', label: "Oui, des petites chutes sans gravité", value: 'chute_legere' },
          { id: 'tc3', label: "Oui, chute avec blessure ou hospitalisation", value: 'hopital' }
        ]
      },
      {
        id: 't_logement',
        title: "Combien de temps comptez-vous rester dans ce logement ?",
        answers: [
          { id: 'tl1', label: "Moins de 3 ans (déménagement prévu)", value: 'moins_3' },
          { id: 'tl2', label: "Entre 3 et 10 ans", value: '3_10' },
          { id: 'tl3', label: "Plus de 10 ans (le plus longtemps possible)", value: 'plus_10' }
        ]
      },
      {
        id: 't_finances',
        title: "Comment anticipez-vous votre capacité financière ?",
        answers: [
          { id: 'tf1', label: "Stable, pas de changement prévu", value: 'stable' },
          { id: 'tf2', label: "Baisse prévue (ex: passage à la retraite imminent)", value: 'baisse_retraite' },
          { id: 'tf3', label: "Déjà à la retraite, revenus fixés", value: 'retraite_fixe' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const { t_chutes, t_autonomie, t_logement, t_finances } = answers;
      let profile = "Prévention intelligente";
      let type: 'success' | 'warning' | 'info' = 'success';
      if (t_chutes === 'hopital' || t_chutes === 'chute_legere' || t_autonomie === 'aide_quotidienne') {
        profile = "Urgence forte";
        type = 'warning';
      } else if (t_logement === 'moins_3') {
        profile = "Projet à maturer (Déménagement)";
        type = 'info';
      }
      const details = [];
      if (profile === "Urgence forte") {
        details.push("⚠️ Au vu de votre historique récent (chutes/aide) et de votre volonté de rester à domicile, repousser les travaux augmente fortement le risque d'accident grave.");
        details.push("✅ L'adaptation de votre salle de bain dès maintenant est fortement recommandée pour sécuriser votre quotidien.");
      } else if (profile === "Projet à maturer (Déménagement)") {
        details.push("💡 Puisque vous prévoyez de déménager d'ici 3 ans, de gros travaux d'adaptation ne sont peut-être pas rentables.");
        details.push("✅ Privilégiez des solutions amovibles (tapis antidérapant, siège de bain, barres à ventouses) en attendant votre futur logement.");
      } else {
        details.push("💡 Vous êtes encore autonome, c'est le moment idéal ! L'installation d'une douche sécurisée aujourd'hui permet d'anticiper la perte d'autonomie sereinement.");
        if (t_finances === 'baisse_retraite') {
          details.push("✅ Faire les travaux avant votre passage à la retraite vous permet de répartir le coût pendant que vos revenus sont encore à leur maximum.");
        }
      }
      details.push("⚠️ Attention aux aides financières : MaPrimeAdapt' et les aides de l'ANAH nécessitent la validation d'un dossier AVANT le début des travaux. Ne pas attendre l'urgence pour constituer votre dossier.");
      let leadScore = 0;
      const { t_horizon } = answers;
      if (t_horizon === '1_an') leadScore += 40;
      if (t_horizon === '3_ans') leadScore += 20;
      if (t_chutes === 'hopital' || t_chutes === 'chute_legere') leadScore += 30;
      if (t_logement === 'plus_10') leadScore += 20;
      if (t_logement === 'moins_3') leadScore -= 50;
      const leadTemperature = leadScore >= 70 ? 'HOT' : leadScore >= 40 ? 'WARM' : 'COLD';
      return {
        title: `Profil : ${profile}`,
        description: "Voici notre analyse sur le meilleur moment pour réaliser vos travaux d'adaptation :",
        type: type,
        details: details,
        leadScore,
        leadTemperature,
        relatedQuiz: 'configurateur-douche'
      };
    }
  },
  {
    id: 'accompagnement-administratif',
    title: "Quel accompagnement administratif est fait pour moi ?",
    description: "En 5 questions, obtenez un plan de démarches administratives personnalisé pour financer vos travaux de salle de bain.",
    icon: ClipboardList,
    color: 'bg-teal-500',
    questions: [
      {
        id: 'ad_ligne',
        title: "Êtes-vous à l'aise avec les démarches en ligne ?",
        answers: [
          { id: 'adl1', label: "Oui, totalement", value: 'oui' },
          { id: 'adl2', label: "Avec l'aide d'un proche", value: 'avec_aide' },
          { id: 'adl3', label: "Pas du tout", value: 'pas_du_tout' }
        ]
      },
      {
        id: 'ad_devis',
        title: "Avez-vous déjà un devis d'un professionnel RGE ?",
        answers: [
          { id: 'add1', label: "Oui, j'ai un devis", value: 'oui' },
          { id: 'add2', label: "Non, pas encore", value: 'non' },
          { id: 'add3', label: "Je suis en train d'en chercher un", value: 'en_cours' }
        ]
      },
      {
        id: 'ad_accompagnement',
        title: "Êtes-vous déjà accompagné par un travailleur social / ergothérapeute / service de retraite ?",
        answers: [
          { id: 'ada1', label: "Oui", value: 'oui' },
          { id: 'ada2', label: "Non", value: 'non' }
        ]
      },
      {
        id: 'ad_aides',
        title: "Avez-vous déjà bénéficié d'aides type MaPrimeRénov', APA, MDPH ?",
        answers: [
          { id: 'adai1', label: "Oui", value: 'oui' },
          { id: 'adai2', label: "Non", value: 'non' }
        ]
      },
      {
        id: 'ad_delegation',
        title: "Comment préférez-vous gérer votre dossier ?",
        answers: [
          { id: 'addel1', label: "Tout gérer moi-même", value: 'seul' },
          { id: 'addel2', label: "Déléguer à un proche", value: 'proche' },
          { id: 'addel3', label: "Déléguer entièrement à un professionnel (mandataire)", value: 'pro' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const { ad_ligne, ad_devis, ad_accompagnement, ad_aides, ad_delegation } = answers;
      const details = [];
      let profile = "Gestion Autonome";
      let type: 'success' | 'warning' | 'info' = 'success';
      if (ad_delegation === 'pro' || ad_ligne === 'pas_du_tout') {
        profile = "Délégation Totale";
        type = 'info';
      } else if (ad_delegation === 'proche' || ad_ligne === 'avec_aide') {
        profile = "Gestion Accompagnée";
      }
      if (ad_devis === 'non' || ad_devis === 'en_cours') {
        details.push("1. Faire venir un professionnel RGE pour un devis et un diagnostic.");
      } else {
        details.push("1. Vous avez déjà un devis RGE, c'est une excellente première étape.");
      }
      details.push("2. Déposer le dossier MaPrimeAdapt' avant tout début de travaux.");
      details.push("3. Contacter votre caisse de retraite pour les aides complémentaires.");
      if (profile === "Délégation Totale") {
        details.push("💡 Vous préférez déléguer ou n'êtes pas à l'aise en ligne ? Nous pouvons monter le dossier pour vous et suivre les aides de A à Z en tant que mandataire administratif.");
      } else if (profile === "Gestion Accompagnée") {
        details.push("💡 Un proche peut vous aider à créer votre compte sur France Rénov' et suivre votre dossier en ligne.");
      } else {
        details.push("💡 Vous êtes à l'aise avec les démarches : vous pouvez créer votre compte vous-même sur la plateforme de l'ANAH et déposer vos pièces justificatives.");
      }
      if (ad_accompagnement === 'oui') {
        details.push("✅ Puisque vous êtes déjà suivi, rapprochez-vous de votre travailleur social ou ergothérapeute, ils pourront faciliter vos démarches.");
      }
      if (ad_aides === 'oui') {
        details.push("✅ Ayant déjà bénéficié d'aides (MaPrimeRénov', APA...), vous avez probablement déjà un compte ou un numéro de dossier, ce qui accélérera la procédure.");
      }
      let leadScore = 0;
      if (ad_devis === 'non' || ad_devis === 'en_cours') leadScore += 30;
      if (ad_devis === 'oui') leadScore -= 20;
      if (ad_delegation === 'pro') leadScore += 30;
      if (ad_ligne === 'pas_du_tout') leadScore += 20;
      const leadTemperature = leadScore >= 60 ? 'HOT' : leadScore >= 30 ? 'WARM' : 'COLD';
      return {
        title: `Parcours : ${profile}`,
        description: "Voici votre plan de démarches administratives personnalisé :",
        type: type,
        details: details,
        leadScore,
        leadTemperature,
        relatedQuiz: 'aides-cumulables'
      };
    }
  },
  {
    id: 'maintien-domicile',
    title: "Ai-je vraiment le droit de rester chez moi en toute sécurité ?",
    description: "En 7 questions, découvrez si votre logement vous permet vraiment de vieillir chez vous... et ce qu'il faut adapter en priorité pour éviter l'EHPAD.",
    icon: Home,
    color: 'bg-orange-500',
    questions: [
      {
        id: 'md_projet',
        title: "Souhaitez-vous rester vivre dans ce logement les prochaines années ?",
        answers: [
          { id: 'mdp1', label: "Moins de 3 ans", value: 'moins_3' },
          { id: 'mdp2', label: "3 à 10 ans", value: '3_10' },
          { id: 'mdp3', label: "Plus de 10 ans", value: 'plus_10' }
        ]
      },
      {
        id: 'md_inquietude',
        title: "Qu'est-ce qui vous inquiète le plus aujourd'hui ?",
        answers: [
          { id: 'mdi1', label: "Tomber dans la salle de bain", value: 'tomber' },
          { id: 'mdi2', label: "Devenir dépendant d'un proche", value: 'dependant' },
          { id: 'mdi3', label: "Devoir partir en établissement", value: 'ehpad' },
          { id: 'mdi4', label: "Le coût des travaux", value: 'cout' }
        ]
      },
      {
        id: 'md_aide_toilette',
        title: "Avez-vous de l'aide pour la toilette ?",
        answers: [
          { id: 'mda1', label: "Non", value: 'non', score: 0 },
          { id: 'mda2', label: "Oui, un proche", value: 'proche', score: 1 },
          { id: 'mda3', label: "Oui, un professionnel (aide à domicile)", value: 'pro', score: 2 }
        ]
      },
      {
        id: 'md_frequence_aide',
        title: "À quelle fréquence avez-vous besoin d'aide pour les gestes du quotidien (s'habiller, se laver, se lever) ?",
        answers: [
          { id: 'mdf1', label: "Jamais ou presque", value: 'jamais', score: 0 },
          { id: 'mdf2', label: "Parfois", value: 'parfois', score: 1 },
          { id: 'mdf3', label: "Tous les jours", value: 'tous_les_jours', score: 2 }
        ]
      },
      {
        id: 'md_sdb_actuelle',
        title: "Comment est équipée votre salle de bain actuelle ?",
        answers: [
          { id: 'mds1', label: "Baignoire classique à enjamber", value: 'baignoire', score: 2 },
          { id: 'mds2', label: "Petite douche avec marche", value: 'douche_marche', score: 1 },
          { id: 'mds3', label: "Douche de plain-pied", value: 'douche_plain_pied', score: 0 }
        ]
      },
      {
        id: 'md_chutes',
        title: "Avez-vous chuté dans votre salle de bain ces 12 derniers mois ?",
        answers: [
          { id: 'mdc1', label: "Non", value: 'non', score: 0 },
          { id: 'mdc2', label: "Oui, une fois", value: 'oui_une', score: 2 },
          { id: 'mdc3', label: "Oui, plusieurs fois", value: 'oui_plusieurs', score: 3 }
        ]
      },
      {
        id: 'md_finances',
        title: "Seriez-vous prêt(e) à investir dans des travaux si cela vous permet de rester chez vous plus longtemps ?",
        answers: [
          { id: 'mdfin1', label: "Oui", value: 'oui' },
          { id: 'mdfin2', label: "Plutôt oui", value: 'plutot_oui' },
          { id: 'mdfin3', label: "Plutôt non", value: 'plutot_non' },
          { id: 'mdfin4', label: "Non", value: 'non' }
        ]
      }
    ],
    calculateResult: (answers) => {
      const { md_projet, md_inquietude, md_aide_toilette, md_frequence_aide, md_sdb_actuelle, md_chutes, md_finances } = answers;
      let score = 0;
      if (md_aide_toilette === 'proche') score += 1;
      if (md_aide_toilette === 'pro') score += 2;
      if (md_frequence_aide === 'parfois') score += 1;
      if (md_frequence_aide === 'tous_les_jours') score += 2;
      if (md_sdb_actuelle === 'douche_marche') score += 1;
      if (md_sdb_actuelle === 'baignoire') score += 2;
      if (md_chutes === 'oui_une') score += 2;
      if (md_chutes === 'oui_plusieurs') score += 3;
      let profile = "Cap sur le maintien à domicile";
      let type: 'success' | 'warning' | 'info' = 'success';
      if (score >= 5 || md_chutes === 'oui_plusieurs' || md_frequence_aide === 'tous_les_jours') {
        profile = "Risque élevé de rupture de domicile";
        type = 'warning';
      } else if (score >= 3 || md_chutes === 'oui_une' || md_aide_toilette !== 'non') {
        profile = "Zone grise : à sécuriser vite";
        type = 'info';
      }
      const details = [];
      if (profile === "Cap sur le maintien à domicile") {
        details.push("✅ Votre souhait est clairement de rester chez vous, et votre niveau d'autonomie le permet encore si vous sécurisez les points critiques (notamment la salle de bain).");
        details.push("💡 Adaptations prioritaires recommandées : remplacer votre équipement actuel par une douche de plain-pied, installer des barres d'appui et un siège anti-glisse.");
        details.push("👉 Pensez à utiliser notre Simulateur d'Aides Financières et notre Diagnostic Sécurité pour affiner votre projet.");
      } else if (profile === "Zone grise : à sécuriser vite") {
        details.push("⚠️ Vous commencez à cumuler des signaux de fragilité (aide pour la toilette, chutes, peur de tomber). Sans adaptation ciblée, le risque de devoir changer de lieu de vie augmente.");
        details.push("💡 Il est fortement conseillé d'adapter la salle de bain dans les 6 à 12 mois.");
        details.push("✅ Chaque chute évitée, c'est un séjour à l'hôpital et un risque d'EHPAD en moins. Demandez un diagnostic gratuit pour évaluer vos aides.");
      } else {
        details.push("⚠️ Au vu de votre niveau d'aide quotidien et des chutes récentes, il devient urgent de sécuriser le logement si vous souhaitez éviter un départ contraint en établissement.");
        details.push("💡 Passez en mode urgence : des travaux prioritaires dans les 3 mois sont nécessaires.");
        details.push("✅ Orientation forte recommandée : sollicitez MaPrimeAdapt' ou l'APA, et faites-vous accompagner par un ergothérapeute et un mandataire administratif pour accélérer les démarches.");
      }
      if (md_inquietude === 'ehpad') {
        details.push("💡 Vous craignez de devoir partir en établissement : l'adaptation du domicile est justement la meilleure alternative pour repousser ou éviter cette issue.");
      } else if (md_inquietude === 'cout') {
        details.push("💡 Le coût vous inquiète : sachez que les aides (jusqu'à 70% avec MaPrimeAdapt') rendent souvent les travaux beaucoup moins chers que quelques mois en maison de retraite.");
      }
      if (md_finances === 'non' || md_finances === 'plutot_non') {
        details.push("💡 Même si vous hésitez à investir, comparez le reste à charge des travaux (souvent minime avec les aides) au coût mensuel d'un EHPAD (en moyenne 2000€ à 3000€/mois).");
      }
      let leadScore = 0;
      if (md_projet === 'plus_10') leadScore += 30;
      if (md_projet === 'moins_3') leadScore -= 50;
      if (md_inquietude === 'ehpad' || md_inquietude === 'tomber') leadScore += 20;
      if (score >= 5) leadScore += 40;
      else if (score >= 3) leadScore += 20;
      if (md_finances === 'oui' || md_finances === 'plutot_oui') leadScore += 20;
      const leadTemperature = leadScore >= 70 ? 'HOT' : leadScore >= 40 ? 'WARM' : 'COLD';
      return {
        title: `Profil : ${profile}`,
        description: "Voici notre analyse sur la viabilité de votre maintien à domicile :",
        type: type,
        details: details,
        leadScore,
        leadTemperature,
        relatedQuiz: 'bilan-clinique-securite'
      };
    }
  }
];
