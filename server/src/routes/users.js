const express = require('express')
const bcrypt = require('bcryptjs')
const { pool } = require('../db/pool')
const { authenticate } = require('../middleware/auth')
const { isSuperAdmin, isPastorOrAbove } = require('../middleware/roles')

const router = express.Router()

// All user management routes require authentication
router.use(authenticate)

// ── GET /api/users ─ List all users (superadmin only) ────────────────────────
router.get('/', isSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, full_name, role, is_active, avatar_url,
              created_at, last_login,
              (SELECT full_name FROM users u2 WHERE u2.id = users.created_by) AS created_by_name
       FROM users
       ORDER BY
         CASE role WHEN 'superadmin' THEN 1 WHEN 'pastor' THEN 2 WHEN 'teacher' THEN 3 END,
         created_at ASC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// ── GET /api/users/:id ─ Get single user ─────────────────────────────────────
router.get('/:id', isSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, full_name, role, is_active, avatar_url, created_at, last_login
       FROM users WHERE id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// ── POST /api/users ─ Create a new pastor or teacher (superadmin only) ───────
router.post('/', isSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body

    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required: username, email, password, fullName, role' })
    }

    if (!['pastor', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either pastor or teacher' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    // Check username and email uniqueness
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username.toLowerCase(), email.toLowerCase()]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [
        username.toLowerCase().trim(),
        email.toLowerCase().trim(),
        passwordHash,
        fullName.trim(),
        role,
        req.user.id,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Create user error:', err)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// ── PUT /api/users/:id ─ Update user info (superadmin only) ──────────────────
router.put('/:id', isSuperAdmin, async (req, res) => {
  try {
    const { fullName, role, email, isActive } = req.body

    // Prevent demoting the last superadmin
    if (role && role !== 'superadmin') {
      const saCount = await pool.query(
        `SELECT COUNT(*) FROM users WHERE role = 'superadmin' AND is_active = true AND id != $1`,
        [req.params.id]
      )
      if (parseInt(saCount.rows[0].count) === 0) {
        const target = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id])
        if (target.rows[0]?.role === 'superadmin') {
          return res.status(400).json({ error: 'Cannot demote the only superadmin' })
        }
      }
    }

    const result = await pool.query(
      `UPDATE users SET
         full_name  = COALESCE($1, full_name),
         role       = COALESCE($2, role),
         email      = COALESCE($3, email),
         is_active  = COALESCE($4, is_active),
         updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, email, full_name, role, is_active`,
      [fullName, role, email?.toLowerCase(), isActive, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// ── DELETE /api/users/:id ─ Delete a user (superadmin only) ──────────────────
router.delete('/:id', isSuperAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }

    // Prevent deleting last superadmin
    const target = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id])
    if (target.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (target.rows[0].role === 'superadmin') {
      const saCount = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'superadmin' AND is_active = true`)
      if (parseInt(saCount.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only superadmin' })
      }
    }

    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// ── POST /api/users/:id/reset-password ─ Admin resets someone's password ─────
router.post('/:id/reset-password', isSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    const hash = await bcrypt.hash(newPassword, 12)
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hash, req.params.id]
    )

    // Revoke their tokens so they must log in fresh
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.params.id])

    res.json({ message: 'Password reset successfully. User must log in again.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

module.exports = router

// ── PATCH /api/users/:id/toggle-active ─ Activate or deactivate a user ───────
router.patch('/:id/toggle-active', isSuperAdmin, async (req, res) => {
  try {
    // Prevent deactivating yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' })
    }

    // Get current status
    const current = await pool.query(
      'SELECT id, role, is_active, full_name FROM users WHERE id = $1',
      [req.params.id]
    )
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = current.rows[0]

    // Prevent deactivating the last active superadmin
    if (user.role === 'superadmin' && user.is_active) {
      const activeSA = await pool.query(
        `SELECT COUNT(*) FROM users WHERE role='superadmin' AND is_active=true`
      )
      if (parseInt(activeSA.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the only active superadmin' })
      }
    }

    const newStatus = !user.is_active
    const result = await pool.query(
      `UPDATE users SET is_active=$1 WHERE id=$2
       RETURNING id, full_name, role, is_active`,
      [newStatus, req.params.id]
    )

    // If deactivating, revoke all their tokens
    if (!newStatus) {
      await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [req.params.id])
    }

    res.json({
      ...result.rows[0],
      message: `${user.full_name} has been ${newStatus ? 'activated' : 'deactivated'}`,
    })
  } catch (err) {
    console.error('Toggle active error:', err)
    res.status(500).json({ error: 'Failed to toggle user status' })
  }
})
