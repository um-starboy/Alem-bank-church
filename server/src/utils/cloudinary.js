const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Storage factory ───────────────────────────────────────────────────────────
// folder: 'gallery' | 'hero' | 'sermons' | 'general'
const makeStorage = (folder, allowVideo = false) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video/')
      return {
        folder: `alem-bank-church/${folder}`,
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: allowVideo
          ? ['jpg','jpeg','png','webp','gif','mp4','mov','webm']
          : ['jpg','jpeg','png','webp','gif'],
        transformation: isVideo
          ? [{ quality: 'auto' }]
          : [{ quality: 'auto', fetch_format: 'auto' }],
        // Generate eager thumbnail for videos
        eager: isVideo
          ? [{ width: 400, height: 300, crop: 'fill', format: 'jpg' }]
          : undefined,
        eager_async: true,
      }
    },
  })
}

// ── File filter ───────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'), false)
  }
}

const mediaFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg','image/jpg','image/png','image/webp','image/gif',
    'video/mp4','video/quicktime','video/webm',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image or video files allowed'), false)
  }
}

// ── Multer instances ──────────────────────────────────────────────────────────
const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB

const uploadGallery = multer({
  storage: makeStorage('gallery', true),
  fileFilter: mediaFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
})

const uploadHero = multer({
  storage: makeStorage('hero', true),
  fileFilter: mediaFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
})

const uploadSermonThumb = multer({
  storage: makeStorage('sermons', false),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
})

const uploadGeneral = multer({
  storage: makeStorage('general', false),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
})

// ── Delete from Cloudinary ────────────────────────────────────────────────────
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return result
  } catch (err) {
    console.error('Cloudinary delete error:', err)
    throw err
  }
}

module.exports = {
  cloudinary,
  uploadGallery,
  uploadHero,
  uploadSermonThumb,
  uploadGeneral,
  deleteFromCloudinary,
}
