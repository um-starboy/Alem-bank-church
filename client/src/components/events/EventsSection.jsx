import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiCalendar, FiMapPin, FiClock, FiStar } from 'react-icons/fi'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'

const EventsSection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { lang } = useTheme()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="events" className="relative py-20 md:py-32 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="cinematic-light w-[400px] h-[400px] bottom-0 left-0" style={{ background: 'var(--accent-hover)' }} />
      <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">
            {tx(t.events.title, lang)}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'var(--text-muted)' }}>{tx(t.events.subtitle, lang)}</motion.p>
        </div>

        {churchData.events.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {churchData.events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group glass p-6 md:p-8 rounded-2xl transition-all duration-500"
                onMouseEnter={() => setCursorVariant('text')} onMouseLeave={() => setCursorVariant('default')}>
                <div className="flex items-start gap-5">
                  <div className="text-5xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-500">{event.image || '📅'}</div>
                  <div className="flex-1 min-w-0">
                    {event.featured && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mb-2"
                        style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                        <FiStar size={10} />{tx(t.events.featured, lang)}
                      </span>
                    )}
                    <h3 className="text-xl font-display font-semibold mb-2 transition-colors group-hover:text-[var(--accent)]"
                      style={{ color: 'var(--text)' }}>{event.title}</h3>
                    {event.description && <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{event.description}</p>}
                    <div className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {event.date && <div className="flex items-center gap-2"><FiCalendar style={{ color: 'var(--accent)' }} size={13} />{event.date}</div>}
                      {event.time && <div className="flex items-center gap-2"><FiClock style={{ color: 'var(--accent)' }} size={13} />{event.time}</div>}
                      {event.location && <div className="flex items-center gap-2"><FiMapPin style={{ color: 'var(--accent)' }} size={13} />{event.location}</div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-faint)' }}>
            <p className="text-lg">{tx(t.events.empty, lang)}</p>
          </div>
        )}
      </motion.div>
    </section>
  )
}
export default EventsSection
