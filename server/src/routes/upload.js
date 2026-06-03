const express = require('express')
const { pool } = require('../db/pool')
const { authenticate } = require('../middleware/auth')
const { isPastorOrAbove, isTeacherOrAbove } = require('../middleware/roles')
const {
  uploadGallery,
  uploadHero,
  uploadSermonThumb,
  uploadGeneral,
  deleteFromCloudinary,
} = require('../utils/cloudinary')

const router = express.Router()

// All upload routes require authentication
router.use(authenticate)

// ── Helper: save media record to DB ──────────────────────────────────────────
const saveMediaRecord = async (file, folder, userId) => {
  const isVideo = file.mimetype?.startsWith('video/') || file.resource_type === 'video'
  const cloudinaryData = file.cloudinaryData || {}

  // Get thumbnail URL for video (from eager transform)
  let thumbnailUrl = null
  if (isVideo && cloudinaryData.eager && cloudinaryData.eager[0]) {
    thumbnailUrl = cloudinaryData.eager[0].secure_url
  }

  const result = await pool.query(
    `INSERT INTO media
       (public_id, url, thumbnail_url, resource_type, original_name,
        width, height, size_bytes, folder, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      file.filename || file.public_id,
      file.path || file.secure_url,
      thumbnailUrl,
      isVideo ? 'video' : 'image',
      file.originalname,
      file.width || null,
      file.height || null,
      file.size || null,
      folder,
      userId,
    ]
  )
  return result.rows[0]
}

// ── POST /api/upload/gallery ─ Upload image or video to gallery ───────────────
router.post('/gallery', isPastorOrAbove, (req, res, next) => {
  uploadGallery.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    try {
      const isVideo = req.file.mimetype?.startsWith('video/')
      const mediaRecord = await saveMediaRecord(req.file, 'gallery', req.user.id)

      // Also insert into gallery table
      const galleryResult = await pool.query(
        `INSERT INTO gallery
           (src, alt, category, media_url, media_type, cloudinary_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          isVideo ? '🎥' : '🖼️',
          req.body.alt || 'Gallery item',
          req.body.category || 'General',
          req.file.path,
          isVideo ? 'video' : 'image',
          req.file.filename,
          req.user.id,
        ]
      )

      res.status(201).json({
        gallery: galleryResult.rows[0],
        media: mediaRecord,
        url: req.file.path,
        thumbnailUrl: mediaRecord.thumbnail_url,
        resourceType: isVideo ? 'video' : 'image',
      })
    } catch (err) {
      console.error('Gallery upload error:', err)
      res.status(500).json({ error: 'Failed to save upload record' })
    }
  })
})

// ── POST /api/upload/hero ─ Upload hero background image or video ─────────────
router.post('/hero', isPastorOrAbove, (req, res, next) => {
  uploadHero.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    try {
      const isVideo = req.file.mimetype?.startsWith('video/')

      // Update hero table with the new background
      await pool.query(
        `UPDATE hero SET
           background_type = $1,
           background_image = $2,
           background_video = $3,
           background_cloudinary_id = $4,
           updated_by = $5`,
        [
          isVideo ? 'video' : 'image',
          isVideo ? null : req.file.path,
          isVideo ? req.file.path : null,
          req.file.filename,
          req.user.id,
        ]
      )

      await saveMediaRecord(req.file, 'hero', req.user.id)

      res.json({
        url: req.file.path,
        resourceType: isVideo ? 'video' : 'image',
        backgroundType: isVideo ? 'video' : 'image',
        message: 'Hero background updated',
      })
    } catch (err) {
      console.error('Hero upload error:', err)
      res.status(500).json({ error: 'Failed to update hero background' })
    }
  })
})

// ── POST /api/upload/sermon-thumbnail ─ Upload sermon thumbnail image ─────────
router.post('/sermon-thumbnail', isTeacherOrAbove, (req, res, next) => {
  uploadSermonThumb.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    try {
      const { sermonId } = req.body

      if (sermonId) {
        await pool.query(
          `UPDATE sermons SET
             thumbnail_url = $1,
             thumbnail_cloudinary_id = $2
           WHERE id = $3`,
          [req.file.path, req.file.filename, sermonId]
        )
      }

      await saveMediaRecord(req.file, 'sermons', req.user.id)

      res.json({
        url: req.file.path,
        cloudinaryId: req.file.filename,
        message: 'Sermon thumbnail uploaded',
      })
    } catch (err) {
      console.error('Sermon thumbnail upload error:', err)
      res.status(500).json({ error: 'Failed to upload sermon thumbnail' })
    }
  })
})

// ── POST /api/upload/general ─ General image upload (church logo etc) ─────────
router.post('/general', isPastorOrAbove, (req, res, next) => {
  uploadGeneral.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    try {
      await saveMediaRecord(req.file, 'general', req.user.id)
      res.json({
        url: req.file.path,
        cloudinaryId: req.file.filename,
      })
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload' })
    }
  })
})

// ── GET /api/upload/media ─ List all uploaded media ───────────────────────────
router.get('/media', isPastorOrAbove, async (req, res) => {
  try {
    const { folder, type } = req.query
    let query = `SELECT m.*, u.full_name as uploaded_by_name
                 FROM media m
                 LEFT JOIN users u ON u.id = m.uploaded_by
                 WHERE 1=1`
    const params = []

    if (folder) { params.push(folder); query += ` AND m.folder = $${params.length}` }
    if (type)   { params.push(type);   query += ` AND m.resource_type = $${params.length}` }

    query += ' ORDER BY m.created_at DESC LIMIT 200'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media' })
  }
})

// ── DELETE /api/upload/media/:id ─ Delete media from Cloudinary + DB ──────────
router.delete('/media/:id', isPastorOrAbove, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM media WHERE id = $1',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' })
    }

    const media = result.rows[0]

    // Delete from Cloudinary
    await deleteFromCloudinary(media.public_id, media.resource_type)

    // Delete from DB
    await pool.query('DELETE FROM media WHERE id = $1', [req.params.id])

    res.json({ message: 'Media deleted from Cloudinary and database' })
  } catch (err) {
    console.error('Media delete error:', err)
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

module.exports = router
