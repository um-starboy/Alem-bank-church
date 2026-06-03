// Role hierarchy: superadmin > pastor > teacher
const ROLE_LEVELS = { superadmin: 3, pastor: 2, teacher: 1 }

// Require a specific minimum role level
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const userLevel = ROLE_LEVELS[req.user.role] || 0
    const requiredLevel = Math.max(...roles.map(r => ROLE_LEVELS[r] || 0))

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        yours: req.user.role,
      })
    }

    next()
  }
}

const isSuperAdmin  = requireRole('superadmin')
const isPastorOrAbove = requireRole('pastor')
const isTeacherOrAbove = requireRole('teacher')

module.exports = { requireRole, isSuperAdmin, isPastorOrAbove, isTeacherOrAbove }
