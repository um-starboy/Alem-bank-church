const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err)
  process.exit(-1)
})

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('✅ PostgreSQL connected:', result.rows[0].now)
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = { pool, testConnection }
