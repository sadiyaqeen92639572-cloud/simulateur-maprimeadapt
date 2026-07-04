import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Schéma de validation pour les leads
export const leadSchema = z.object({
  site_id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'site_id invalide'),
  niche: z.string().min(1),
  quiz_id: z.string().min(1),
  quiz_title: z.string().min(1).max(255),
  contact_name: z.string().min(2).max(100),
  contact_phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Téléphone invalide'),
  contact_zip: z.string().regex(/^\d{5}$/, 'Code postal invalide').optional(),
  quiz_score: z.number().int().min(0).max(200),
  lead_temperature: z.enum(['HOT', 'WARM', 'COLD']),
  answers: z.record(z.any()),
  consent_given: z.boolean().default(false),
  consent_date: z.string().datetime().optional()
});

export const validateLeadData = (req: Request, res: Response, next: NextFunction) => {
  try {
    leadSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    return res.status(400).json({ success: false, error: 'Erreur de validation' });
  }
};
