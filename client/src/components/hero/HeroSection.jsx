import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowDown, FiPlay } from 'react-icons/fi'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'

const HeroSection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { hero } = churchData
  const { lang } = useTheme()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33,1,0.68,1] } },
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {hero.backgroundType === 'image' && hero.backgroundImage && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero.backgroundImage})` }} />
      )}
      {hero.backgroundType === 'video' && hero.backgroundVideo && (
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={hero.backgroundVideo} type="video/mp4" />
        </video>
      )}

      <div className="cinematic-light w-[600px] h-[600px] top-1/4 -left-1/4" style={{ background: 'var(--accent)' }} />
      <div className="cinematic-light w-[400px] h-[400px] bottom-1/4 -right-1/4" style={{ background: 'var(--accent-hover)' }} />
      <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, var(--bg) / 0.7, transparent, var(--bg))' }} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 text-center py-20">
        <motion.div variants={itemVariants} className="mb-8">
          {/* Logo in hero */}
          <div className="flex justify-center mb-8">
            <img src="/church-logo.jpg" alt="Church logo"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
              style={{ border: '3px solid var(--accent)', boxShadow: '0 0 40px rgba(201,169,110,0.3)' }} />
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold gradient-text leading-none mb-4">
            {hero.title}
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-accent" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {hero.subtitle}
          </h2>
        </motion.div>

        <motion.p variants={itemVariants} className="text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed px-4"
          style={{ color: 'var(--text-muted)' }}>
          {tx(t.hero.tagline, lang)}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {hero.primaryButtonText && (
            <a href={hero.primaryButtonLink}
              className="group w-full sm:w-auto px-8 py-4 font-semibold rounded-lg text-center transition-all duration-300 hover:scale-105"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              {lang === 'am' ? tx(t.hero.joinUs, lang) : hero.primaryButtonText}
            </a>
          )}
          {hero.secondaryButtonText && (
            <a href={hero.secondaryButtonLink}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-lg transition-all duration-300"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--text)' }}
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              <FiPlay style={{ color: 'var(--accent)' }} />
              <span>{lang === 'am' ? tx(t.hero.watchLive, lang) : hero.secondaryButtonText}</span>
            </a>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <FiArrowDown style={{ color: 'var(--text-faint)', fontSize: '1.5rem' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
export default HeroSection
