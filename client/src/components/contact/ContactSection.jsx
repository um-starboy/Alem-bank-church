import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiMapPin, FiPhone, FiMail, FiInstagram, FiYoutube, FiSend, FiCheck, FiUser, FiLock } from 'react-icons/fi'
import { FaFacebookF, FaTelegramPlane } from 'react-icons/fa'
import { useChurchData } from '../../context/ChurchDataContext'
import { useTheme } from '../../context/ThemeContext'
import { t, tx } from '../../utils/translations'
import { prayerAPI, pastorsAPI } from '../../utils/api'

const ContactSection = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { contact, churchInfo } = churchData
  const { lang } = useTheme()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [form, setForm] = useState({ name: '', email: '', request: '', pastorId: '', isPrivate: true })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pastors, setPastors] = useState([])

  useEffect(() => {
    pastorsAPI.getList().then(setPastors).catch(() => setPastors([]))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await prayerAPI.submit({ name: form.name, email: form.email, request: form.request, pastorId: form.pastorId || null, isPrivate: form.isPrivate })
      setSubmitted(true); setForm({ name: '', email: '', request: '', pastorId: '', isPrivate: true })
      setTimeout(() => setSubmitted(false), 5000)
    } catch { setSubmitted(true); setTimeout(() => setSubmitted(false), 4000) }
    finally { setLoading(false) }
  }

  const addr = contact.address || churchInfo.address
  const phone = contact.phone || churchInfo.phone
  const email = contact.email || churchInfo.email

  const socials = [
    { icon: FaFacebookF,     url: churchInfo.socialLinks?.facebook,  label: 'Facebook'  },
    { icon: FiInstagram,     url: churchInfo.socialLinks?.instagram, label: 'Instagram' },
    { icon: FiYoutube,       url: churchInfo.socialLinks?.youtube,   label: 'YouTube'   },
    { icon: FaTelegramPlane, url: churchInfo.socialLinks?.telegram,  label: 'Telegram'  },
  ].filter(s => s.url)

  const iStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', padding:'12px 16px', color:'var(--text)', fontSize:'14px', outline:'none', transition:'border-color 0.3s', fontFamily:'inherit' }
  const onFocus = e => e.target.style.borderColor = 'var(--accent)'
  const onBlur  = e => e.target.style.borderColor = 'var(--border)'

  return (
    <section id="contact" className="relative py-20 md:py-32" style={{ background: 'var(--bg-alt)' }}>
      <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text mb-4">{tx(t.contact.title, lang)}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} style={{ color: 'var(--text-muted)' }}>{tx(t.contact.subtitle, lang)}</motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="glass-strong p-8 rounded-2xl">
              <h3 className="text-2xl font-display font-semibold mb-7" style={{ color: 'var(--text)' }}>{tx(t.contact.getInTouch, lang)}</h3>
              {[
                addr  && { label: tx(t.contact.address,lang), val: addr,  icon: FiMapPin, href: null },
                phone && { label: tx(t.contact.phone,  lang), val: phone, icon: FiPhone,  href: `tel:${phone}` },
                email && { label: tx(t.contact.email,  lang), val: email, icon: FiMail,   href: `mailto:${email}` },
              ].filter(Boolean).map(item => (
                <div key={item.label} className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 glass rounded-full flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                    <item.icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{item.label}</p>
                    {item.href ? <a href={item.href} className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>{item.val}</a> : <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.val}</span>}
                  </div>
                </div>
              ))}
              {socials.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>{tx(t.contact.followUs, lang)}</p>
                  <div className="flex gap-3">
                    {socials.map(s => (
                      <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-full flex items-center justify-center transition-all duration-300" style={{ color: 'var(--text-muted)' }} aria-label={s.label} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}><s.icon size={16} /></a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {contact.mapEmbedUrl && (
              <div className="glass-strong p-6 rounded-2xl">
                <h3 className="text-xl font-display font-semibold mb-4" style={{ color: 'var(--text)' }}>{tx(t.contact.findUs, lang)}</h3>
                <div className="aspect-video rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
                  <iframe src={contact.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Church location" />
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }} className="glass-strong p-8 rounded-2xl">
            <h3 className="text-2xl font-display font-semibold mb-7" style={{ color: 'var(--text)' }}>{tx(t.contact.prayer, lang)}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{tx(t.contact.yourName, lang)}</label>
                <input style={iStyle} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} onFocus={onFocus} onBlur={onBlur} placeholder={tx(t.contact.namePh, lang)} required />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{tx(t.contact.emailLabel, lang)}</label>
                <input style={iStyle} type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} onFocus={onFocus} onBlur={onBlur} placeholder={tx(t.contact.emailPh, lang)} required />
              </div>

              {/* Pastor selector */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                  <FiUser size={12} className="inline mr-1" />
                  {lang==='am' ? 'ጸሎቱን ለየትኛው ፓስተር ይላኩ? (አማራጭ)' : 'Send prayer to which pastor? (optional)'}
                </label>
                <select style={{ ...iStyle, padding: '12px 16px' }} value={form.pastorId} onChange={e => setForm(p=>({...p,pastorId:e.target.value}))} onFocus={onFocus} onBlur={onBlur}>
                  <option value="">{lang==='am' ? '— ለማንኛውም ፓስተር —' : '— Any available pastor —'}</option>
                  {pastors.map(p => (
                    <option key={p.id} value={p.id} disabled={!p.is_active}>
                      {p.full_name}{!p.is_active ? (lang==='am' ? ' (አሁን አይገኝም)' : ' (unavailable)') : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{tx(t.contact.prayerLabel, lang)}</label>
                <textarea style={{ ...iStyle, height: '110px', resize: 'none' }} value={form.request} onChange={e => setForm(p=>({...p,request:e.target.value}))} onFocus={onFocus} onBlur={onBlur} placeholder={tx(t.contact.prayerPh, lang)} required />
              </div>

              {/* Privacy toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(p=>({...p,isPrivate:!p.isPrivate}))} className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0" style={{ background: form.isPrivate ? 'var(--accent)' : 'var(--border)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300" style={{ left: form.isPrivate ? '22px' : '2px' }} />
                </div>
                <span className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <FiLock size={12} style={{ color: 'var(--accent)' }} />
                  {lang==='am' ? 'ጸሎቴ ሚስጢራዊ ይሁን (ለፓስተሩ ብቻ)' : 'Keep my prayer private (pastor only)'}
                </span>
              </label>

              <motion.button type="submit" disabled={loading} whileHover={loading?{}:{scale:1.02}} whileTap={loading?{}:{scale:0.98}} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50" style={{ background: 'var(--accent)', color: '#fff' }} onMouseEnter={() => setCursorVariant?.('button')} onMouseLeave={() => setCursorVariant?.('default')}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSend size={18} /><span>{tx(t.contact.submit, lang)}</span></>}
              </motion.button>

              <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                    <FiCheck size={16} />{tx(t.contact.submitted, lang)}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
export default ContactSection
