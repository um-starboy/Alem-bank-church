require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { testConnection } = require('./db/pool')

const app = express()
const PORT = process.env.PORT || 5000

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Strict limit on auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'Too many requests. Please slow down.' },
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/upload',  require('./routes/upload'))
app.use('/api/users',   require('./routes/users'))
app.use('/api',         require('./routes/content'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await testConnection()
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV}`)
    console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`)
    console.log(`\nRoutes:`)
    console.log(`  POST   /api/auth/login`)
    console.log(`  POST   /api/auth/logout`)
    console.log(`  POST   /api/auth/refresh`)
    console.log(`  GET    /api/auth/me`)
    console.log(`  GET    /api/users         (superadmin)`)
    console.log(`  POST   /api/users         (superadmin)`)
    console.log(`  GET    /api/sermons        (public)`)
    console.log(`  POST   /api/sermons        (teacher+)`)
    console.log(`  GET    /api/events         (public)`)
    console.log(`  POST   /api/upload/gallery`)
  console.log(`  POST   /api/upload/hero`)
  console.log(`  POST   /api/upload/sermon-thumbnail`)
  console.log(`  GET    /api/upload/media`)
  console.log(`  GET    /health\n`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
