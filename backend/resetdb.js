require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function reset() {
  try {
    await pool.query('TRUNCATE TABLE leads;');
    console.log('Database cleared successfully!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await pool.end();
  }
}

reset();