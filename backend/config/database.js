const { Pool } = require('pg');


const pool = new Pool({
  host: 'dpg-d4nkg0vgi27c73bi8m4g-a.oregon-postgres.render.com',
  port: '5432',
  database: 'novus_aagf',
  user: 'novus',
  password: 'bSq3YcHVjXhnSlgHgvPoVRlJilboq6Z3',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    require: true,           // Require SSL
    rejectUnauthorized: false // Allow self-signed certificates
  }
  
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;