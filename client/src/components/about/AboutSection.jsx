import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'

const AboutSection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { about, churchInfo } = churchData
  const { lang } = useTheme()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const cardV = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33,1,0.68,1] } },
  }

  const pillars = ['mission','vision','story'].map(k => ({ key: k, ...about[k] })).filter(p => p.description)

  return (
    <section id="about" className="relative py-20 md:py-32 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="cinematic-light w-[500px] h-[500px] top-0 right-0" style={{ background: 'var(--accent)' }} />
      <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.15 } }, hidden: { opacity: 0 } }}
        className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div variants={cardV} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">{tx(t.about.title, lang)}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{tx(t.about.subtitle, lang)}</p>
        </motion.div>

        {pillars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {pillars.map((p) => (
              <motion.div key={p.key} variants={cardV} className="group glass p-8 rounded-2xl transition-all duration-500"
                onMouseEnter={() => setCursorVariant('text')} onMouseLeave={() => setCursorVariant('default')}>
                <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-500">{p.icon}</div>
                <h3 className="text-xl font-display font-semibold mb-3" style={{ color: 'var(--text)' }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
              </motion.div>
            ))}
          </div>
        )}

        {churchInfo.pastorMessage && (
          <motion.div variants={cardV} className="glass-strong p-8 md:p-10 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: '3px solid var(--accent)' }}>
                <img src="/church-logo.jpg" alt="Pastor" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-display font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  {tx(t.about.pastorTitle, lang)}
                </h3>
                <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{churchInfo.pastorMessage}"
                </p>
                {churchInfo.pastorName && (
                  <p className="font-semibold" style={{ color: 'var(--accent)' }}>— {churchInfo.pastorName}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
export default AboutSection
