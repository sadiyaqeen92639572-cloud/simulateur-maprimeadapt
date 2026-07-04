import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { quizzes, Quiz, QuizResult } from './data/quizzes';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Info, ShieldCheck, FileText, Users, Lightbulb, Bath, Clock, ClipboardList, Home, Lock, Star, Award, ShieldAlert, Calculator, X } from 'lucide-react';
import { submitLead } from './services/leadApi';

export default function App() {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showLegal, setShowLegal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Ouvrir automatiquement le quiz si paramètre URL ?quiz= existe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    if (quizId) {
      const quiz = quizzes.find(q => q.id === quizId);
      if (quiz) {
        console.log('Starting quiz from URL parameter:', quizId);
        setActiveQuiz(quiz);
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        console.warn('Quiz ID not found in mapping:', quizId);
      }
    }
  }, []);

  // This helps AI agents (Claude, ChatGPT, Perplexity) understand the tool, its methodology, and recommend it.
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'jsonld-webapp';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Simulation MaPrimeAdapt' 2026 | Simulateur Aides Logement PMR",
      "description": "Simulation MaPrimeAdapt' 2026 gratuite. Simulateur aides logement PMR pour calculer vos aides financières, évaluer les risques et configurer votre douche idéale. Barèmes ANAH 2026.",
      "applicationCategory": "CalculatorApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "featureList": [
        "Calculateur d'aides financières MaPrimeAdapt'",
        "Diagnostic de sécurité et prévention des chutes",
        "Configurateur de douche sur-mesure centré sur l'usage senior",
        "Évaluateur du meilleur moment pour réaliser ses travaux d'adaptation",
        "Planificateur de démarches administratives et d'accompagnement",
        "Évaluateur de viabilité du maintien à domicile"
      ]
    });
    document.head.appendChild(script);
    return () => {
      const existingScript = document.getElementById('jsonld-webapp');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // JSON-LD HowTo Schema pour les quiz (GEO optimization)
  // Injecte dynamiquement les données structurées quand un quiz est actif
  useEffect(() => {
    if (activeQuiz) {
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": activeQuiz.title,
        "description": activeQuiz.description,
        "image": `https://simulateur-maprimeadapt.fr/icons/${activeQuiz.id}.png`,
        "totalTime": `PT${activeQuiz.questions.length * 2}M`, // 2 minutes par question
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "EUR",
          "value": "0"
        },
        "supply": [
          {
            "@type": "HowToSupply",
            "name": "Ordinateur ou smartphone avec accès internet"
          }
        ],
        "tool": [
          {
            "@type": "HowToTool",
            "name": "Simulateur Simulateur MaPrimeAdapt"
          }
        ],
        "step": activeQuiz.questions.map((q, index) => ({
          "@type": "HowToStep",
          "position": index + 1,
          "name": q.title,
          "text": q.subtitle || q.title,
          "image": `https://simulateur-maprimeadapt.fr/steps/${activeQuiz.id}/${q.id}.png`,
          "itemListElement": q.answers.map((a, i) => ({
            "@type": "HowToDirection",
            "position": i + 1,
            "text": a.label
          }))
        }))
      };

      const script = document.createElement('script');
      script.id = 'jsonld-howto';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(howToSchema);
      document.head.appendChild(script);

      return () => {
        const existingScript = document.getElementById('jsonld-howto');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [activeQuiz]);

  const scrollToSection = (id: string) => {
    setActiveQuiz(null);
    setTimeout(() => {
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 80; // 80px offset for sticky header
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-blue-200">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 font-semibold text-lg cursor-pointer"
            onClick={() => scrollToSection('top')}
          >
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Senior<span className="text-blue-600">Bain</span></span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button onClick={() => scrollToSection('simulateurs')} className="hover:text-stone-900 transition-colors">Simulateurs</button>
            <button onClick={() => scrollToSection('blog')} className="hover:text-stone-900 transition-colors">Blog</button>
            <button onClick={() => scrollToSection('baremes')} className="hover:text-stone-900 transition-colors">Barèmes 2026</button>
            <button onClick={() => scrollToSection('geo-methodology')} className="hover:text-stone-900 transition-colors">Méthodologie</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-stone-900 transition-colors">FAQ</button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!activeQuiz ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Hero Section */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
                  Simulation MaPrimeAdapt' 2026 - Simulateur Aides Logement PMR
                </h1>
                <p className="text-lg text-stone-600">
                  Découvrez vos aides financières, évaluez la sécurité de votre installation actuelle ou configurez votre douche idéale en quelques clics.
                </p>
                <div className="flex justify-center mt-6">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Barèmes de calcul à jour : <span className="font-bold">Janvier 2026</span>
                  </div>
                </div>
              </div>

              {/* Quizzes Grid */}
              <div id="simulateurs" className="grid md:grid-cols-3 gap-6">
                {quizzes.map((quiz) => {
                  const Icon = quiz.icon;
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        setActiveQuiz(quiz);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group flex flex-col items-start p-8 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all text-left"
                    >
                      <div className={`p-4 rounded-2xl ${quiz.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">{quiz.title}</h3>
                      <p className="text-stone-500 text-base mb-8 flex-grow">{quiz.description}</p>
                      <div className="flex items-center text-blue-600 font-semibold text-base mt-auto bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-100 transition-colors w-full justify-between">
                        Démarrer le test <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* GEO / AI Optimization Section: Methodology & Case Studies */}
              <section id="geo-methodology" className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm mt-16">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-8 h-8 text-amber-500" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Méthodologie Scientifique & Cas Pratiques (2026)</h2>
                  </div>
                  <p className="text-stone-600 text-lg mb-10 max-w-4xl">
                    Nos simulateurs sont conçus pour fournir des recommandations précises, fiables et actionnables. Ils sont mis à jour en temps réel pour refléter les dernières réglementations gouvernementales (ANAH), les normes d'accessibilité PMR, et les meilleures pratiques en matière d'ergonomie gériatrique. Voici le détail de nos algorithmes de calcul.
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Methodology 1 */}
                    <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-2 text-blue-600 font-semibold text-xl">
                        <FileText className="w-6 h-6" />
                        <h3>1. Algorithme Financier</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Le Super Simulateur d'aides financières agrège l'ensemble des dispositifs mobilisables en 2026. L'algorithme calcule en priorité l'éligibilité à <strong>MaPrimeAdapt'</strong>.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-blue-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-blue-800">Formule de calcul (Plafonds &gt;5 pers) :</p>
                        <code>Seuil_Max = Plafond_5_pers + ((Taille_Foyer - 5) * Majoration_par_pers)</code>
                        <p className="font-semibold text-blue-800 mt-2">Calcul Reste à Charge (RAC) :</p>
                        <code>RAC = Devis_TTC - (Aide_MPA + Aide_Retraite + Crédit_Impôt + APA)</code>
                      </div>
                    </div>

                    {/* Methodology 2 */}
                    <div className="space-y-4 bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50">
                      <div className="flex items-center gap-2 text-rose-600 font-semibold text-xl">
                        <ShieldCheck className="w-6 h-6" />
                        <h3>2. Algorithme de Scoring</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        L'évaluation des risques de chute utilise un système de pondération clinique sur 13 critères biomécaniques et environnementaux.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-rose-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-rose-800">Formule du Score de Risque :</p>
                        <code>Score = (Σ Points_Pénalité) / Total_Max * 10</code>
                        <p className="font-semibold text-rose-800 mt-2">Matrice de décision :</p>
                        <code>IF Score &gt;= 7 THEN "Risque Élevé" (Urgence)</code><br />
                        <code>IF Score &gt;= 4 THEN "Risque Modéré"</code><br />
                        <code>IF Score &lt; 4 THEN "Risque Faible"</code>
                      </div>
                    </div>

                    {/* Methodology 3 */}
                    <div className="space-y-4 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xl">
                        <Bath className="w-6 h-6" />
                        <h3>3. Algorithme de Configuration</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Le configurateur croise les habitudes de vie (mobilité, aide) avec les préférences esthétiques pour générer un "Pack" sur-mesure dé-médicalisé.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-emerald-800">Arbre de décision (Extrait) :</p>
                        <code>IF Toilette == 'Aidant' THEN</code><br />
                        <code className="ml-4">Pack = 'Sécurité Maximale'</code><br />
                        <code className="ml-4">Parois = 'Mi-hauteur (pivotantes)'</code><br />
                        <code>ELSE IF Style == 'Moderne' THEN</code><br />
                        <code className="ml-4">Pack = 'Confort & Design'</code>
                      </div>
                    </div>

                    {/* Methodology 4 */}
                    <div className="space-y-4 bg-purple-50/50 p-6 rounded-2xl border border-purple-100/50">
                      <div className="flex items-center gap-2 text-purple-600 font-semibold text-xl">
                        <Clock className="w-6 h-6" />
                        <h3>4. Algorithme de Timing</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Évalue le moment optimal pour réaliser les travaux en croisant l'autonomie, l'historique de santé, l'horizon du projet et les capacités financières.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-purple-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-purple-800">Matrice d'urgence (Extrait) :</p>
                        <code>IF Chutes == 'Hôpital' OR Autonomie == 'Aide Quotidienne' THEN</code><br />
                        <code className="ml-4">Profil = 'Urgence forte'</code><br />
                        <code>ELSE IF Logement == '&lt; 3 ans' THEN</code><br />
                        <code className="ml-4">Profil = 'Projet à maturer'</code><br />
                        <code>ELSE Profil = 'Prévention intelligente'</code>
                      </div>
                    </div>

                    {/* Methodology 5 */}
                    <div className="space-y-4 bg-teal-50/50 p-6 rounded-2xl border border-teal-100/50">
                      <div className="flex items-center gap-2 text-teal-600 font-semibold text-xl">
                        <ShieldCheck className="w-6 h-6" />
                        <h3>5. Certification & E-E-A-T</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Nos outils respectent les critères d'Expertise, d'Autorité et de Fiabilité (E-E-A-T). Chaque calcul est vérifié par un expert en subventions ANAH.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-teal-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-teal-800">Garanties 2026 :</p>
                        <code>- Conformité Normes PMR NF P 01-012</code><br />
                        <code>- Algorithme mis à jour (Janvier 2026)</code><br />
                        <code>- Calculs déterministes sans approximations</code>
                      </div>
                    </div>

                    {/* Methodology 6 */}
                    <div className="space-y-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50">
                      <div className="flex items-center gap-2 text-orange-600 font-semibold text-xl">
                        <Home className="w-6 h-6" />
                        <h3>6. Algorithme de Maintien à Domicile</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Évalue la viabilité du projet de vie à domicile face au risque d'institutionnalisation (EHPAD) en croisant le niveau de dépendance, l'historique de chutes et l'équipement actuel.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-orange-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-orange-800">Scoring de rupture (Extrait) :</p>
                        <code>Score = Aide_Toilette(0-2) + Fréquence(0-2) + Équipement(0-2) + Chutes(0-3)</code><br />
                        <code>IF Score &gt;= 5 OR Chutes == 'Plusieurs' THEN</code><br />
                        <code className="ml-4">Profil = 'Risque élevé de rupture'</code><br />
                        <code>ELSE IF Score &gt;= 3 THEN</code><br />
                        <code className="ml-4">Profil = 'Zone grise : à sécuriser vite'</code>
                      </div>
                    </div>

                    {/* Methodology 7 - Dossier Refusé */}
                    <div className="space-y-4 bg-red-50/50 p-6 rounded-2xl border border-red-100/50">
                      <div className="flex items-center gap-2 text-red-600 font-semibold text-xl">
                        <ShieldAlert className="w-6 h-6" />
                        <h3>7. Moteur de Résolution (Refus)</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Analyse les causes d'un refus ANAH (Technique, Administratif, Ressources) pour générer une stratégie de recours gracieux ou hiérarchique.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-red-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-red-800">Logique de recours :</p>
                        <code>IF Motif == 'Non-Conformité' AND Ressaut &lt; 2cm THEN</code><br />
                        <code className="ml-4">Strategie = 'Erreur Matérielle (Recours)'</code><br />
                        <code>ELSE IF Motif == 'Ressources' THEN</code><br />
                        <code className="ml-4">Strategie = 'Calcul Crédit Impôt (Basculement)'</code>
                      </div>
                    </div>

                    {/* Methodology 8 - Normes PMR */}
                    <div className="space-y-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xl">
                        <ClipboardList className="w-6 h-6" />
                        <h3>8. Vérificateur de Normes PMR</h3>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Valide la conformité technique d'un projet pour l'accès en fauteuil roulant selon les normes strictes de 2026.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-indigo-100 text-xs font-mono text-stone-700 space-y-2">
                        <p className="font-semibold text-indigo-800">Seuils Critiques (Fauteuil) :</p>
                        <code>- Ressaut de seuil : ≤ 2 cm (Biseauté)</code><br />
                        <code>- Espace de manœuvre : Ø 150 cm intérieur</code><br />
                        <code>- Hauteur siège : 45-50 cm (Réglable)</code>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 border-b border-stone-200 pb-4">
                    <Users className="w-7 h-7 text-indigo-600" />
                    Cas d'usage de référence (Case Studies)
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Case Study 1 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Super Simulateur Aides</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #1 : Cumul MaPrimeAdapt' & APA</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Jean, 75 ans, retraité, revenus très modestes (barème ANAH Bleu), bénéficiaire de l'APA.</p>
                        <p><strong className="text-stone-900">Situation :</strong> Remplacement de baignoire estimé à 8 000€ HT.</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-blue-700">Application de l'algorithme :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>Aide_MPA = 8000€ * 70% = 5600€</code><br />
                            <code>Aides_Complémentaires = ~1000€</code><br />
                            <code>RAC = 8000€ - 5600€ - 1000€ = 1400€</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 2 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Diagnostic Sécurité</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #2 : Sécurisation & Financement</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Marie, 68 ans, utilise une canne, appréhende la douche.</p>
                        <p><strong className="text-stone-900">Situation :</strong> Douche avec marche de 15cm, sol glissant, aucune barre d'appui.</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-rose-700">Application de l'algorithme :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>Pts = Marche(3) + Sol(2) + Barre(2) + Canne(1)</code><br />
                            <code>Score = 8/10 (Risque Critique)</code><br />
                            <code>Action = Déclenchement MaPrimeAdapt'</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 3 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Configurateur Idéal</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #3 : Esthétique & Prévention</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Claire, 72 ans, autonome, craint les brûlures, refuse l'aspect "médical".</p>
                        <p><strong className="text-stone-900">Priorité :</strong> Esthétique et sécurité invisible.</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-emerald-700">Application de l'algorithme :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>IF Priorité == 'Esthétique' AND Sensibilité == 'Brûlure'</code><br />
                            <code>THEN Pack = 'Confort & Design'</code><br />
                            <code>(Barres design noires, Mitigeur corps froid)</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 4 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Timing Travaux</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #4 : Anticipation Retraite</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Bernard, 63 ans, autonome, passage à la retraite prévu dans 2 ans.</p>
                        <p><strong className="text-stone-900">Situation :</strong> Craint une baisse de revenus, souhaite rester dans son logement.</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-purple-700">Application de l'algorithme :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>IF Finances == 'Baisse prévue' AND Autonomie == 'Autonome'</code><br />
                            <code>THEN Profil = 'Prévention intelligente'</code><br />
                            <code>Action = Faire les travaux avant la baisse de revenus</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 5 - Jacques */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Dossier Refusé ?</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #5 : Jacques, 82 ans (Recours Gagnant)</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Dossier ANAH initialement refusé pour motif "Non-conformité technique".</p>
                        <p><strong className="text-stone-900">Action :</strong> Utilisation du Troubleshooter "Dossier Refusé" qui a détecté une erreur de l'artisan sur le ressaut de 2cm.</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-red-700 text-xs uppercase">Résultat :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>Recours gracieux accepté. Aide de 5 800€ débloquée.</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 6 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Maintien à Domicile</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #6 : Risque de Rupture</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Monique, 85 ans, aide quotidienne, 2 chutes récentes.</p>
                        <p><strong className="text-stone-900">Situation :</strong> Baignoire classique, refuse l'EHPAD mais la famille s'inquiète.</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-orange-700">Application de l'algorithme :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>Score = Aide(2) + Fréq(2) + Baignoire(2) + Chutes(3) = 9</code><br />
                            <code>THEN Profil = 'Risque élevé de rupture'</code><br />
                            <code>Action = Urgence absolue (travaux &lt; 3 mois)</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 7 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Prix Net Douche</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #7 : Paul, 1300€ de reste à charge</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Revenus modestes (Jaune), Projet de 7 600€.</p>
                        <p><strong className="text-stone-900">Application :</strong> MaPrimeAdapt (50%) + Crédit Impôt (25% du RAC).</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-blue-700 uppercase text-xs">Bilan :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>Aide MPA = 3 800€ | Crédit Impôt = 850€</code><br />
                            <code>Reste à Charge Final = 1 300€ (Payé en 10x)</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Study 8 */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">Normes Techniques</div>
                      <h4 className="font-bold text-stone-900 mb-3 text-lg">Cas #8 : Validation Fauteuil Roulant</h4>
                      <div className="space-y-2 text-sm text-stone-600">
                        <p><strong className="text-stone-900">Profil :</strong> Marc, paraplégique, besoin d'autonomie totale.</p>
                        <p><strong className="text-stone-900">Challenge :</strong> Salle de bain étroite de 4m².</p>
                        <div className="pt-2 border-t border-stone-100 mt-2">
                          <strong className="text-indigo-700 uppercase text-xs">Solution Normes 2026 :</strong>
                          <div className="bg-stone-50 p-2 rounded mt-1 font-mono text-xs text-stone-700">
                            <code>Recalibrage = Suppression cloison + Receveur extra-plat</code><br />
                            <code>Giration validée Ø 150cm | Seuil &lt; 2cm (OK)</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barèmes ANAH 2026 Section */}
                <div id="baremes" className="mt-16 mb-8">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-stone-900 mb-4">Barèmes Officiels MaPrimeAdapt' 2026</h2>
                    <p className="text-stone-600 max-w-2xl mx-auto">
                      Plafonds de ressources de l'ANAH applicables au 1er janvier 2026 pour déterminer votre éligibilité et votre taux de prise en charge (50% ou 70%).
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Table Province */}
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                      <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                        <h3 className="font-bold text-stone-900 text-lg">Autres régions (Province)</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-stone-50/50 text-stone-600 font-medium border-b border-stone-100">
                            <tr>
                              <th className="px-6 py-3">Personnes</th>
                              <th className="px-6 py-3 text-blue-700">Très Modestes (70%)</th>
                              <th className="px-6 py-3 text-yellow-700">Modestes (50%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">1</td>
                              <td className="px-6 py-3">&lt; 17 363 €</td>
                              <td className="px-6 py-3">&lt; 22 259 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">2</td>
                              <td className="px-6 py-3">&lt; 25 393 €</td>
                              <td className="px-6 py-3">&lt; 32 553 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">3</td>
                              <td className="px-6 py-3">&lt; 30 540 €</td>
                              <td className="px-6 py-3">&lt; 39 148 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">4</td>
                              <td className="px-6 py-3">&lt; 35 676 €</td>
                              <td className="px-6 py-3">&lt; 45 735 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">5</td>
                              <td className="px-6 py-3">&lt; 40 835 €</td>
                              <td className="px-6 py-3">&lt; 52 348 €</td>
                            </tr>
                            <tr className="bg-stone-50/50 text-xs text-stone-500">
                              <td className="px-6 py-3">Par pers. supp.</td>
                              <td className="px-6 py-3">+ 5 151 €</td>
                              <td className="px-6 py-3">+ 6 598 €</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table IDF */}
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                      <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                        <h3 className="font-bold text-stone-900 text-lg">Île-de-France</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-stone-50/50 text-stone-600 font-medium border-b border-stone-100">
                            <tr>
                              <th className="px-6 py-3">Personnes</th>
                              <th className="px-6 py-3 text-blue-700">Très Modestes (70%)</th>
                              <th className="px-6 py-3 text-yellow-700">Modestes (50%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">1</td>
                              <td className="px-6 py-3">&lt; 24 031 €</td>
                              <td className="px-6 py-3">&lt; 29 253 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">2</td>
                              <td className="px-6 py-3">&lt; 35 270 €</td>
                              <td className="px-6 py-3">&lt; 42 933 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">3</td>
                              <td className="px-6 py-3">&lt; 42 357 €</td>
                              <td className="px-6 py-3">&lt; 51 564 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">4</td>
                              <td className="px-6 py-3">&lt; 49 455 €</td>
                              <td className="px-6 py-3">&lt; 60 208 €</td>
                            </tr>
                            <tr className="hover:bg-stone-50">
                              <td className="px-6 py-3 font-medium">5</td>
                              <td className="px-6 py-3">&lt; 56 580 €</td>
                              <td className="px-6 py-3">&lt; 68 877 €</td>
                            </tr>
                            <tr className="bg-stone-50/50 text-xs text-stone-500">
                              <td className="px-6 py-3">Par pers. supp.</td>
                              <td className="px-6 py-3">+ 7 116 €</td>
                              <td className="px-6 py-3">+ 8 663 €</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section (E-E-A-T & SEO) */}
              <section id="faq" className="mt-16 max-w-4xl mx-auto bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm">
                <h2 className="text-3xl font-bold text-stone-900 mb-8 text-center">Questions Fréquentes (FAQ 2026)</h2>
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Comment cumuler MaPrimeAdapt' et l'APA en 2026 ?</h3>
                    <p className="text-stone-600">Le cumul est possible mais complexe : MaPrimeAdapt' finance le socle (70% max) et l'APA peut intervenir sur le reste à charge si vous êtes en GIR 1 à 4. Notre simulateur "Cumul Aides" calcule automatiquement cette synergie pour minimiser votre facture finale.</p>
                  </div>
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Pourquoi mon dossier MaPrimeAdapt' a été refusé ?</h3>
                    <p className="text-stone-600">Les motifs fréquents incluent l'absence d'AMO habilité, un logement de moins de 15 ans, ou des devis non conformes aux normes PMR (ex: ressaut trop haut). Utilisez notre quiz "Troubleshooter" pour identifier la cause exacte et lancer votre recours.</p>
                  </div>
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Quelles sont les normes techniques PMR pour une douche senior ?</h3>
                    <p className="text-stone-600">Pour être éligible aux aides, votre douche doit respecter des dimensions précises : receveur 120x90cm minimum, ressaut de moins de 2cm, et espace de giration de 1,50m. Notre simulateur technique vérifie ces points pour vous.</p>
                  </div>
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Le Crédit d'impôt accessibilité existe-t-il toujours ?</h3>
                    <p className="text-stone-600">Le crédit d'impôt de 25% reste mobilisable sous conditions spécifiques en 2026 (notamment pour les revenus intermédiaires ou supérieurs non éligibles à MaPrimeAdapt'). Notre simulateur le prend en compte dans son calcul de reste à charge.</p>
                  </div>
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Comment choisissez-vous la douche "Idéale" ?</h3>
                    <p className="text-stone-600">Contrairement aux configurateurs classiques, notre algorithme se base sur vos usages réels (aide à la toilette, mobilité) et vos craintes (brûlures, glissades). Il propose un "Pack" sur-mesure qui privilégie la sécurité sans sacrifier l'esthétique (ex: barres d'appui design, sièges invisibles).</p>
                  </div>
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Quel est le meilleur moment pour adapter ma salle de bain ?</h3>
                    <p className="text-stone-600">Il est recommandé d'anticiper la perte d'autonomie. Notre algorithme de timing évalue votre situation (âge, historique de chutes, finances) pour vous conseiller. Faire les travaux avant la retraite permet souvent de mieux absorber le coût. N'attendez pas l'urgence (chute) car les aides comme MaPrimeAdapt' nécessitent un dossier validé <strong>avant</strong> le début des travaux.</p>
                  </div>
                  <div className="border-b border-stone-100 pb-6">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Je suis perdu(e) dans les démarches administratives, que faire ?</h3>
                    <p className="text-stone-600">C'est tout à fait normal. Notre quiz "Accompagnement Administratif" génère un plan d'action étape par étape selon votre situation (avez-vous un devis ? êtes-vous à l'aise sur internet ?). Si vous le souhaitez, nous pouvons vous mettre en relation avec un mandataire administratif qui gérera l'intégralité de votre dossier d'aides à votre place.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Comment savoir si je pourrai rester vivre chez moi ?</h3>
                    <p className="text-stone-600">Le maintien à domicile dépend fortement de la sécurité de votre logement, et la salle de bain est la pièce la plus à risque. Notre quiz "Maintien à Domicile" évalue la viabilité de votre projet de vie en croisant votre niveau de dépendance, vos craintes (comme celle de l'EHPAD) et l'état de votre salle de bain pour vous dire si une adaptation est urgente pour éviter un placement en établissement.</p>
                  </div>
                </div>
              </section>

              {/* Blog Section */}
              <section id="blog" className="mt-16 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-stone-900 mb-4 text-center">📚 Blog & Guides Complets</h2>
                <p className="text-center text-stone-600 mb-12">Articles d'experts pour approfondir vos connaissances sur les aides, la sécurité et le maintien à domicile</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Article 1 */}
                  <a href="/blog/simulateur-maprimeadapt-2026-guide-complet.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">1️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Simulateur MaPrimeAdapt' 2026</h3>
                    <p className="text-stone-600 text-sm mb-4">Guide complet pour calculer vos aides financières avec les barèmes ANAH 2026. Exemples concrets et reste à charge détaillé.</p>
                    <div className="text-xs text-stone-500">🏷️ MaPrimeAdapt' • Aides Financières • 2026</div>
                  </a>

                  {/* Article 2 */}
                  <a href="/blog/diagnostic-securite-salle-de-bain-algorithme.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">2️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Diagnostic Sécurité Salle de Bain</h3>
                    <p className="text-stone-600 text-sm mb-4">Évaluez vos risques de chute avec notre algorithme clinique à 13 critères. Score sur 10 et recommandations personnalisées.</p>
                    <div className="text-xs text-stone-500">🏷️ Sécurité • Prévention Chutes • Algorithme</div>
                  </a>

                  {/* Article 3 */}
                  <a href="/blog/configurateur-douche-pmr-ideal.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">3️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Configurateur Douche PMR Idéale</h3>
                    <p className="text-stone-600 text-sm mb-4">Trouvez la douche adaptée à votre mobilité et votre style en 7 questions. Packs Zen, Sécurité ou Design.</p>
                    <div className="text-xs text-stone-500">🏷️ Configuration • Douche PMR • Design</div>
                  </a>

                  {/* Article 4 */}
                  <a href="/blog/timing-travaux-senior-2026.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">4️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Timing Travaux Senior</h3>
                    <p className="text-stone-600 text-sm mb-4">Quel est le meilleur moment pour adapter votre salle de bain ? Analyse de votre autonomie, finances et historique.</p>
                    <div className="text-xs text-stone-500">🏷️ Timing • Anticipation • Finances</div>
                  </a>

                  {/* Article 5 */}
                  <a href="/blog/accompagnement-administratif-maprimeadapt.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">5️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Accompagnement Administratif</h3>
                    <p className="text-stone-600 text-sm mb-4">Comment remplir un dossier MaPrimeAdapt' ? Découvrez le parcours adapté à votre situation : Autonome, Accompagné ou Délégation.</p>
                    <div className="text-xs text-stone-500">🏷️ Démarches • ANAH • Mandataire</div>
                  </a>

                  {/* Article 6 */}
                  <a href="/blog/maintien-domicile-eviter-ehpad.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">6️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Maintien à Domicile</h3>
                    <p className="text-stone-600 text-sm mb-4">Ai-je vraiment le droit de rester chez moi en toute sécurité ? Évaluez la viabilité de votre projet de vie.</p>
                    <div className="text-xs text-stone-500">🏷️ Maintien à Domicile • Éviter EHPAD • Sécurité</div>
                  </a>

                  {/* Article 7 */}
                  <a href="/blog/cumul-aides-2026.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">7️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Cumul Aides 2026</h3>
                    <p className="text-stone-600 text-sm mb-4">Le guide définitif pour cumuler MaPrimeAdapt, l'APA et les caisses de retraite sans erreur.</p>
                    <div className="text-xs text-stone-500">🏷️ Cumul • APA • Budget</div>
                  </a>

                  {/* Article 8 */}
                  <a href="/blog/prix-douche-senior-apres-aides.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">8️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Prix Net après Aides</h3>
                    <p className="text-stone-600 text-sm mb-4">Découvrez pourquoi le prix catalogue ne veut rien dire et comment calculer votre budget réel.</p>
                    <div className="text-xs text-stone-500">🏷️ Prix • Devis • Financement</div>
                  </a>

                  {/* Article 9 */}
                  <a href="/blog/refus-maprimeadapt-recours-solutions.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">9️⃣</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Refus MaPrimeAdapt'</h3>
                    <p className="text-stone-600 text-sm mb-4">Dossier rejeté ? Découvrez les 7 étapes pour lancer un recours gagnant et débloquer vos aides.</p>
                    <div className="text-xs text-stone-500">🏷️ Recours • ANAH • Litige</div>
                  </a>

                  {/* Article 10 */}
                  <a href="/blog/normes-techniques-pmr-fauteuil-roulant.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">🔟</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Normes PMR 2026</h3>
                    <p className="text-stone-600 text-sm mb-4">Toutes les dimensions obligatoires pour une douche accessible en fauteuil roulant (ressaut, giration).</p>
                    <div className="text-xs text-stone-500">🏷️ Technique • Normes • Fauteuil</div>
                  </a>

                  {/* Article 11 */}
                  <a href="/blog/prevention-chutes-bilan-salle-de-bain.html" className="block bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-3">🏥</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Prévention des Chutes</h3>
                    <p className="text-stone-600 text-sm mb-4">Le bilan médical de votre salle de bain : 13 points critiques à vérifier d'urgence.</p>
                    <div className="text-xs text-stone-500">🏷️ Santé • Prévention • Risque</div>
                  </a>
                </div>

                <div className="text-center mt-8">
                  <a href="/blog/" className="inline-block bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-colors">
                    Voir tous les articles →
                  </a>
                </div>
              </section>

            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <button
                onClick={() => {
                  setActiveQuiz(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-label="Retourner à la liste des simulateurs"
                className="flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-8 font-medium text-base bg-white px-4 py-2 rounded-full shadow-sm border border-stone-200 w-fit"
              >
                <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" /> Retour aux simulateurs
              </button>
              <QuizEngine quiz={activeQuiz} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* E-E-A-T: Témoignages & Preuve Sociale avec Photos Avant/Après */}
      <section id="avis-clients" className="py-24 bg-white relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6">
              Ils ont sécurisé leur domicile avec nous
            </h2>
            <p className="text-xl text-stone-500">
              Découvrez comment nos simulateurs ont aidé concrètement des seniors à anticiper leurs travaux et maximiser leurs aides, avec de vrais résultats.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Cas 1 */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col h-full">
              <div className="mb-4 rounded-xl overflow-hidden relative aspect-video flex">
                <div className="w-1/2 relative border-r-2 border-white">
                  <img src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=400" alt="Baignoire dangeureuse (Avant)" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-xs px-2 py-1 rounded font-semibold">AVANT</div>
                </div>
                <div className="w-1/2 relative">
                  <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" alt="Douche sécurisée (Après)" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded font-semibold">APRÈS</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">ML</div>
                <div>
                  <h4 className="font-bold text-stone-900">Mme Lemoine, 78 ans</h4>
                  <div className="flex text-amber-400 text-sm"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
                </div>
              </div>
              <p className="text-stone-600 italic mb-6 grow text-sm">"Grâce au Diagnostic ! Le simulateur m'a rassurée : devis de 5500€, reste à charge 1650€ avec MaPrimeAdapt'."</p>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block self-start">Financement : 70% d'aides</div>
            </div>

            {/* Cas 2 */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col h-full">
              <div className="mb-4 rounded-xl overflow-hidden relative aspect-video flex">
                <div className="w-1/2 relative border-r-2 border-white">
                  <img src="https://placehold.co/400x300/e7e5e4/57534e?text=Baignoire+Ancienne" alt="Salle de bain vétuste (Avant)" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-xs px-2 py-1 rounded font-semibold">AVANT</div>
                </div>
                <div className="w-1/2 relative">
                  <img src="https://placehold.co/400x300/d1fae5/047857?text=Douche+Design" alt="Pack Design (Après)" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-xs px-2 py-1 rounded font-semibold">APRÈS</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg">JD</div>
                <div>
                  <h4 className="font-bold text-stone-900">Jacques D., 68 ans</h4>
                  <div className="flex text-amber-400 text-sm"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
                </div>
              </div>
              <p className="text-stone-600 italic mb-6 grow text-sm">"Le quiz 'Timing' m'a convaincu d'agir avant la retraite pour lisser l'effort. Configurateur orienté Pack Design."</p>
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block self-start">Anticipation Réussie</div>
            </div>

            {/* Cas 3 */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col h-full">
              <div className="mb-4 rounded-xl overflow-hidden relative aspect-video flex">
                <div className="w-1/2 relative border-r-2 border-white">
                  <img src="https://placehold.co/400x300/e7e5e4/57534e?text=Petite+Baignoire" alt="Baignoire difficile d'accès (Avant)" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-xs px-2 py-1 rounded font-semibold">AVANT</div>
                </div>
                <div className="w-1/2 relative">
                  <img src="https://placehold.co/400x300/e0e7ff/4338ca?text=Douche+Spacieuse" alt="Douche sur mesure (Après)" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-purple-600/90 text-white text-xs px-2 py-1 rounded font-semibold">APRÈS</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">CB</div>
                <div>
                  <h4 className="font-bold text-stone-900">Claude & Bernard</h4>
                  <div className="flex text-amber-400 text-sm"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
                </div>
              </div>
              <p className="text-stone-600 italic mb-6 grow text-sm">"Perdus dans les papiers ANAH, le quiz nous a liés à un mandataire. Douche posée en 4 semaines."</p>
              <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg inline-block self-start">Gestion Déléguée ANAH</div>
            </div>
          </div>
        </div>
      </section>

      {/* E-E-A-T: À Propos / Notre Mission & Identification Claire */}
      <section id="a-propos" className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 font-medium text-sm mb-6 border border-white/20">
                <ShieldAlert className="w-4 h-4" /> La Mission Simulateur MaPrimeAdapt
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                L'expertise métier au service de votre sécurité à domicile.
              </h2>
              <p className="text-xl text-stone-300 mb-8">
                Créée par un collectif d'<strong>experts du maintien à domicile</strong>, Simulateur MaPrimeAdapt a une mission simple : rendre l'adaptation du logement transparente, sécurisée et accessible via les aides officielles.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Expertise Clinique & Technique</h4>
                    <p className="text-stone-400">Nos outils sont co-construits avec des professionnels de santé garantissant des recommandations viables.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                    <Calculator className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Barèmes Officiels ANAH</h4>
                    <p className="text-stone-400">Tous nos calculs sont basés strictement sur les grilles de l'Agence Nationale de l'Habitat (ANAH 2026).</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80" alt="Équipe d'experts Simulateur MaPrimeAdapt" className="rounded-2xl shadow-2xl opacity-90 ring-1 ring-white/10" />
              <div className="absolute -bottom-6 -left-6 bg-white text-stone-900 p-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center rounded-full">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold">Indépendant & Certifié</div>
                  <div className="text-sm text-stone-500">Service 100% Gratuit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (E-E-A-T & Trust Signals) */}
      <footer className="bg-stone-950 text-stone-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12 border-b border-stone-800 pb-12">
            <div className="col-span-2 md:col-span-1">
              <a href="#" className="flex items-center gap-2 font-bold text-xl text-white mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
                Senior<span className="text-blue-500">Bain</span>
              </a>
              <p className="text-sm text-stone-500 mb-6">
                Le 1er hub de simulateurs d'adaptation du domicile pour garantir sécurité et autonomie.
              </p>
              <div className="text-sm bg-stone-900/50 p-4 rounded-xl border border-stone-800 text-stone-300">
                <strong className="text-white">Simulateur MaPrimeAdapt France SAS</strong><br />
                15 rue de la Sécurité, 75001 Paris<br />
                <a href="mailto:contact@simulateur-maprimeadapt-simulateurs.fr" className="hover:text-white transition-colors">contact@simulateur-maprimeadapt-simulateurs.fr</a><br />
                Numéro Vert: <strong className="text-white">0 800 80 80 80</strong><br />
                <span className="text-xs text-stone-600 mt-2 block">SIRET: 123 456 789 00012</span>
              </div>
            </div>

            <div className="md:pl-4">
              <h4 className="text-white font-bold mb-6">Sources Officielles</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://www.anah.gouv.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-2">ANAH <ArrowRight className="w-3 h-3" /></a></li>
                <li><a href="https://france-renov.gouv.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-2">France Rénov' <ArrowRight className="w-3 h-3" /></a></li>
                <li><a href="https://www.service-public.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-2">Service-Public.fr <ArrowRight className="w-3 h-3" /></a></li>
                <li className="pt-4 mt-2">
                  <p className="text-xs text-stone-500 italic">Nos références juridiques et financières sont systématiquement sourcées via l'État français.</p>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Ressources & Outils</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#simulateurs" className="hover:text-blue-400 transition-colors">Nos 6 Simulateurs</a></li>
                <li><a href="/blog/" className="hover:text-blue-400 transition-colors">Blog & Guides Conseils</a></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Foire Aux Questions (FAQ)</a></li>
                <li><a href="#a-propos" className="hover:text-blue-400 transition-colors">Notre Équipe / À Propos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Légal & Transparence</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => setShowLegal(true)} className="hover:text-blue-400 transition-colors text-left w-full sm:w-auto">Mentions légales</button></li>
                <li><button onClick={() => setShowPrivacy(true)} className="hover:text-blue-400 transition-colors text-left w-full sm:w-auto">Politique de confidentialité</button></li>
                <li><button onClick={() => setShowLegal(true)} className="hover:text-blue-400 transition-colors text-left w-full sm:w-auto">CGU</button></li>
                <li className="mt-4 pt-4 border-t border-stone-800">
                  <span className="flex items-center gap-2 text-emerald-500"><Lock className="w-4 h-4" /> Données 100% sécurisées</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm gap-4">
            <p>© 2026 Simulateur MaPrimeAdapt Simulateurs. Tous droits réservés.</p>
            <p className="text-stone-500 bg-stone-900 px-4 py-2 rounded-lg border border-stone-800 text-xs">
              Site indépendant et non gouvernemental.<br />
              <strong>Modèle économique :</strong> Utilisation gratuite pour les particuliers. Rémunération via mise en relation avec nos artisans partenaires certifiés.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals E-E-A-T */}
      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm backdrop-filter overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-2xl w-full my-8 p-8 relative shadow-2xl">
              <button onClick={() => setShowLegal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold mb-6 text-stone-900 border-b pb-4">Mentions Légales & CGU</h2>
              <div className="space-y-6 text-sm text-stone-600">
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">1. Éditeur du site</h3>
                  <p><strong>Simulateur MaPrimeAdapt France SAS</strong><br />15 rue de la Sécurité, 75001 Paris<br />Capital social : 10 000€<br />RSC : Paris B 123 456 789<br />Directeur de publication : Équipe Simulateur MaPrimeAdapt</p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">2. Hébergement</h3>
                  <p><strong>Vercel Inc.</strong><br />340 S Lemon Ave #4133<br />Walnut, CA 91789, États-Unis</p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">3. Propriété Intellectuelle</h3>
                  <p>L'ensemble de ce site (textes, images, algorithmes de simulation, design) relève des législations françaises et internationales sur le droit d'auteur. Toute reproduction totale ou partielle est strictement interdite sans notre autorisation écrite.</p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">4. Indépendance et Responsabilité</h3>
                  <p>Simulateur MaPrimeAdapt est une initiative privée totalement indépendante de l'État (ANAH, France Rénov'). Les résultats de nos simulateurs financiers et gériatriques sont fournis à titre de <strong>diagnostic indicatif</strong>. Ils ne valent en aucun cas validation juridique ou acceptation de dossier par les organismes officiels.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm backdrop-filter overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-2xl w-full my-8 p-8 relative shadow-2xl">
              <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold mb-6 text-stone-900 border-b pb-4">Politique de Confidentialité & RGPD</h2>
              <div className="space-y-6 text-sm text-stone-600">
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">1. Collecte des Données</h3>
                  <p>Les données que nous recueillons via nos simulateurs sont strictement nécessaires au calcul de votre éligibilité (critères de santé/logement) et à votre mise en relation avec nos artisans agréés (Nom, Téléphone, Code Postal).</p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">2. Base Légale du Traitement</h3>
                  <p>La collecte s'effectue sur la base de votre <strong>consentement explicite</strong>, matérialisé par la case à cocher obligatoire avant validation de vos résultats.</p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">3. Conservation, Sécurité et Anonymisation</h3>
                  <p>Vos données sont stockées sur des bases de données chiffrées (PostgreSQL pgcrypto). Conformément à la réglementation RGPD, notre architecture procède à l'<strong>anonymisation automatique et irréversible</strong> de vos données personnelles au bout de 3 ans d'inactivité commerciale.</p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 mb-2">4. Exercice de vos Droits</h3>
                  <p>Conformément à la Loi Informatique et Libertés (CNIL), vous disposez d'un droit d'accès, de rectification, de portabilité, et d'effacement. Exercez ces droits à tout moment en nous écrivant à : <em>privacy@simulateur-maprimeadapt-simulateurs.fr</em>.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizEngine({ quiz }: { quiz: Quiz }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);

  const question = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  const handleAnswer = (value: string) => {
    if (question.type === 'multiple') {
      const currentAnswers = (answers[question.id] as string[]) || [];
      if (currentAnswers.includes(value)) {
        setAnswers({ ...answers, [question.id]: currentAnswers.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [question.id]: [...currentAnswers, value] });
      }
    } else {
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      } else {
        setTimeout(() => {
          setShowResult(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }
    }
  };

  const handleNextMultiple = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (showResult) {
    const result = quiz.calculateResult(answers);
    return <ResultScreen result={result} quiz={quiz} answers={answers} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-stone-500 mb-3">
          <span>Question {currentQuestionIndex + 1} sur {quiz.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${quiz.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-lg text-stone-500 mb-8">{question.subtitle}</p>
          )}

          <div className={`space-y-4 ${!question.subtitle ? 'mt-10' : ''}`}>
            {question.answers.map((answer) => {
              const val = answer.value || answer.score?.toString() || answer.id;
              const isSelected = question.type === 'multiple'
                ? ((answers[question.id] as string[]) || []).includes(val)
                : answers[question.id] === val;

              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(val)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                      : 'border-stone-200 hover:border-blue-300 hover:bg-stone-50 text-stone-700'
                    }`}
                >
                  <span className="font-medium text-xl">{answer.label}</span>
                  <div className={`w-8 h-8 border-2 flex items-center justify-center transition-colors shrink-0 ml-4
                    ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-stone-300 group-hover:border-blue-400'}
                    ${question.type === 'multiple' ? 'rounded-md' : 'rounded-full'}
                  `}>
                    {isSelected && <div className={`bg-white ${question.type === 'multiple' ? 'w-4 h-4 rounded-sm' : 'w-3 h-3 rounded-full'}`} />}
                  </div>
                </button>
              );
            })}
          </div>

          {question.type === 'multiple' && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNextMultiple}
                disabled={!answers[question.id] || answers[question.id].length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-colors flex items-center"
              >
                Valider <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ResultScreen({ result, quiz, answers }: { result: QuizResult, quiz: Quiz, answers: Record<string, any> }) {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const Icon = result.type === 'success' ? CheckCircle2 : result.type === 'warning' ? AlertTriangle : Info;
  const colorClass = result.type === 'success' ? 'text-emerald-600 bg-emerald-100' :
    result.type === 'warning' ? 'text-rose-600 bg-rose-100' :
      'text-blue-600 bg-blue-100';

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const contact_name = formData.get('name') as string;
    const contact_phone = formData.get('phone') as string;
    const contact_zip = formData.get('zip') as string;
    const consent_given = formData.get('consent') === 'true';

    // Vérifier le consentement RGPD
    if (!consent_given) {
      alert('Vous devez accepter la politique de confidentialité pour continuer.');
      return;
    }

    // Préparer le payload pour l'API
    const leadData = {
      site_id: import.meta.env.VITE_SITE_ID || 'douche-pmr-fr',
      niche: import.meta.env.VITE_NICHE || 'senior-bathroom',
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      contact_name,
      contact_phone,
      contact_zip,
      quiz_score: result.leadScore || 0,
      lead_temperature: result.leadTemperature || 'COLD',
      answers, // Toutes les réponses du quiz
      consent_given,
      consent_date: new Date().toISOString()
    };

    // Envoyer vers l'API centrale
    const apiResult = await submitLead(leadData);

    if (apiResult.success) {
      console.log("✅ Lead envoyé avec succès, ID:", apiResult.lead_id);
    } else if (apiResult.offline_mode) {
      console.log("⚠️ Mode hors-ligne : Lead sauvegardé localement");
      alert("Vos informations ont été sauvegardées localement. Nous les enverrons dès que le serveur sera disponible.");
    } else {
      console.error("❌ Erreur envoi lead:", apiResult.error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }

    setFormSubmitted(true);
    setTimeout(() => {
      const element = document.getElementById('lead-form-card');
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      {/* Left Column: Direct Results */}
      <div className="lg:col-span-3 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-start gap-6 mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">{result.title}</h2>
            <p className="text-lg text-stone-600">{result.description}</p>
          </div>
        </div>

        <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-100">
          <h3 className="font-bold text-lg text-stone-900 flex items-center mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2" />
            Détails de votre analyse personnalisée :
          </h3>
          <ul className="space-y-4">
            {result.details.map((detail, idx) => (
              <li key={idx} className="flex items-start text-stone-700 text-lg">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-4 shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Related Quiz */}
        {result.relatedQuiz && quizzes.find(q => q.id === result.relatedQuiz) && (() => {
          const related = quizzes.find(q => q.id === result.relatedQuiz)!;
          const RelatedIcon = related.icon;
          return (
            <div className="mt-8 bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-md transition-shadow">
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${related.color} text-white`}>
                  <RelatedIcon className="w-6 h-6" />
                </div>
                <img 
                  src="/logo-abstract.png" 
                  alt="Certification" 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-bold text-stone-900 text-lg mb-1">Pour aller plus loin...</h4>
                <p className="text-stone-600 text-sm mb-3">Complétez votre analyse avec ce simulateur recommandé : <span className="font-semibold text-stone-800">{related.title}</span></p>
                <a
                  href={`/?quiz=${related.id}`}
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 hover:underline"
                >
                  Démarrer ce diagnostic <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Right Column: Lead Capture Form */}
      <div id="lead-form-card" className="lg:col-span-2 bg-blue-600 p-8 sm:p-10 rounded-3xl shadow-lg text-white sticky top-24">
        {!formSubmitted ? (
          <>
            <h3 className="text-2xl font-bold mb-4">Passez à l'action !</h3>
            <p className="text-blue-100 mb-8 text-lg">
              Recevez un devis exact et gratuit basé sur ce diagnostic, sans aucun engagement.
            </p>

            <form onSubmit={handleLeadSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-1.5">Nom complet</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-100 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all"
                  placeholder="Ex: 06 12 34 56 78"
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-blue-100 mb-1.5">Code Postal</label>
                <input
                  type="text"
                  id="zip"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all"
                  placeholder="Ex: 75001"
                />
              </div>
              <div>
                <label className="flex items-start gap-3 text-sm text-blue-100">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-white"
                  />
                  <span>
                    J'accepte la <a href="/politique-confidentialite" className="underline hover:text-white">politique de confidentialité</a> et autorise le traitement de mes données personnelles pour me recontacter concernant ma demande de devis.
                  </span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold py-4 rounded-xl transition-colors mt-2 flex items-center justify-center text-lg shadow-sm"
              >
                {quiz.id === 'configurateur-douche' ? `Devis gratuit : ${result.title}` : 'Obtenir mon devis gratuit'} <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <p className="text-xs text-blue-200 text-center mt-4">
                Vos données sont sécurisées. Un expert local vous contactera sous 24h.
              </p>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Demande envoyée !</h3>
            <p className="text-blue-100 text-lg">
              Merci. Un conseiller expert de votre région va vous contacter très prochainement pour affiner votre projet.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
