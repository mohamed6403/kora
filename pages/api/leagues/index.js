import db from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all leagues
      const { rows } = await db.query('SELECT * FROM leagues ORDER BY created_at DESC');
      return res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Create a new league
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'League name is required' });
      }

      const { rows } = await db.query(
        'INSERT INTO leagues (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );

      return res.status(201).json(rows[0]);
    } else {
      // Handle other methods
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in leagues API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
