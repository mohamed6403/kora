import db from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all teams for a specific league
      const { leagueId } = req.query;

      if (!leagueId) {
        return res.status(400).json({ error: 'League ID is required' });
      }

      const { rows } = await db.query(
        'SELECT * FROM teams WHERE league_id = $1 ORDER BY created_at DESC',
        [leagueId]
      );

      return res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Create a new team
      const { name, leagueId } = req.body;

      if (!name || !leagueId) {
        return res.status(400).json({ error: 'Team name and league ID are required' });
      }

      const { rows } = await db.query(
        'INSERT INTO teams (name, league_id) VALUES ($1, $2) RETURNING *',
        [name, leagueId]
      );

      return res.status(201).json(rows[0]);
    } else {
      // Handle other methods
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in teams API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
