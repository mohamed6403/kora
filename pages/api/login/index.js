import db from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Authenticate admin user
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const { rows } = await db.query(
        'SELECT * FROM admins WHERE email = $1 AND password = $2',
        [email, password]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // In a real application, you would create a JWT token here
      // For simplicity, we're just returning the admin data
      const admin = rows[0];

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin;

      return res.status(200).json(adminWithoutPassword);
    } else {
      // Handle other methods
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in login API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
