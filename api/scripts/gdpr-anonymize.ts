import { pool } from '../src/config/database';

// Anonymiser les leads de plus de 3 ans (conformité CNIL)
export const anonymizeOldLeads = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      UPDATE leads
      SET
        contact_name = 'ANONYMIZED',
        contact_phone = 'ANONYMIZED',
        contact_zip = '00000',
        answers = '{"anonymized": true}'::jsonb,
        ip_address = NULL,
        user_agent = NULL
      WHERE created_at < NOW() - INTERVAL '3 years'
      AND contact_name != 'ANONYMIZED'
      RETURNING id
    `);

    console.log(`✅ ${result.rowCount} leads anonymisés (conformité CNIL)`);
    return result.rowCount;
  } catch (error) {
    console.error('Erreur anonymisation:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  anonymizeOldLeads()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
