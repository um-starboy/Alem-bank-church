import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiPlay } from 'react-icons/fi'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'

const SermonsSection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { lang } = useTheme()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="sermons" className="relative py-20 md:py-32" style={{ background: 'var(--bg-alt)' }}>
      <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">
            {tx(t.sermons.title, lang)}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'var(--text-muted)' }}>
            {tx(t.sermons.subtitle, lang)}
          </motion.p>
        </div>

        {churchData.sermons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {churchData.sermons.slice(0, 6).map((sermon, i) => (
              <motion.div key={sermon.id} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group glass rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                onMouseEnter={() => setCursorVariant('text')} onMouseLeave={() => setCursorVariant('default')}>
                <div className="relative h-48 flex items-center justify-center text-6xl"
                  style={{ background: 'linear-gradient(135deg, var(--bg), var(--accent-bg))' }}>
                  <span className="transform group-hover:scale-125 transition-transform duration-500">{sermon.thumbnail || '🎥'}</span>
                  {sermon.youtubeUrl && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Watch sermon">
                        <FiPlay className="text-4xl text-white" />
                      </a>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {sermon.series && <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>{sermon.series}</div>}
                  <h3 className="text-lg font-display font-semibold mb-2 transition-colors duration-300 group-hover:text-[var(--accent)]"
                    style={{ color: 'var(--text)' }}>{sermon.title}</h3>
                  {sermon.description && <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{sermon.description}</p>}
                  {sermon.pastor && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{sermon.pastor}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-faint)' }}>
            <p className="text-lg">{tx(t.sermons.empty, lang)}</p>
            <p className="text-sm mt-2">{tx(t.sermons.emptySub, lang)}</p>
          </div>
        )}
      </motion.div>
    </section>
  )
}
export default SermonsSection
