interface LeadSubmission {
  site_id: string;
  niche: string;
  quiz_id: string;
  quiz_title: string;
  contact_name: string;
  contact_phone: string;
  contact_zip: string;
  quiz_score: number;
  lead_temperature: 'HOT' | 'WARM' | 'COLD';
  answers: Record<string, any>;
  consent_given: boolean;
  consent_date: string;
}

interface LeadApiResult {
  success: boolean;
  lead_id?: number;
  error?: string;
  offline_mode?: boolean;
}

export const submitLead = async (data: LeadSubmission): Promise<LeadApiResult> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de l\'envoi du lead');
    }

    // Nettoyer le localStorage en cas de succès
    const pendingLeads = JSON.parse(localStorage.getItem('pending_leads') || '[]');
    const updatedPendingLeads = pendingLeads.filter((l: any) => l.quiz_id !== data.quiz_id);
    localStorage.setItem('pending_leads', JSON.stringify(updatedPendingLeads));

    return { success: true, lead_id: result.lead_id };
  } catch (error) {
    console.error('Erreur API Lead:', error);

    // Mode résilience : sauvegarder dans le localStorage
    const pendingLeads = JSON.parse(localStorage.getItem('pending_leads') || '[]');
    pendingLeads.push({
      ...data,
      timestamp: new Date().toISOString(),
      retry_count: 0
    });
    localStorage.setItem('pending_leads', JSON.stringify(pendingLeads));

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      offline_mode: true
    };
  }
};

// Fonction pour retenter l'envoi des leads en attente
export const retryPendingLeads = async (): Promise<void> => {
  const pendingLeads = JSON.parse(localStorage.getItem('pending_leads') || '[]');

  for (const lead of pendingLeads) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(lead)
      });

      if (response.ok) {
        // Retirer de la liste d'attente
        const updated = pendingLeads.filter((l: any) => l.timestamp !== lead.timestamp);
        localStorage.setItem('pending_leads', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Erreur retry lead:', error);
    }
  }
};

// Appeler retryPendingLeads au chargement de l'app
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(retryPendingLeads, 2000);
  });
}
