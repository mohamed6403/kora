import db from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get one league
      const { rows } = await db.query('SELECT * FROM leagues WHERE id = $1', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'League not found' });
      }

      return res.status(200).json(rows[0]);
    } else if (req.method === 'PUT') {
      // Update a league
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'League name is required' });
      }

      const { rows } = await db.query(
        'UPDATE leagues SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [name, description, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'League not found' });
      }

      return res.status(200).json(rows[0]);
    } else if (req.method === 'DELETE') {
      // Delete a league
      const { rows } = await db.query('DELETE FROM leagues WHERE id = $1 RETURNING *', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'League not found' });
      }

      return res.status(200).json({ message: 'League deleted successfully' });
    } else {
      // Handle other methods
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in league API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
