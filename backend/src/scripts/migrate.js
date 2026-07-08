require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function migrate() {
  const schemaPath = path.resolve(__dirname, '..', '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const client = new Client(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
        }
      : {
          host: process.env.PGHOST || 'localhost',
          port: Number(process.env.PGPORT) || 5432,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          database: process.env.PGDATABASE,
        }
  );

  await client.connect();

  try {
    await client.query(schema);
    console.log('Database schema applied.');
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error('Database migration failed:', err.message);
  process.exit(1);
});
