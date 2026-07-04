import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { validateApiKey } from '../middleware/auth';
import { validateLeadData } from '../middleware/validator';

const router = Router();

// POST /api/v1/leads - Créer un nouveau lead
router.post('/', validateApiKey, validateLeadData, async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const {
      site_id,
      niche,
      quiz_id,
      quiz_title,
      contact_name,
      contact_phone,
      contact_zip,
      quiz_score,
      lead_temperature,
      answers,
      consent_given,
      consent_date
    } = req.body;

    // Vérifier RGPD : le consentement est obligatoire
    if (!consent_given) {
      return res.status(400).json({
        success: false,
        error: 'Consentement RGPD requis'
      });
    }

    // Insérer le lead
    const result = await client.query(
      `INSERT INTO leads (
        site_id, niche, quiz_id, quiz_title,
        contact_name, contact_phone, contact_zip,
        quiz_score, lead_temperature, answers,
        consent_given, consent_date,
        ip_address, user_agent, referrer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        site_id, niche, quiz_id, quiz_title,
        contact_name, contact_phone, contact_zip,
        quiz_score, lead_temperature, JSON.stringify(answers),
        consent_given, consent_date || new Date().toISOString(),
        req.ip, req.get('User-Agent'), req.get('Referer')
      ]
    );

    const lead = result.rows[0];

    res.status(201).json({
      success: true,
      lead_id: lead.id,
      message: 'Lead enregistré avec succès'
    });

  } catch (error) {
    console.error('Erreur création lead:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  } finally {
    client.release();
  }
});

// GET /api/v1/leads/stats - Statistiques (optionnel pour dashboard)
router.get('/stats', validateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        site_id,
        lead_temperature,
        COUNT(*) as count,
        AVG(quiz_score) as avg_score
      FROM leads
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY site_id, lead_temperature
      ORDER BY site_id, lead_temperature
    `);

    res.json({
      success: true,
      stats: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération stats' });
  }
});

export default router;
