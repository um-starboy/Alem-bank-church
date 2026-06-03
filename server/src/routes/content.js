const express = require('express')
const { pool } = require('../db/pool')
const { authenticate } = require('../middleware/auth')
const { isPastorOrAbove, isTeacherOrAbove } = require('../middleware/roles')

const router = express.Router()

// ════════════════════════════════════════════════════════════════════════════
// CHURCH INFO
// ════════════════════════════════════════════════════════════════════════════

router.get('/church-info', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM church_info LIMIT 1')
    res.json(result.rows[0] || {})
  } catch (err) { res.status(500).json({ error: 'Failed to fetch church info' }) }
})

router.put('/church-info', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const {
      name, shortName, tagline, description, pastorName, pastorMessage,
      address, phone, email, facebookUrl, instagramUrl, youtubeUrl,
      telegramUrl, mapEmbedUrl,
    } = req.body
    const result = await pool.query(
      `UPDATE church_info SET
        name=$1, short_name=$2, tagline=$3, description=$4,
        pastor_name=$5, pastor_message=$6, address=$7, phone=$8,
        email=$9, facebook_url=$10, instagram_url=$11, youtube_url=$12,
        telegram_url=$13, map_embed_url=$14, updated_by=$15
       RETURNING *`,
      [name, shortName, tagline, description, pastorName, pastorMessage,
       address, phone, email, facebookUrl, instagramUrl, youtubeUrl,
       telegramUrl, mapEmbedUrl, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to update church info' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

router.get('/hero', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hero LIMIT 1')
    res.json(result.rows[0] || {})
  } catch (err) { res.status(500).json({ error: 'Failed to fetch hero' }) }
})

router.put('/hero', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { title, subtitle, primaryButtonText, primaryButtonLink,
            secondaryButtonText, secondaryButtonLink, backgroundType,
            backgroundImage, backgroundVideo } = req.body
    const result = await pool.query(
      `UPDATE hero SET title=$1, subtitle=$2, primary_button_text=$3,
        primary_button_link=$4, secondary_button_text=$5, secondary_button_link=$6,
        background_type=$7, background_image=$8, background_video=$9, updated_by=$10
       RETURNING *`,
      [title, subtitle, primaryButtonText, primaryButtonLink,
       secondaryButtonText, secondaryButtonLink, backgroundType,
       backgroundImage, backgroundVideo, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to update hero' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// ABOUT
// ════════════════════════════════════════════════════════════════════════════

router.get('/about', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about_sections ORDER BY section_key')
    // Convert array to object keyed by section_key
    const about = {}
    result.rows.forEach(row => { about[row.section_key] = row })
    res.json(about)
  } catch (err) { res.status(500).json({ error: 'Failed to fetch about' }) }
})

router.put('/about/:key', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { title, description, icon } = req.body
    const result = await pool.query(
      `UPDATE about_sections SET title=$1, description=$2, icon=$3, updated_by=$4
       WHERE section_key=$5 RETURNING *`,
      [title, description, icon, req.user.id, req.params.key]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Section not found' })
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to update about section' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// SERMONS
// ════════════════════════════════════════════════════════════════════════════

router.get('/sermons', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.full_name AS created_by_name
       FROM sermons s LEFT JOIN users u ON u.id = s.created_by
       WHERE s.is_published = true
       ORDER BY s.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: 'Failed to fetch sermons' }) }
})

router.post('/sermons', authenticate, isTeacherOrAbove, async (req, res) => {
  try {
    const { title, series, pastor, description, youtubeUrl, thumbnail } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const result = await pool.query(
      `INSERT INTO sermons (title, series, pastor, description, youtube_url, thumbnail, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, series, pastor, description, youtubeUrl, thumbnail || '🎥', req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to create sermon' }) }
})

router.put('/sermons/:id', authenticate, isTeacherOrAbove, async (req, res) => {
  try {
    const { title, series, pastor, description, youtubeUrl, thumbnail } = req.body
    const result = await pool.query(
      `UPDATE sermons SET title=$1, series=$2, pastor=$3, description=$4,
        youtube_url=$5, thumbnail=$6 WHERE id=$7 RETURNING *`,
      [title, series, pastor, description, youtubeUrl, thumbnail, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sermon not found' })
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to update sermon' }) }
})

router.delete('/sermons/:id', authenticate, isTeacherOrAbove, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sermons WHERE id=$1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sermon not found' })
    res.json({ message: 'Sermon deleted' })
  } catch (err) { res.status(500).json({ error: 'Failed to delete sermon' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════════════════════

router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events WHERE is_published = true ORDER BY is_featured DESC, event_date ASC`
    )
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: 'Failed to fetch events' }) }
})

router.post('/events', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, location, image, isFeatured } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const result = await pool.query(
      `INSERT INTO events (title, description, event_date, event_time, location, image, is_featured, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, eventDate, eventTime, location, image || '📅', isFeatured || false, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to create event' }) }
})

router.put('/events/:id', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, location, image, isFeatured } = req.body
    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, event_date=$3, event_time=$4,
        location=$5, image=$6, is_featured=$7 WHERE id=$8 RETURNING *`,
      [title, description, eventDate, eventTime, location, image, isFeatured, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to update event' }) }
})

router.delete('/events/:id', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id=$1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
    res.json({ message: 'Event deleted' })
  } catch (err) { res.status(500).json({ error: 'Failed to delete event' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// MINISTRIES
// ════════════════════════════════════════════════════════════════════════════

router.get('/ministries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ministries WHERE is_published=true ORDER BY sort_order, created_at`
    )
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: 'Failed to fetch ministries' }) }
})

router.post('/ministries', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const result = await pool.query(
      `INSERT INTO ministries (name, description, icon, color, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, description, icon || '🔥', color || 'from-subtle-gold/20 to-deep-blue/20', req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to create ministry' }) }
})

router.put('/ministries/:id', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body
    const result = await pool.query(
      `UPDATE ministries SET name=$1, description=$2, icon=$3, color=$4 WHERE id=$5 RETURNING *`,
      [name, description, icon, color, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ministry not found' })
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to update ministry' }) }
})

router.delete('/ministries/:id', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ministries WHERE id=$1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ministry not found' })
    res.json({ message: 'Ministry deleted' })
  } catch (err) { res.status(500).json({ error: 'Failed to delete ministry' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// GALLERY
// ════════════════════════════════════════════════════════════════════════════

router.get('/gallery', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery ORDER BY sort_order, created_at DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: 'Failed to fetch gallery' }) }
})

router.post('/gallery', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const { src, alt, category } = req.body
    const result = await pool.query(
      `INSERT INTO gallery (src, alt, category, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [src || '🖼️', alt, category, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: 'Failed to add gallery item' }) }
})

router.delete('/gallery/:id', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gallery WHERE id=$1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Gallery item deleted' })
  } catch (err) { res.status(500).json({ error: 'Failed to delete gallery item' }) }
})

// ════════════════════════════════════════════════════════════════════════════
// PRAYER REQUESTS
// ════════════════════════════════════════════════════════════════════════════

// Public - anyone can submit, with optional pastor selector
router.post('/prayer', async (req, res) => {
  try {
    const { name, email, request, pastorId, isPrivate } = req.body
    if (!name || !request) return res.status(400).json({ error: 'Name and request are required' })

    // Validate pastorId if provided
    if (pastorId) {
      const pastor = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role IN ($2,$3)',
        [pastorId, 'pastor', 'superadmin']
      )
      if (pastor.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid pastor selected' })
      }
    }

    await pool.query(
      `INSERT INTO prayer_requests (name, email, request, pastor_id, is_private)
       VALUES ($1,$2,$3,$4,$5)`,
      [name, email, request, pastorId || null, isPrivate !== false]
    )
    res.status(201).json({ message: 'Prayer request submitted. We will be praying for you.' })
  } catch (err) {
    console.error('Prayer submit error:', err)
    res.status(500).json({ error: 'Failed to submit prayer request' })
  }
})

// Pastor/admin can view prayer requests
// Superadmin sees ALL; pastors see only ones addressed to them or with no pastor
router.get('/prayer', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    let query, params = []
    if (req.user.role === 'superadmin') {
      query = `SELECT pr.*, u.full_name AS pastor_name
               FROM prayer_requests pr
               LEFT JOIN users u ON u.id = pr.pastor_id
               ORDER BY pr.created_at DESC LIMIT 200`
    } else {
      // Pastor sees requests addressed to them OR with no pastor assigned
      query = `SELECT pr.*, u.full_name AS pastor_name
               FROM prayer_requests pr
               LEFT JOIN users u ON u.id = pr.pastor_id
               WHERE pr.pastor_id = $1 OR pr.pastor_id IS NULL
               ORDER BY pr.created_at DESC LIMIT 200`
      params = [req.user.id]
    }
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: 'Failed to fetch prayer requests' }) }
})

router.patch('/prayer/:id/read', authenticate, isPastorOrAbove, async (req, res) => {
  try {
    await pool.query('UPDATE prayer_requests SET is_read=true WHERE id=$1', [req.params.id])
    res.json({ message: 'Marked as read' })
  } catch (err) { res.status(500).json({ error: 'Server error' }) }
})

module.exports = router

// ── GET /api/pastors-list ─ Public: list pastors for prayer selector ───────────
// Returns all users with role pastor or superadmin (active + inactive)
// so the frontend can show active ones normally and inactive ones as disabled
router.get('/pastors-list', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, role, is_active, avatar_url
       FROM users
       WHERE role IN ('pastor','superadmin')
       ORDER BY is_active DESC, full_name ASC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pastors' })
  }
})
