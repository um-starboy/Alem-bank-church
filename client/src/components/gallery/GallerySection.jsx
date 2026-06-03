import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'

const GallerySection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { gallery } = churchData
  const { lang } = useTheme()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = useCallback((i) => {
    setCurrentIndex(i); setSelectedImage(gallery[i]); document.body.style.overflow = 'hidden'
  }, [gallery])
  const closeLightbox = useCallback(() => { setSelectedImage(null); document.body.style.overflow = '' }, [])
  const nextImage = useCallback(() => setCurrentIndex(p => { const n = (p+1)%gallery.length; setSelectedImage(gallery[n]); return n }), [gallery])
  const prevImage = useCallback(() => setCurrentIndex(p => { const n = (p-1+gallery.length)%gallery.length; setSelectedImage(gallery[n]); return n }), [gallery])

  useEffect(() => {
    if (!selectedImage) return
    const h = (e) => { if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowRight') nextImage(); if(e.key==='ArrowLeft') prevImage() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [selectedImage, closeLightbox, nextImage, prevImage])
  useEffect(() => () => { document.body.style.overflow = '' }, [])

  return (
    <section id="gallery" className="relative py-20 md:py-32 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">{tx(t.gallery.title, lang)}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'var(--text-muted)' }}>{tx(t.gallery.subtitle, lang)}</motion.p>
        </div>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {gallery.map((img, i) => (
              <motion.button key={img.id} initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative aspect-square rounded-2xl overflow-hidden focus:outline-none"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}
                onClick={() => openLightbox(i)} aria-label={`View ${img.alt}`}>
                <div className="absolute inset-0 flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110">{img.src}</div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4"
                  style={{ background: 'rgba(0,0,0,0.65)' }}>
                  <FiMaximize2 className="text-white/70 mb-2" size={22} />
                  <p className="text-white text-sm font-medium text-center line-clamp-2">{img.alt}</p>
                  <span className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{img.category}</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-faint)' }}><p>{tx(t.gallery.empty, lang)}</p></div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
            onClick={closeLightbox}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative glass-strong rounded-2xl p-8 text-center max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={closeLightbox} className="absolute top-3 right-3 p-2 rounded-lg glass transition-all" aria-label="Close"><FiX size={18} style={{ color: 'var(--text-muted)' }} /></button>
              <div className="text-8xl mb-4">{selectedImage.src}</div>
              <h3 className="font-display font-semibold text-xl mb-1" style={{ color: 'var(--text)' }}>{selectedImage.alt}</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--accent)' }}>{selectedImage.category}</p>
              {gallery.length > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button onClick={prevImage} className="p-3 glass rounded-full transition-all" aria-label="Previous"><FiChevronLeft size={18} style={{ color: 'var(--text-muted)' }} /></button>
                  <span className="text-sm" style={{ color: 'var(--text-faint)' }}>{currentIndex+1} / {gallery.length}</span>
                  <button onClick={nextImage} className="p-3 glass rounded-full transition-all" aria-label="Next"><FiChevronRight size={18} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
export default GallerySection
