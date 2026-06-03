import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { NAV_LINKS } from '../../utils/constants'
import { t, tx } from '../../utils/translations'
import ThemeLangSwitcher from '../ui/ThemeLangSwitcher'

const ChurchLogo = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return (
    <div className="flex items-center gap-3">
      <img src="/church-logo.jpg" alt="Church logo"
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 transition-all duration-300`}
        style={{ border: '2px solid var(--accent)', opacity: 0.95 }} />
      <span className="font-display font-bold gradient-text leading-tight hidden sm:block">
        አለም ባንክ ገነት
      </span>
    </div>
  )
}

const Navbar = ({ setCursorVariant }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { churchData } = useChurchData()
  const { lang } = useTheme()
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')
  const navRef = useRef(null)

  const navLabels = [
    { ...NAV_LINKS[0], label: tx(t.nav.home, lang) },
    { ...NAV_LINKS[1], label: tx(t.nav.about, lang) },
    { ...NAV_LINKS[2], label: tx(t.nav.sermons, lang) },
    { ...NAV_LINKS[3], label: tx(t.nav.events, lang) },
    { ...NAV_LINKS[4], label: tx(t.nav.ministries, lang) },
    { ...NAV_LINKS[5], label: tx(t.nav.gallery, lang) },
    { ...NAV_LINKS[6], label: tx(t.nav.contact, lang) },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      if (!isAdminPage && !isOpen) {
        const sections = NAV_LINKS.map(l => l.id)
        for (const section of [...sections].reverse()) {
          const el = document.getElementById(section)
          if (el && el.getBoundingClientRect().top <= 200) { setActiveSection(section); break }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAdminPage, isOpen])

  useEffect(() => { setIsOpen(false) }, [location])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && isOpen) setIsOpen(false) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen])
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleNavClick = useCallback((e, href) => {
    e.preventDefault(); setIsOpen(false)
    if (href.startsWith('#')) {
      const el = document.getElementById(href.substring(1))
      if (el) {
        const offset = el.getBoundingClientRect().top + window.pageYOffset - (navRef.current?.offsetHeight || 80) - 20
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    }
  }, [])

  const navBg = isScrolled
    ? 'var(--surface-strong)'
    : 'transparent'

  if (isAdminPage) return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 py-3"
      style={{ background: 'var(--surface-strong)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/"><ChurchLogo size="sm" /></Link>
        <div className="flex items-center gap-4">
          <ThemeLangSwitcher setCursorVariant={setCursorVariant} />
          <Link to="/" style={{ color: 'var(--text-muted)' }} className="text-sm hover:opacity-80 transition-opacity">
            {tx(t.nav.home, lang)} →
          </Link>
        </div>
      </div>
    </motion.nav>
  )

  return (
    <motion.nav ref={navRef} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: isScrolled ? 'var(--surface-strong)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent',
        paddingTop: isScrolled ? '10px' : '18px',
        paddingBottom: isScrolled ? '10px' : '18px',
      }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="relative z-50"
            onMouseEnter={() => setCursorVariant('link')} onMouseLeave={() => setCursorVariant('default')}>
            <ChurchLogo size={isScrolled ? 'sm' : 'md'} />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLabels.map((link) => (
              <a key={link.id} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 text-sm tracking-wide uppercase rounded-lg transition-all duration-300"
                style={{ color: activeSection === link.id ? 'var(--accent)' : 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; setCursorVariant('link') }}
                onMouseLeave={(e) => { e.currentTarget.style.color = activeSection === link.id ? 'var(--accent)' : 'var(--text-muted)'; setCursorVariant('default') }}>
                {link.label}
              </a>
            ))}
            <Link to="/admin" className="ml-2 px-4 py-2 rounded-lg text-sm tracking-wide uppercase transition-all duration-300 font-semibold"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--accent-bg)' }}
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              {tx(t.nav.admin, lang)}
            </Link>
            <div className="ml-3">
              <ThemeLangSwitcher setCursorVariant={setCursorVariant} />
            </div>
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeLangSwitcher setCursorVariant={setCursorVariant} />
            <button onClick={() => setIsOpen(!isOpen)} className="relative z-50 p-2 -mr-2"
              aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}
              style={{ color: 'var(--text)' }}>
              <div className="relative w-6 h-6">
                <motion.span animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="absolute top-0 left-0 w-6 h-0.5 origin-center" style={{ background: 'var(--text)' }} transition={{ duration: 0.3 }} />
                <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute top-[11px] left-0 w-6 h-0.5" style={{ background: 'var(--text)' }} transition={{ duration: 0.3 }} />
                <motion.span animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="absolute bottom-0 left-0 w-6 h-0.5 origin-center" style={{ background: 'var(--text)' }} transition={{ duration: 0.3 }} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden" style={{ background: 'var(--bg)', backdropFilter: 'blur(20px)' }}
            onClick={() => setIsOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full space-y-6 px-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 text-center">
                <img src="/church-logo.jpg" alt="Church logo"
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                  style={{ border: '2px solid var(--accent)' }} />
                <p className="text-xs tracking-wider" style={{ color: 'var(--text-faint)' }}>አለም ባንክ ገነት ቤተ ክርስቲያን</p>
              </div>
              {navLabels.map((link, index) => (
                <motion.a key={link.id} href={link.href}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-2xl font-display transition-colors duration-300"
                  style={{ color: activeSection === link.id ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {link.label}
                </motion.a>
              ))}
              <Link to="/admin" onClick={() => setIsOpen(false)}
                className="mt-4 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300"
                style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--accent-bg)' }}>
                {tx(t.nav.admin, lang)}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default React.memo(Navbar)
