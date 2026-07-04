import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const siteId = req.body?.site_id;

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key manquante' });
  }

  if (!siteId) {
    return res.status(400).json({ error: 'site_id manquant dans le body' });
  }

  try {
    // Vérifier que la clé API correspond au hash stocké pour ce site_id
    const result = await pool.query(
      'SELECT id, active FROM sites WHERE site_id = $1 AND api_key_hash = crypt($2, api_key_hash) AND active = true',
      [siteId, apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'API Key invalide ou site inactif' });
    }

    // Ajouter le site_id à la request pour les prochains middlewares
    req.body.site_id = siteId;
    next();
  } catch (error) {
    console.error('Erreur validation API Key:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
