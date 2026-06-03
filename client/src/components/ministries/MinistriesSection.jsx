import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'

const MinistriesSection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { lang } = useTheme()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="ministries" className="relative py-20 md:py-32" style={{ background: 'var(--bg-alt)' }}>
      <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">{tx(t.ministries.title, lang)}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'var(--text-muted)' }}>{tx(t.ministries.subtitle, lang)}</motion.p>
        </div>
        {churchData.ministries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {churchData.ministries.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group relative overflow-hidden rounded-2xl p-8 cursor-pointer glass transition-all duration-500"
                onMouseEnter={() => setCursorVariant('text')} onMouseLeave={() => setCursorVariant('default')}>
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color || ''} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="text-5xl mb-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">{m.icon || '🔥'}</div>
                  <h3 className="text-xl font-display font-semibold mb-3 transition-colors group-hover:text-[var(--accent)]"
                    style={{ color: 'var(--text)' }}>{m.name}</h3>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>{m.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-faint)' }}>
            <p>{tx(t.ministries.empty, lang)}</p>
          </div>
        )}
      </motion.div>
    </section>
  )
}
export default MinistriesSection
