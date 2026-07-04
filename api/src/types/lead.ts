export interface LeadSubmission {
  site_id: string;
  niche: string;
  quiz_id: string;
  quiz_title: string;
  contact_name: string;
  contact_phone: string;
  contact_zip?: string;
  quiz_score: number;
  lead_temperature: 'HOT' | 'WARM' | 'COLD';
  answers: Record<string, any>;
  consent_given?: boolean;
  consent_date?: string;
}

export interface StoredLead extends LeadSubmission {
  id: number;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: Date;
}

export interface SiteConfig {
  site_id: string;
  site_name: string;
  niche: string;
  active: boolean;
}
