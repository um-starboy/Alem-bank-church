import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiHome } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { t, tx } from '../utils/translations'

const NotFoundPage = ({ setCursorVariant }) => {
  const { lang } = useTheme()
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold gradient-text leading-none mb-4"
          style={{ fontSize: 'clamp(100px, 20vw, 160px)' }}>404</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="text-2xl md:text-3xl font-display font-semibold mb-4" style={{ color: 'var(--text)' }}>
            {tx(t.notFound.title, lang)}
          </h1>
          <p className="mb-10 text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {tx(t.notFound.message, lang)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" className="flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              <FiHome size={18} />{tx(t.notFound.goHome, lang)}
            </Link>
            <button onClick={() => window.history.back()}
              className="flex items-center gap-2 px-8 py-4 glass rounded-lg transition-all duration-300"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              <FiArrowLeft size={18} />{tx(t.notFound.goBack, lang)}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
export default NotFoundPage
