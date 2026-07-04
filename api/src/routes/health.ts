import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// GET /api/v1/health - Health check
router.get('/', async (req: Request, res: Response) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: dbCheck.rows[0],
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Database connection failed',
      timestamp: new Date()
    });
  }
});

export default router;
