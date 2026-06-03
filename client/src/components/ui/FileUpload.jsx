import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiX, FiImage, FiVideo, FiCheck, FiAlertCircle } from 'react-icons/fi'

// accept: 'image' | 'video' | 'both'
const FileUpload = ({
  accept = 'image',
  onUpload,           // async fn(file) => { url, ... }
  label = 'Upload File',
  hint,
  currentUrl,         // existing preview URL
  currentType = 'image',
  maxSizeMB = 10,
  setCursorVariant,
  className = '',
}) => {
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(currentUrl || null)
  const [previewType, setPreviewType] = useState(currentType)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRef = useRef(null)

  const acceptStr = accept === 'image'
    ? 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
    : accept === 'video'
    ? 'video/mp4,video/quicktime,video/webm'
    : 'image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm'

  const validate = (file) => {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `File too large. Max size is ${maxSizeMB}MB.`
    }
    if (accept === 'image' && !file.type.startsWith('image/')) {
      return 'Only image files are allowed.'
    }
    if (accept === 'video' && !file.type.startsWith('video/')) {
      return 'Only video files are allowed.'
    }
    return null
  }

  const handleFile = useCallback(async (file) => {
    setError('')
    setSuccess(false)

    const validationError = validate(file)
    if (validationError) { setError(validationError); return }

    // Show local preview immediately
    const isVideo = file.type.startsWith('video/')
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setPreviewType(isVideo ? 'video' : 'image')

    setUploading(true)
    setProgress(10)

    try {
      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85))
      }, 300)

      const result = await onUpload(file)

      clearInterval(progressInterval)
      setProgress(100)

      // Update preview to Cloudinary URL
      if (result?.url) {
        setPreview(result.url)
        setPreviewType(result.resourceType || (isVideo ? 'video' : 'image'))
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Upload failed')
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [onUpload, currentUrl, accept, maxSizeMB])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  const clearPreview = () => {
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden"
        style={{
          borderColor: dragging ? 'var(--accent)' : error ? 'rgba(239,68,68,0.4)' : 'var(--border)',
          background: dragging ? 'var(--accent-bg)' : 'var(--surface)',
          minHeight: preview ? 'auto' : '140px',
        }}
        onMouseEnter={() => setCursorVariant?.('button')}
        onMouseLeave={() => setCursorVariant?.('default')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptStr}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        {/* Preview */}
        {preview ? (
          <div className="relative">
            {previewType === 'video' ? (
              <video src={preview} className="w-full max-h-64 object-cover rounded-xl"
                controls muted preload="metadata" />
            ) : (
              <img src={preview} alt="Preview"
                className="w-full max-h-64 object-cover rounded-xl" />
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <p className="text-white text-sm font-medium">Click to replace</p>
            </div>
            {/* Clear button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearPreview() }}
              className="absolute top-2 right-2 p-1.5 rounded-full transition-all"
              style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex gap-3 mb-3">
              {(accept === 'image' || accept === 'both') && (
                <FiImage size={28} style={{ color: 'var(--accent)' }} />
              )}
              {(accept === 'video' || accept === 'both') && (
                <FiVideo size={28} style={{ color: 'var(--accent)' }} />
              )}
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              {dragging ? 'Drop it here!' : `Drag & drop or click to upload`}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {hint || `Max ${maxSizeMB}MB${accept === 'both' ? ' · Image or Video' : ''}`}
            </p>
          </div>
        )}

        {/* Upload progress overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
              style={{ background: 'rgba(0,0,0,0.75)' }}>
              <div className="w-32 h-1.5 rounded-full mb-3 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'var(--accent)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }} />
              </div>
              <p className="text-white text-sm">Uploading... {progress}%</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status messages */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs mt-2"
            style={{ color: '#f87171' }}>
            <FiAlertCircle size={13} />{error}
          </motion.p>
        )}
        {success && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs mt-2"
            style={{ color: '#4ade80' }}>
            <FiCheck size={13} />Uploaded successfully!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
