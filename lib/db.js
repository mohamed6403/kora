const { Pool } = require('pg');

// Create a new pool with the Neon connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // This is required for Neon
  }
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end()
};
