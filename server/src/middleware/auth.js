const { verifyAccessToken } = require('../utils/jwt')
const { pool } = require('../db/pool')

// ── Verify JWT ────────────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    // Verify user still exists and is active
    const result = await pool.query(
      'SELECT id, username, email, role, full_name, is_active FROM users WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    next(err)
  }
}

module.exports = { authenticate }
