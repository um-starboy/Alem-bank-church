import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiX, FiSearch, FiPlay, FiCalendar, FiMapPin, FiClock,
  FiMail, FiPhone, FiInstagram, FiYoutube, FiSend, FiCheck,
  FiChevronDown, FiRadio, FiStar, FiUser, FiLogOut,
  FiSettings, FiShield, FiMaximize2, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { FaFacebookF, FaTelegramPlane } from 'react-icons/fa'
import { useChurchData } from '../context/ChurchDataContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { t, tx } from '../utils/translations'
import { prayerAPI, pastorsAPI } from '../utils/api'
import ThemeLangSwitcher from '../components/ui/ThemeLangSwitcher'

// ── Bottom Sheet ──────────────────────────────────────────────────────────────
const BottomSheet = ({ isOpen, onClose, children, title, icon: Icon, accentColor }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}>
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-2xl rounded-t-3xl overflow-hidden flex flex-col"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderBottom: 'none', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: accentColor ? `${accentColor}20` : 'var(--accent-bg)', color: accentColor || 'var(--accent)' }}>
                    <Icon size={18} />
                  </div>
                )}
                <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                <FiX size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 overscroll-contain">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Tile ──────────────────────────────────────────────────────────────────────
const Tile = ({ icon: Icon, emoji, label, sublabel, color, onClick, size = 'normal', badge, index }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.055, ease: [0.33, 1, 0.68, 1] }}
    whileHover={{ scale: 1.04, y: -3 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`relative rounded-3xl p-5 text-left flex flex-col justify-between overflow-hidden group ${size === 'wide' ? 'col-span-2' : ''}`}
    style={{
      background: `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`,
      border: `1px solid ${color}28`,
      minHeight: size === 'wide' ? '100px' : '128px',
      boxShadow: `0 4px 24px rgba(0,0,0,0.18)`,
    }}>
    {/* Hover glow */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
      style={{ background: `radial-gradient(circle at 30% 30%, ${color}18, transparent 65%)` }} />
    {/* Badge */}
    {badge > 0 && (
      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white z-10"
        style={{ background: '#EF4444' }}>{badge > 9 ? '9+' : badge}</div>
    )}
    <div className="flex items-start justify-between mb-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${color}22`, color }}>
        {emoji ? <span>{emoji}</span> : Icon ? <Icon size={20} /> : null}
      </div>
      <FiChevronDown size={13} className="opacity-0 group-hover:opacity-70 transition-opacity mt-1" style={{ color }} />
    </div>
    <div>
      <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>{label}</p>
      {sublabel && <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sublabel}</p>}
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
  </motion.button>
)

// ── Search Sheet ──────────────────────────────────────────────────────────────
const SearchSheet = ({ isOpen, onClose, churchData, lang }) => {
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => { if (isOpen) setTimeout(() => ref.current?.focus(), 350); else setQ('') }, [isOpen])
  const results = q.length < 2 ? [] : [
    ...churchData.sermons.filter(s => s.title?.toLowerCase().includes(q.toLowerCase())).map(s => ({ ...s, _type: 'sermon', _icon: s.thumbnail || '🎥' })),
    ...churchData.events.filter(e => e.title?.toLowerCase().includes(q.toLowerCase())).map(e => ({ ...e, _type: 'event', _icon: e.image || '📅', name: e.title })),
    ...churchData.ministries.filter(m => m.name?.toLowerCase().includes(q.toLowerCase())).map(m => ({ ...m, _type: 'ministry', _icon: m.icon || '🔥' })),
  ]
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={lang === 'am' ? 'ፈልግ' : 'Search'} icon={FiSearch} accentColor="#C9A96E">
      <div className="p-5">
        <div className="relative mb-4">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-faint)' }} />
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
            placeholder={lang === 'am' ? 'ስብከቶች፣ ዝግጅቶች...' : 'Sermons, events, ministries...'}
            className="w-full py-3 pl-10 pr-4 rounded-2xl text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit' }} />
        </div>
        {q.length >= 2 ? (
          results.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-faint)' }}>{lang === 'am' ? 'ምንም አልተገኘም' : 'No results found'}</p>
          ) : results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-2xl mb-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="text-2xl">{r._icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.title || r.name}</p>
                <p className="text-xs capitalize" style={{ color: 'var(--accent)' }}>{r._type}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10"><div className="text-5xl mb-2">🔍</div>
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{lang === 'am' ? 'ለመፈለግ ይጀምሩ...' : 'Start typing...'}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

// ── About Sheet ───────────────────────────────────────────────────────────────
const AboutSheet = ({ isOpen, onClose, churchData, lang }) => {
  const { about, churchInfo } = churchData
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tx(t.about.title, lang)} icon={FiUser} accentColor="#8B5CF6">
      <div className="p-5 space-y-4">
        {churchInfo.pastorMessage && (
          <div className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <img src="/church-logo.jpg" alt="Pastor" className="w-14 h-14 rounded-full object-cover flex-shrink-0" style={{ border: '2px solid var(--accent)' }} />
              <div>
                <p className="font-display font-semibold" style={{ color: 'var(--text)' }}>{tx(t.about.pastorTitle, lang)}</p>
                {churchInfo.pastorName && <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>— {churchInfo.pastorName}</p>}
              </div>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>"{churchInfo.pastorMessage}"</p>
          </div>
        )}
        {['mission','vision','story'].map(k => about[k]?.description && (
          <div key={k} className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{about[k].icon}</span>
              <h3 className="font-display font-semibold" style={{ color: 'var(--text)' }}>{about[k].title}</h3></div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{about[k].description}</p>
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}

// ── Sermons Sheet ─────────────────────────────────────────────────────────────
const SermonsSheet = ({ isOpen, onClose, churchData, lang }) => {
  const [playing, setPlaying] = useState(null)
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tx(t.sermons.title, lang)} icon={FiPlay} accentColor="#EF4444">
      <div className="p-5 space-y-3">
        {churchData.sermons.length === 0 ? (
          <div className="text-center py-12"><div className="text-5xl mb-3">🎥</div>
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{tx(t.sermons.empty, lang)}</p></div>
        ) : churchData.sermons.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            {playing === s.id && s.youtubeUrl && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-3">
                <iframe src={s.youtubeUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={s.title} />
              </div>
            )}
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: '#EF444420' }}>
                {s.thumbnailUrl ? <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover rounded-xl" /> : <span>{s.thumbnail || '🎥'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                {s.series && <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#EF4444' }}>{s.series}</p>}
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{s.title}</p>
                {s.pastor && <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{s.pastor}</p>}
              </div>
              {s.youtubeUrl && (
                <button onClick={() => setPlaying(playing === s.id ? null : s.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: playing === s.id ? '#EF4444' : '#EF444420', color: playing === s.id ? '#fff' : '#EF4444' }}>
                  <FiPlay size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </BottomSheet>
  )
}

// ── Events Sheet ──────────────────────────────────────────────────────────────
const EventsSheet = ({ isOpen, onClose, churchData, lang }) => (
  <BottomSheet isOpen={isOpen} onClose={onClose} title={tx(t.events.title, lang)} icon={FiCalendar} accentColor="#8B5CF6">
    <div className="p-5 space-y-3">
      {churchData.events.length === 0 ? (
        <div className="text-center py-12"><div className="text-5xl mb-3">📅</div>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{tx(t.events.empty, lang)}</p></div>
      ) : churchData.events.map((e, i) => (
        <motion.div key={e.id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: `1px solid ${e.is_featured ? '#8B5CF650' : 'var(--border)'}` }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#8B5CF620' }}>{e.image || '📅'}</div>
            <div className="flex-1">
              {e.is_featured && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-1" style={{ background: '#8B5CF620', color: '#8B5CF6' }}><FiStar size={10} />{tx(t.events.featured, lang)}</span>}
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{e.title}</p>
              <div className="space-y-0.5">
                {e.event_date && <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><FiCalendar size={11} style={{ color: '#8B5CF6' }} />{e.event_date}</p>}
                {e.event_time && <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><FiClock size={11} style={{ color: '#8B5CF6' }} />{e.event_time}</p>}
                {e.location && <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><FiMapPin size={11} style={{ color: '#8B5CF6' }} />{e.location}</p>}
              </div>
            </div>
          </div>
          {e.description && <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-faint)' }}>{e.description}</p>}
        </motion.div>
      ))}
    </div>
  </BottomSheet>
)

// ── Ministries Sheet (expandable) ─────────────────────────────────────────────
const MinistriesSheet = ({ isOpen, onClose, churchData, lang }) => {
  const [expanded, setExpanded] = useState(null)
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tx(t.ministries.title, lang)} icon={() => <span>🔥</span>} accentColor="#F59E0B">
      <div className="p-5 space-y-3">
        {churchData.ministries.length === 0 ? (
          <div className="text-center py-12"><div className="text-5xl mb-3">👥</div>
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{tx(t.ministries.empty, lang)}</p></div>
        ) : churchData.ministries.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              className="w-full text-left p-4 rounded-2xl transition-all duration-300"
              style={{ background: expanded === m.id ? '#F59E0B12' : 'var(--surface)', border: `1px solid ${expanded === m.id ? '#F59E0B40' : 'var(--border)'}` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl transition-transform duration-300" style={{ transform: expanded === m.id ? 'scale(1.2)' : 'scale(1)' }}>{m.icon || '🔥'}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{m.name}</p>
                  {expanded !== m.id && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-faint)' }}>{m.description}</p>}
                </div>
                <motion.div animate={{ rotate: expanded === m.id ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <FiChevronDown size={15} style={{ color: 'var(--text-faint)' }} />
                </motion.div>
              </div>
            </button>
            <AnimatePresence>
              {expanded === m.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-3 -mt-2 rounded-b-2xl" style={{ background: '#F59E0B08', border: '1px solid #F59E0B20', borderTop: 'none' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{m.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </BottomSheet>
  )
}

// ── Gallery Sheet ─────────────────────────────────────────────────────────────
const GallerySheet = ({ isOpen, onClose, churchData, lang }) => {
  const [lightbox, setLightbox] = useState(null)
  const [idx, setIdx] = useState(0)
  const gallery = churchData.gallery || []
  const open = i => { setIdx(i); setLightbox(gallery[i]) }
  const next = () => { const n = (idx+1)%gallery.length; setIdx(n); setLightbox(gallery[n]) }
  const prev = () => { const n = (idx-1+gallery.length)%gallery.length; setIdx(n); setLightbox(gallery[n]) }
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tx(t.gallery.title, lang)} icon={FiMaximize2} accentColor="#06B6D4">
      <div className="p-5">
        {gallery.length === 0 ? (
          <div className="text-center py-12"><div className="text-5xl mb-3">🖼️</div>
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{tx(t.gallery.empty, lang)}</p></div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((item, i) => (
              <motion.button key={item.id || i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => open(i)} className="aspect-square rounded-2xl flex items-center justify-center text-4xl overflow-hidden active:scale-95 transition-transform"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {item.media_url ? <img src={item.media_url} alt={item.alt} className="w-full h-full object-cover" /> : <span>{item.src}</span>}
              </motion.button>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="relative max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white/60"><FiX size={22} /></button>
              {lightbox.media_url ? <img src={lightbox.media_url} alt={lightbox.alt} className="w-full rounded-2xl" /> : <div className="text-9xl py-8">{lightbox.src}</div>}
              <p className="text-white font-medium mt-3">{lightbox.alt}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--accent)' }}>{lightbox.category}</p>
              {gallery.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button onClick={prev} className="p-3 rounded-full bg-white/10 text-white"><FiChevronLeft size={18} /></button>
                  <span className="text-white/50 text-sm">{idx+1} / {gallery.length}</span>
                  <button onClick={next} className="p-3 rounded-full bg-white/10 text-white"><FiChevronRight size={18} /></button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}

// ── Contact Sheet ─────────────────────────────────────────────────────────────
const ContactSheet = ({ isOpen, onClose, churchData, lang }) => {
  const { contact, churchInfo } = churchData
  const [form, setForm] = useState({ name:'', email:'', request:'', pastorId:'', isPrivate:true })
  const [pastors, setPastors] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (isOpen) pastorsAPI.getList().then(setPastors).catch(() => {}) }, [isOpen])
  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try { await prayerAPI.submit({ ...form, pastorId: form.pastorId || null }); setSubmitted(true); setForm({ name:'', email:'', request:'', pastorId:'', isPrivate:true }); setTimeout(() => setSubmitted(false), 4000) }
    catch { setSubmitted(true); setTimeout(() => setSubmitted(false), 3000) }
    finally { setLoading(false) }
  }
  const addr = contact?.address || churchInfo.address
  const phone = contact?.phone || churchInfo.phone
  const email = contact?.email || churchInfo.email
  const socials = [
    { icon: FaFacebookF, url: churchInfo.socialLinks?.facebook, label: 'Facebook', color: '#1877F2' },
    { icon: FiInstagram, url: churchInfo.socialLinks?.instagram, label: 'Instagram', color: '#E4405F' },
    { icon: FiYoutube, url: churchInfo.socialLinks?.youtube, label: 'YouTube', color: '#FF0000' },
    { icon: FaTelegramPlane, url: churchInfo.socialLinks?.telegram, label: 'Telegram', color: '#0088CC' },
  ].filter(s => s.url)
  const iStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'11px 14px', color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit' }
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tx(t.contact.title, lang)} icon={FiMail} accentColor="#10B981">
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {addr && <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}><div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#10B98120' }}><FiMapPin size={14} style={{ color:'#10B981' }} /></div><p className="text-sm" style={{ color:'var(--text-muted)' }}>{addr}</p></div>}
          {phone && <a href={`tel:${phone}`} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}><div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#10B98120' }}><FiPhone size={14} style={{ color:'#10B981' }} /></div><p className="text-sm" style={{ color:'var(--text-muted)' }}>{phone}</p></a>}
          {email && <a href={`mailto:${email}`} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}><div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#10B98120' }}><FiMail size={14} style={{ color:'#10B981' }} /></div><p className="text-sm" style={{ color:'var(--text-muted)' }}>{email}</p></a>}
        </div>
        {socials.length > 0 && (
          <div className="flex gap-2">{socials.map(s => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl transition-all" style={{ background:`${s.color}12`, border:`1px solid ${s.color}25` }}>
              <s.icon size={18} style={{ color:s.color }} /><span className="text-xs" style={{ color:'var(--text-faint)' }}>{s.label}</span></a>
          ))}</div>
        )}
        {contact?.mapEmbedUrl && <div className="aspect-video rounded-2xl overflow-hidden" style={{ border:'1px solid var(--border)' }}><iframe src={contact.mapEmbedUrl} width="100%" height="100%" style={{ border:0 }} allowFullScreen loading="lazy" title="Location" /></div>}
        <div className="p-4 rounded-2xl" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
          <h3 className="font-display font-semibold mb-3" style={{ color:'var(--text)' }}>{tx(t.contact.prayer, lang)}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input style={iStyle} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder={tx(t.contact.namePh, lang)} required />
            <input style={iStyle} type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder={tx(t.contact.emailPh, lang)} required />
            {pastors.length > 0 && <select style={{ ...iStyle, padding:'11px 14px' }} value={form.pastorId} onChange={e => setForm(p=>({...p,pastorId:e.target.value}))}><option value="">{lang==='am' ? '— ለማንኛውም ፓስተር —' : '— Any pastor —'}</option>{pastors.map(p => <option key={p.id} value={p.id} disabled={!p.is_active}>{p.full_name}{!p.is_active?' (unavailable)':''}</option>)}</select>}
            <textarea style={{ ...iStyle, height:'85px', resize:'none' }} value={form.request} onChange={e => setForm(p=>({...p,request:e.target.value}))} placeholder={tx(t.contact.prayerPh, lang)} required />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background:'#10B981', color:'#fff' }}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSend size={15} />{tx(t.contact.submit, lang)}</>}
            </button>
            <AnimatePresence>{submitted && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex items-center gap-2 text-sm p-3 rounded-xl" style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#4ade80' }}><FiCheck size={14} />{tx(t.contact.submitted, lang)}</motion.div>}</AnimatePresence>
          </form>
        </div>
      </div>
    </BottomSheet>
  )
}

// ── Live Sheet ────────────────────────────────────────────────────────────────
const LiveSheet = ({ isOpen, onClose, churchData, lang }) => {
  const ytUrl = churchData.churchInfo?.socialLinks?.youtube
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={lang==='am' ? 'ቀጥታ ስርጭት' : 'Live Stream'} icon={FiRadio} accentColor="#EF4444">
      <div className="p-5">
        <div className="aspect-video rounded-2xl overflow-hidden mb-4" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:'#EF444420' }}><FiRadio size={24} style={{ color:'#EF4444' }} /></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><p className="text-sm" style={{ color:'var(--text-muted)' }}>{lang==='am' ? 'አሁን ቀጥታ ስርጭት የለም' : 'No live stream right now'}</p></div>
            {ytUrl && <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-xl font-medium" style={{ background:'#EF444418', color:'#EF4444', border:'1px solid #EF444428' }}>{lang==='am' ? 'YouTube ይጎብኙ' : 'Visit YouTube'}</a>}
          </div>
        </div>
        <p className="text-sm text-center" style={{ color:'var(--text-faint)' }}>{lang==='am' ? 'ቀጥታ ስርጭቶቹ እሁድ ጠዋት ይጀምራሉ' : 'Live streams begin on Sunday mornings'}</p>
      </div>
    </BottomSheet>
  )
}

// ── Prayer Sheet ──────────────────────────────────────────────────────────────
const PrayerSheet = ({ isOpen, onClose, lang }) => {
  const [form, setForm] = useState({ name:'', email:'', request:'', pastorId:'', isPrivate:true })
  const [pastors, setPastors] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (isOpen) pastorsAPI.getList().then(setPastors).catch(() => {}) }, [isOpen])
  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try { await prayerAPI.submit(form); setSubmitted(true); setForm({ name:'', email:'', request:'', pastorId:'', isPrivate:true }); setTimeout(() => { setSubmitted(false); onClose() }, 3000) }
    catch { setSubmitted(true); setTimeout(() => { setSubmitted(false); onClose() }, 2000) }
    finally { setLoading(false) }
  }
  const iStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'11px 14px', color:'var(--text)', fontSize:'14px', outline:'none', fontFamily:'inherit' }
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={lang==='am' ? 'የጸሎት ጥያቄ' : 'Prayer Request'} icon={() => <span>🙏</span>} accentColor="#F59E0B">
      <div className="p-5">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="ok" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center py-12">
              <div className="text-6xl mb-4">🙏</div>
              <h3 className="text-xl font-display font-semibold mb-2" style={{ color:'var(--text)' }}>{lang==='am' ? 'ጸሎት ተቀብሏል!' : 'Prayer Received!'}</h3>
              <p className="text-sm" style={{ color:'var(--text-muted)' }}>{tx(t.contact.submitted, lang)}</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-3">
              <input style={iStyle} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder={tx(t.contact.namePh, lang)} required />
              <input style={iStyle} type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder={tx(t.contact.emailPh, lang)} />
              {pastors.length > 0 && <select style={{ ...iStyle, padding:'11px 14px' }} value={form.pastorId} onChange={e => setForm(p=>({...p,pastorId:e.target.value}))}><option value="">{lang==='am' ? '— ለማንኛውም ፓስተር —' : '— Any pastor —'}</option>{pastors.map(p => <option key={p.id} value={p.id} disabled={!p.is_active}>{p.full_name}{!p.is_active?' (unavailable)':''}</option>)}</select>}
              <textarea style={{ ...iStyle, height:'95px', resize:'none' }} value={form.request} onChange={e => setForm(p=>({...p,request:e.target.value}))} placeholder={tx(t.contact.prayerPh, lang)} required />
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(p=>({...p,isPrivate:!p.isPrivate}))} className="relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0" style={{ background:form.isPrivate ? '#F59E0B' : 'var(--border)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300" style={{ left:form.isPrivate ? '18px' : '2px' }} />
                </div>
                <span className="text-xs" style={{ color:'var(--text-muted)' }}>{lang==='am' ? 'ለፓስተሩ ብቻ' : 'Private — pastor only'}</span>
              </label>
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background:'#F59E0B', color:'#000' }}>
                {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><span>🙏</span>{tx(t.contact.submit, lang)}</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════
const HomePage = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const { lang } = useTheme()
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [activeSheet, setActiveSheet] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const open = name => setActiveSheet(name)
  const close = () => setActiveSheet(null)

  const tiles = [
    { id:'sermons',      label:tx(t.sermons.title,lang),    sublabel:`${churchData.sermons?.length||0} ${lang==='am'?'ስብከቶች':'sermons'}`,      emoji:'🎥', color:'#EF4444' },
    { id:'events',       label:tx(t.events.title,lang),     sublabel:`${churchData.events?.length||0} ${lang==='am'?'ዝግጅቶች':'events'}`,       emoji:'📅', color:'#8B5CF6' },
    { id:'ministries',   label:tx(t.ministries.title,lang), sublabel:lang==='am'?'ለማሳፋት ይንኩ':'Tap to expand',                                emoji:'🔥', color:'#F59E0B' },
    { id:'gallery',      label:tx(t.gallery.title,lang),    sublabel:`${churchData.gallery?.length||0} ${lang==='am'?'ፎቶዎች':'photos'}`,        emoji:'🖼️', color:'#06B6D4' },
    { id:'about',        label:tx(t.about.title,lang),      sublabel:lang==='am'?'ተልእኮ፣ ራዕይ':'Mission, vision',                              emoji:'✝️', color:'#8B5CF6' },
    { id:'contact',      label:tx(t.contact.title,lang),    sublabel:lang==='am'?'አድራሻ፣ ስልክ':'Address, phone',                              emoji:'📍', color:'#10B981' },
    { id:'prayer',       label:lang==='am'?'የጸሎት ጥያቄ':'Prayer Request', sublabel:lang==='am'?'ጸሎትዎን ያጋሩ':'Share your prayer',             emoji:'🙏', color:'#F59E0B' },
    { id:'live',         label:lang==='am'?'ቀጥታ ስርጭት':'Live Stream',   sublabel:lang==='am'?'አሁን ይመልከቱ':'Watch now',                       emoji:'📡', color:'#EF4444' },
    { id:'search',       label:lang==='am'?'ፈልግ':'Search',              sublabel:lang==='am'?'ሁሉንም ፈልግ':'Search everything',                icon:FiSearch, color:'#C9A96E', size:'wide' },
    { id:'announcements',label:lang==='am'?'ማስታወቂያዎች':'Announcements',  sublabel:lang==='am'?'ቅርብ ጊዜ ዜናዎች':'Latest news',                  emoji:'📢', color:'#06B6D4', size:'wide' },
  ]

  return (
    <div className="min-h-screen" style={{ background:'var(--bg)' }}>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-3 flex items-center justify-between"
        style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', backdropFilter:'blur(20px)' }}>
        <div className="flex items-center gap-2.5">
          <img src="/church-logo.jpg" alt="logo" className="w-9 h-9 rounded-full object-cover" style={{ border:'2px solid var(--accent)' }} />
          <div>
            <p className="font-display font-bold text-sm leading-tight gradient-text">አለም ባንክ ገነት</p>
            <p className="text-xs" style={{ color:'var(--text-faint)' }}>ቤተ ክርስቲያን</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeLangSwitcher setCursorVariant={setCursorVariant} />
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background:'var(--accent)', color:'#000' }}>
                {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)} />
                    <motion.div initial={{ opacity:0, scale:0.95, y:-8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:-8 }}
                      transition={{ duration:0.15 }}
                      className="absolute right-0 top-11 w-52 rounded-2xl overflow-hidden z-[70]"
                      style={{ background:'var(--bg)', border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
                      <div className="p-4" style={{ borderBottom:'1px solid var(--border)' }}>
                        <p className="font-semibold text-sm" style={{ color:'var(--text)' }}>{user?.fullName || user?.username}</p>
                        <p className="text-xs capitalize mt-0.5" style={{ color:'var(--accent)' }}>{user?.role}</p>
                      </div>
                      <div className="p-2">
                        {[
                          { label:lang==='am'?'አስተዳዳሪ':'Admin Panel', icon:FiShield, action:() => { navigate('/admin'); setShowUserMenu(false) }, color:'var(--accent)' },
                          { label:lang==='am'?'ቅንብሮች':'Settings', icon:FiSettings, action:() => { navigate('/admin/settings'); setShowUserMenu(false) }, color:'var(--text-muted)' },
                        ].map(item => (
                          <button key={item.label} onClick={item.action}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                            style={{ color:item.color }}
                            onMouseEnter={e => e.currentTarget.style.background='var(--surface)'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <item.icon size={14} />{item.label}
                          </button>
                        ))}
                        <div style={{ height:'1px', background:'var(--border)', margin:'4px 0' }} />
                        <button onClick={async () => { await logout(); setShowUserMenu(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                          style={{ color:'#EF4444' }}
                          onMouseEnter={e => e.currentTarget.style.background='#EF444410'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FiLogOut size={14} />{lang==='am'?'ውጣ':'Logout'}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background:'var(--accent-bg)', color:'var(--accent)', border:'1px solid var(--accent)' }}>
              {lang==='am'?'ግባ':'Login'}
            </Link>
          )}
        </div>
      </div>

      {/* Hero strip */}
      <div className="pt-[64px] px-4 pb-2">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          className="relative overflow-hidden rounded-3xl p-5 mt-3"
          style={{ background:'linear-gradient(135deg, rgba(201,169,110,0.14) 0%, rgba(201,169,110,0.04) 100%)', border:'1px solid rgba(201,169,110,0.18)', minHeight:'130px' }}>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-8">
            <img src="/church-logo.jpg" alt="" className="w-24 h-24 rounded-full object-cover opacity-20" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-display font-bold gradient-text leading-tight mb-0.5">{churchData.hero?.title || 'አለም ባንክ ገነት'}</h1>
            <p className="text-sm font-accent italic mb-2" style={{ color:'var(--text-muted)' }}>{churchData.hero?.subtitle || 'ቤተ ክርስቲያን'}</p>
            <p className="text-xs leading-relaxed" style={{ color:'var(--text-faint)', maxWidth:'200px' }}>{tx(t.hero.tagline, lang)}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => open('contact')} className="text-xs px-4 py-2 rounded-full font-semibold" style={{ background:'var(--accent)', color:'#000' }}>
              {tx(t.hero.joinUs, lang)}
            </button>
            <button onClick={() => open('live')} className="text-xs px-4 py-2 rounded-full font-medium flex items-center gap-1.5" style={{ background:'rgba(239,68,68,0.14)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.28)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{tx(t.hero.watchLive, lang)}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tile grid */}
      <div className="px-4 pb-10 pt-3">
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="text-xs font-medium uppercase tracking-widest mb-3 px-1" style={{ color:'var(--text-faint)' }}>
          {lang==='am' ? 'ፈጣን አናቂ' : 'Quick Access'}
        </motion.p>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile, i) => <Tile key={tile.id} {...tile} index={i} onClick={() => open(tile.id)} />)}
        </div>
      </div>

      {/* All bottom sheets */}
      <SearchSheet     isOpen={activeSheet==='search'}        onClose={close} churchData={churchData} lang={lang} />
      <AboutSheet      isOpen={activeSheet==='about'}         onClose={close} churchData={churchData} lang={lang} />
      <SermonsSheet    isOpen={activeSheet==='sermons'}       onClose={close} churchData={churchData} lang={lang} />
      <EventsSheet     isOpen={activeSheet==='events'}        onClose={close} churchData={churchData} lang={lang} />
      <MinistriesSheet isOpen={activeSheet==='ministries'}    onClose={close} churchData={churchData} lang={lang} />
      <GallerySheet    isOpen={activeSheet==='gallery'}       onClose={close} churchData={churchData} lang={lang} />
      <ContactSheet    isOpen={activeSheet==='contact'}       onClose={close} churchData={churchData} lang={lang} />
      <LiveSheet       isOpen={activeSheet==='live'}          onClose={close} churchData={churchData} lang={lang} />
      <PrayerSheet     isOpen={activeSheet==='prayer'}        onClose={close} lang={lang} />

      {/* Announcements sheet */}
      <BottomSheet isOpen={activeSheet==='announcements'} onClose={close} title={lang==='am'?'ማስታወቂያዎች':'Announcements'} icon={() => <span>📢</span>} accentColor="#06B6D4">
        <div className="p-5">
          {churchData.events?.filter(e => e.is_featured).length > 0 ? (
            <div className="space-y-3">
              {churchData.events.filter(e => e.is_featured).map((e, i) => (
                <div key={e.id || i} className="p-4 rounded-2xl" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-xl">{e.image}</span><p className="font-semibold text-sm" style={{ color:'var(--text)' }}>{e.title}</p></div>
                  {e.event_date && <p className="text-xs" style={{ color:'var(--text-faint)' }}>{e.event_date}{e.event_time && ` · ${e.event_time}`}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><div className="text-5xl mb-3">📢</div>
              <p className="text-sm" style={{ color:'var(--text-faint)' }}>{lang==='am'?'አሁን ምንም ማስታወቂያ የለም':'No announcements right now'}</p>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}

export default HomePage
