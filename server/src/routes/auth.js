const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db/pool')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username or email
    const result = await pool.query(
      `SELECT id, username, email, password_hash, role, full_name, avatar_url, is_active
       FROM users WHERE (username = $1 OR email = $1)`,
      [username.toLowerCase().trim()]
    )

    const user = result.rows[0]

    if (!user) {
      // Use same message for both not-found and wrong-password to prevent enumeration
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact the admin.' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Generate tokens
    const accessToken  = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user.id)

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    )

    // Update last login
    await pool.query(
      `UPDATE users SET last_login = NOW() WHERE id = $1`,
      [user.id]
    )

    res.json({
      accessToken,
      refreshToken,
      user: {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        fullName:  user.full_name,
        role:      user.role,
        avatarUrl: user.avatar_url,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login' })
  }
})

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }

    // Verify signature
    const decoded = verifyRefreshToken(refreshToken)

    // Check token exists in DB and not expired
    const tokenRow = await pool.query(
      `SELECT rt.id, rt.user_id, rt.expires_at, u.id, u.username, u.email, u.role, u.full_name, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1`,
      [refreshToken]
    )

    if (tokenRow.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const row = tokenRow.rows[0]

    if (new Date(row.expires_at) < new Date()) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
      return res.status(401).json({ error: 'Refresh token expired. Please log in again.' })
    }

    if (!row.is_active) {
      return res.status(403).json({ error: 'Account deactivated' })
    }

    const newAccessToken = generateAccessToken({
      id: row.user_id,
      username: row.username,
      email: row.email,
      role: row.role,
    })

    res.json({ accessToken: newAccessToken })
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
    console.error('Refresh error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    }
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  res.json({
    id:        req.user.id,
    username:  req.user.username,
    email:     req.user.email,
    fullName:  req.user.full_name,
    role:      req.user.role,
  })
})

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    )

    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, req.user.id]
    )

    // Invalidate all existing refresh tokens for security
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id])

    res.json({ message: 'Password changed successfully. Please log in again.' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
