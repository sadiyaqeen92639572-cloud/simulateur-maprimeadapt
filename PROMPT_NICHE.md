Je possède une application web React/TypeScript de type "Lead Generation" (Génération de prospects) basée sur des simulateurs/quiz interactifs. Actuellement configurée pour la niche de "l'adaptation de salle de bain pour seniors", je souhaite que tu l'adaptes pour la niche suivante : [INSÉRER VOTRE NOUVELLE NICHE ICI, ex: Installation de Panneaux Solaires].

Voici l'architecture détaillée du projet actuel que tu dois respecter et adapter :
1. Stack Technique
Framework : React 18 avec TypeScript (généré via Vite).
Styling : Tailwind CSS (approche utilitaire, design responsive mobile-first).
Animations : motion/react (Framer Motion) pour les transitions de pages, l'apparition des questions et la barre de progression.
Icônes : lucide-react.
2. Structure des Fichiers
L'application est divisée en deux fichiers principaux pour séparer la logique de l'interface :
/src/data/quizzes.ts : Contient le modèle de données (Interfaces TypeScript) et le contenu des quiz (questions, réponses, algorithmes de calcul).
/src/App.tsx : Contient l'interface utilisateur (UI), le moteur de rendu des quiz (QuizEngine), l'écran de résultats (ResultScreen) et le formulaire de capture de leads.
3. Le Modèle de Données (/src/data/quizzes.ts)
C'est le cœur du système. Il exporte un tableau d'objets quizzes. Chaque quiz respecte cette interface :
code
TypeScript
export interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType; // Icône Lucide
  color: string; // Classe Tailwind (ex: 'bg-blue-500')
  questions: Question[];
  // Fonction cruciale : prend les réponses de l'utilisateur et retourne un résultat personnalisé
  calculateResult: (answers: Record<string, any>) => QuizResult; 
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multiple'; // Choix unique ou multiple
  answers: Answer[];
}

export interface Answer {
  id: string;
  label: string;
  value?: string;
  score?: number; // Utilisé pour les algorithmes de scoring
}

export interface QuizResult {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info'; // Détermine la couleur et l'icône du résultat
  details: string[]; // Liste à puces des recommandations
}
4. Le Moteur UI (/src/App.tsx)
Le fichier principal gère 3 états principaux :
L'Accueil (activeQuiz === null) :
Un Header sticky avec navigation (qui utilise window.scrollTo pour naviguer vers les ancres).
Un Hero Header (Titre + Sous-titre).
Une grille affichant les cartes de chaque quiz disponible.
Des sections SEO/Trust : Méthodologie, Cas d'usage, Barèmes/Prix, FAQ, Footer.
Un script JSON-LD (Schema.org) injecté dans le <head> pour l'optimisation IA/SEO (GEO).
Le Moteur de Quiz (<QuizEngine />) :
Affiche une barre de progression dynamique.
Affiche une question à la fois avec AnimatePresence (Framer Motion) pour des transitions fluides.
Gère les clics : passe automatiquement à la question suivante pour les choix uniques (setTimeout de 300ms), ou nécessite un clic sur "Valider" pour les choix multiples.
Utilise window.scrollTo({ top: 0, behavior: 'smooth' }) à chaque changement de question pour garder l'utilisateur en haut de la vue.
L'Écran de Résultat (<ResultScreen />) :
Divisé en deux colonnes (grille CSS).
Colonne gauche (3/5) : Affiche le résultat calculé par la fonction calculateResult du quiz (Titre, description, icône dynamique, liste de détails).
Colonne droite (2/5) : Une carte "Sticky" contenant le formulaire de capture de lead (Nom, Téléphone, Code Postal).
À la soumission du formulaire, la page scrolle automatiquement vers le haut de cette carte pour afficher le message de remerciement.
5. Instructions pour l'adaptation (Ce que tu dois faire) :
En gardant EXACTEMENT la même architecture technique, le même design system (Tailwind) et les mêmes animations, je veux que tu réécrives le contenu pour ma nouvelle niche :
Dans App.tsx :
Modifie les textes de l'accueil (Hero, Header, Footer).
Adapte le JSON-LD pour le SEO de la nouvelle niche.
Remplace les sections "Méthodologie", "Cas pratiques", "Barèmes" et "FAQ" par du contenu pertinent pour la nouvelle niche.
Modifie les champs du formulaire de lead si nécessaire (ex: ajouter un champ "Type de toit" si c'est pour du solaire).
Dans quizzes.ts :
Crée 3 à 6 nouveaux quiz pertinents pour qualifier un prospect dans cette niche (ex: "Calculateur de rentabilité", "Suis-je éligible ?", "Quel équipement choisir ?").
Pour chaque quiz, rédige des questions stratégiques (single/multiple).
Pour chaque quiz, écris une fonction calculateResult intelligente qui utilise les scores ou les valeurs des réponses pour générer des profils de résultats réalistes (ex: Éligible / Non éligible / Cas complexe).
Assigne des icônes lucide-react pertinentes à chaque quiz.
Génère le code complet pour ces deux fichiers.
💡 Pourquoi ce prompt fonctionne bien avec les IA :
Il donne le contexte global : L'IA comprend que le but final est de générer des leads.
Il expose les interfaces TypeScript : L'IA sait exactement comment structurer ses données sans faire d'erreurs de typage.
Il détaille les comportements UX : L'IA ne supprimera pas vos ajouts récents (comme le window.scrollTo ou les animations Framer Motion) car ils sont explicitement documentés comme faisant partie de l'architecture requise.