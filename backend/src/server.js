// backend/src/server.js
require('dotenv').config();
const app = require('./app');
const { checkConnection } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Fail fast on boot if the database isn't reachable, rather than
    // letting the server come up "healthy" and fail on the first request.
    await checkConnection();
    console.log('Connected to PostgreSQL.');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server — database connection failed:', err.message);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));