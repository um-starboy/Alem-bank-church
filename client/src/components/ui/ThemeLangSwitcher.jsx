import React from 'react'
import { motion } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'

const ThemeLangSwitcher = ({ setCursorVariant }) => {
  const { theme, lang, toggleTheme, toggleLang } = useTheme()

  return (
    <div className="flex items-center gap-2">
      {/* Language toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLang}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300"
        style={{
          background: 'var(--accent-bg)',
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
        }}
        aria-label={`Switch to ${lang === 'am' ? 'English' : 'Amharic'}`}
        onMouseEnter={() => setCursorVariant?.('button')}
        onMouseLeave={() => setCursorVariant?.('default')}
      >
        <span className={`transition-all duration-300 ${lang === 'am' ? 'opacity-100' : 'opacity-40'}`}>አማ</span>
        <span style={{ color: 'var(--text-faint)' }}>|</span>
        <span className={`transition-all duration-300 ${lang === 'en' ? 'opacity-100' : 'opacity-40'}`}>EN</span>
      </motion.button>

      {/* Theme toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300"
        style={{
          background: 'var(--accent-bg)',
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
        }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onMouseEnter={() => setCursorVariant?.('button')}
        onMouseLeave={() => setCursorVariant?.('default')}
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'dark' ? 0 : 180, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        >
          {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
        </motion.div>
      </motion.button>
    </div>
  )
}

export default ThemeLangSwitcher
