import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiInstagram, FiYoutube, FiHeart, FiMapPin, FiPhone, FiMail, FiX, FiShield } from 'react-icons/fi'
import { FaFacebookF } from 'react-icons/fa'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'
import { NAV_LINKS } from '../../utils/constants'

const PrivacyPolicyModal = ({ onClose, lang }) => {
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])
  const year = new Date().getFullYear()
  const sections = [
    { h: tx(t.privacy.s1h,lang), b: tx(t.privacy.s1,lang) },
    { h: tx(t.privacy.s2h,lang), b: tx(t.privacy.s2,lang) },
    { h: tx(t.privacy.s3h,lang), b: tx(t.privacy.s3,lang) },
    { h: tx(t.privacy.s4h,lang), b: tx(t.privacy.s4,lang) },
    { h: tx(t.privacy.s5h,lang), b: tx(t.privacy.s5,lang) },
  ]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="glass-strong rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-xl font-display font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <FiShield style={{ color: 'var(--accent)' }} />{tx(t.privacy.title, lang)}
          </h2>
          <button onClick={onClose} className="p-2 glass rounded-lg transition-all" aria-label="Close">
            <FiX size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{tx(t.privacy.updated,lang)}: {year}</p>
          {sections.map((s,i) => (
            <div key={i}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{s.h}</h3>
              <p>{s.b}</p>
            </div>
          ))}
        </div>
        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {tx(t.privacy.understand, lang)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const Footer = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { lang } = useTheme()
  const { churchInfo } = churchData
  const [showPrivacy, setShowPrivacy] = useState(false)
  const year = new Date().getFullYear()

  const navLinks = NAV_LINKS.map((l, i) => ({
    label: tx([t.nav.home,t.nav.about,t.nav.sermons,t.nav.events,t.nav.ministries,t.nav.gallery,t.nav.contact][i], lang),
    href: l.href
  }))

  const socials = [
    churchInfo.socialLinks?.facebook && { url: churchInfo.socialLinks.facebook, icon: FaFacebookF, label: 'Facebook' },
    churchInfo.socialLinks?.instagram && { url: churchInfo.socialLinks.instagram, icon: FiInstagram, label: 'Instagram' },
    churchInfo.socialLinks?.youtube && { url: churchInfo.socialLinks.youtube, icon: FiYoutube, label: 'YouTube' },
  ].filter(Boolean)

  const contactItems = [
    churchInfo.address && { icon: FiMapPin, val: churchInfo.address },
    churchInfo.phone && { icon: FiPhone, val: churchInfo.phone, href: `tel:${churchInfo.phone}` },
    churchInfo.email && { icon: FiMail, val: churchInfo.email, href: `mailto:${churchInfo.email}` },
  ].filter(Boolean)

  return (
    <>
      <footer className="relative pt-16 pb-8" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/church-logo.jpg" alt="Church logo" className="w-12 h-12 rounded-full object-cover" style={{ border: '2px solid var(--accent)' }} />
                <h3 className="text-xl font-display font-bold gradient-text">{churchInfo.name}</h3>
              </div>
              {churchInfo.tagline && <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: 'var(--text-muted)' }}>{churchInfo.tagline}</p>}
              {socials.length > 0 && (
                <div className="flex gap-3">
                  {socials.map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 glass rounded-full flex items-center justify-center transition-all duration-300"
                      style={{ color: 'var(--text-muted)' }} aria-label={`Follow on ${s.label}`}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <s.icon size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Nav */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text)' }}>{tx(t.footer.navigate, lang)}</h4>
              <ul className="space-y-2">
                {navLinks.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm transition-colors duration-200" style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text)' }}>{tx(t.footer.contact, lang)}</h4>
              <ul className="space-y-3">
                {contactItems.length > 0 ? contactItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <item.icon size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    {item.href ? <a href={item.href} className="hover:opacity-80 transition-opacity">{item.val}</a> : <span>{item.val}</span>}
                  </li>
                )) : <li className="text-sm italic" style={{ color: 'var(--text-faint)' }}>{tx(t.contact.comingSoon, lang)}</li>}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
              © {year} {churchInfo.name}. <FiHeart className="inline" size={10} style={{ color: 'var(--accent)' }} /> {tx(t.footer.builtBy, lang)}.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowPrivacy(true)}
                className="flex items-center gap-1.5 text-xs transition-colors duration-200"
                style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                <FiShield size={12} />{tx(t.footer.privacy, lang)}
              </button>
              <Link to="/admin" className="text-xs transition-colors duration-200" style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                {tx(t.nav.admin, lang)}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} lang={lang} />}
      </AnimatePresence>
    </>
  )
}
export default Footer
