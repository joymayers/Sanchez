// Database Connection Configuration
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool for PostgreSQL
const poolConfig = {
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
};

// Only add password if it's provided
if (process.env.DATABASE_PASSWORD && process.env.DATABASE_PASSWORD.trim() !== '') {
  poolConfig.password = process.env.DATABASE_PASSWORD;
}

const pool = new Pool(poolConfig);

// Event listeners for debugging
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('✗ Database connection failed:', err);
  } else {
    console.log('✓ Database connection verified at:', res.rows[0].now);
  }
});

module.exports = pool;
