require('dotenv').config()
const bcrypt = require('bcryptjs')
const { pool, testConnection } = require('./pool')

const seed = async () => {
  await testConnection()

  const { SEED_ADMIN_USERNAME, SEED_ADMIN_PASSWORD, SEED_ADMIN_EMAIL } = process.env

  if (!SEED_ADMIN_USERNAME || !SEED_ADMIN_PASSWORD || !SEED_ADMIN_EMAIL) {
    console.error('❌ Missing SEED_ADMIN_* env vars. Check your .env file.')
    process.exit(1)
  }

  // Check if superadmin already exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE role = $1 LIMIT 1',
    ['superadmin']
  )

  if (existing.rows.length > 0) {
    console.log('ℹ️  Superadmin already exists. Skipping seed.')
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12)

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, 'superadmin')
     RETURNING id, username, email, role`,
    [SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, passwordHash, 'Super Admin']
  )

  console.log('✅ Superadmin created:', result.rows[0])
  console.log('⚠️  Change your password immediately after first login!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
