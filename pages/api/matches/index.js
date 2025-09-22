import db from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get matches for a specific league
      const { leagueId } = req.query;

      if (!leagueId) {
        return res.status(400).json({ error: 'League ID is required' });
      }

      const { rows } = await db.query(
        `SELECT m.*, 
                t1.name AS home_team_name, 
                t2.name AS away_team_name
         FROM matches m
         JOIN teams t1 ON m.home_team_id = t1.id
         JOIN teams t2 ON m.away_team_id = t2.id
         WHERE m.league_id = $1
         ORDER BY m.match_date DESC`,
        [leagueId]
      );

      return res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Create a new match
      const { homeTeamId, awayTeamId, leagueId, matchDate } = req.body;

      if (!homeTeamId || !awayTeamId || !leagueId || !matchDate) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const { rows } = await db.query(
        `INSERT INTO matches (home_team_id, away_team_id, league_id, match_date, home_score, away_score)
         VALUES ($1, $2, $3, $4, 0, 0) RETURNING *`,
        [homeTeamId, awayTeamId, leagueId, matchDate]
      );

      return res.status(201).json(rows[0]);
    } else if (req.method === 'PUT') {
      // Update match scores
      const { id, homeScore, awayScore } = req.body;

      if (!id || homeScore === undefined || awayScore === undefined) {
        return res.status(400).json({ error: 'Match ID and scores are required' });
      }

      const { rows } = await db.query(
        `UPDATE matches 
         SET home_score = $1, away_score = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 RETURNING *`,
        [homeScore, awayScore, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }

      return res.status(200).json(rows[0]);
    } else {
      // Handle other methods
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in matches API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
