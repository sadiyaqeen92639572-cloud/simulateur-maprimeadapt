The Architecture of the Skill (The Agentic Workflow):
To automate this, the agent needs a multi-step prompt that chains research, data structuring, and code manipulation.
Skill Name: Generate_LeadGen_Funnel
Input: Niche (e.g., "NIS2 Compliance")
Step 1: The Research Phase (Automated Context Gathering)
The agent uses its web search tools to analyze the niche.
Action: Search for "NIS2 compliance requirements", "NIS2 penalties", "Who is affected by NIS2".
Output: The agent formulates 3 distinct buyer personas and the exact criteria that determine their outcome (e.g., >50M turnover = Essential Entity).
Step 2: The Data Layer Generation (quizzes.ts)
The agent uses its code-editing tools (edit_file or create_file) to write the logic.
Action: The agent generates the TypeScript array of Quiz objects.
Crucial Step: The agent writes the calculateResult function using the exact thresholds it learned in Step 1 (e.g., if (answers.revenue === 'over_50m') return { type: 'warning', title: 'High Risk' }).
Step 3: The UI & Copywriting Phase (App.tsx)
The agent adapts the frontend to match the niche's branding and tone.
Action: Modifies App.tsx.
Replacements:
Changes the Hero Title (e.g., "Stop Guessing. Know Your NIS2 Status in 2 Minutes.").
Changes the Tailwind color palette (e.g., swapping blue-600 for a corporate slate-900 or emerald-700 for sustainability/CSRD).
Updates the Lucide icons to match the theme (e.g., ShieldCheck, Server, Lock).
Updates the Lead Capture Form fields (e.g., changing "Zip Code" to "Company Name" and "Job Title").
Step 4: Compilation & Deployment
Because the Antigravity harness has terminal and build access:
Action: The agent runs install_applet_dependencies and compile_applet.
Action: The agent verifies there are no TypeScript errors. If there are, it self-corrects.


________________
I want to deploy a new Lead-Gen application based on the exact architecture of our current project. The new niche is [INSERT NICHE, e.g., CSRD Compliance for European SMEs].
Please execute the following steps autonomously:
1. Rewrite /src/data/quizzes.ts to include 3 highly technical, accurate quizzes for this niche. Write the calculateResult logic based on real-world criteria for this niche.
2. Edit /src/App.tsx to update the Hero section, the SEO metadata, the FAQ, and the trust badges to perfectly match this new niche. Change the lead capture form to ask for [Name, Work Email, Company Size].
3. Change the primary Tailwind color theme to [e.g., emerald/green for CSRD].
4. Run the linter and compiler to ensure the app builds successfully.
Do not ask for permission between steps, execute the full A-to-Z transformation