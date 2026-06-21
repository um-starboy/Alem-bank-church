import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  FiArrowLeft, FiHome, FiType, FiImage, FiVideo, FiCalendar, FiUsers, FiSettings,
  FiSave, FiPlus, FiEdit, FiTrash2, FiDownload, FiUpload, FiRefreshCw,
  FiCheck, FiX, FiGrid, FiBook, FiMail, FiMapPin, FiPhone, FiFileText,
  FiMenu, FiChevronRight, FiAlertCircle, FiPlay, FiClock, FiUser,
  FiStar, FiInfo, FiExternalLink, FiUserX, FiUserCheck, FiKey, FiMessageSquare,
  FiShield
} from 'react-icons/fi'
import { FaTelegramPlane } from 'react-icons/fa'
import { useChurchData } from '../context/ChurchDataContext'
import { useAuth } from '../context/AuthContext'
import { COLOR_PRESETS, DEFAULT_EMOJI } from '../utils/constants'
import FileUpload from '../components/ui/FileUpload'
import { uploadAPI, sermonsAPI, galleryAPI } from '../utils/api'

// ── Reusable Components ────────────────────────────────────────────────────

const SectionHeader = ({ title, description, setCursorVariant }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
    <Link to="/admin" className="inline-flex items-center gap-2 text-soft-white/50 hover:text-subtle-gold transition-colors mb-4 text-sm"
      onMouseEnter={() => setCursorVariant('link')} onMouseLeave={() => setCursorVariant('default')}>
      <FiArrowLeft size={14} /><span>Back to Dashboard</span>
    </Link>
    <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">{title}</h1>
    {description && <p className="text-soft-white/50 text-sm">{description}</p>}
  </motion.div>
)

const FormInput = ({ label, name, value, onChange, type = 'text', placeholder = '', required = false, icon: Icon, rows, disabled = false }) => (
  <div>
    <label className="block text-sm text-soft-white/70 mb-2">
      {label}{required && <span className="text-subtle-gold ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <div className="absolute left-3 top-3 text-soft-white/30 pointer-events-none"><Icon size={16} /></div>}
      {rows ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
          disabled={disabled} rows={rows}
          className={`w-full bg-matte-black/50 border border-soft-white/10 rounded-lg px-4 py-3 text-soft-white placeholder-soft-white/30 focus:outline-none focus:border-subtle-gold/50 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-10' : ''}`} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          required={required} disabled={disabled}
          className={`w-full bg-matte-black/50 border border-soft-white/10 rounded-lg px-4 py-3 text-soft-white placeholder-soft-white/30 focus:outline-none focus:border-subtle-gold/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-10' : ''}`} />
      )}
    </div>
  </div>
)

const SaveButton = ({ children, onClick, setCursorVariant, type = 'submit', disabled = false }) => (
  <motion.button type={type} onClick={onClick} whileHover={disabled ? {} : { scale: 1.02 }} whileTap={disabled ? {} : { scale: 0.98 }}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-subtle-gold text-matte-black font-semibold hover:bg-soft-white transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    onMouseEnter={() => !disabled && setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
    <FiSave size={20} /><span>{children || 'Save Changes'}</span>
  </motion.button>
)

const SuccessMessage = ({ message }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    className="flex items-center justify-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
    <FiCheck size={16} />{message || 'Changes saved successfully!'}
  </motion.div>
)

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="glass p-12 rounded-2xl text-center">
    <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
      <Icon className="text-soft-white/30" size={32} />
    </div>
    <h3 className="text-xl font-display font-semibold text-soft-white/40 mb-2">{title}</h3>
    <p className="text-soft-white/30 text-sm">{description}</p>
  </div>
)

const ActionButton = ({ icon: Icon, onClick, variant = 'default', setCursorVariant, children, disabled = false }) => {
  const variants = {
    default: 'border-soft-white/20 text-soft-white/70 hover:border-subtle-gold/50 hover:text-subtle-gold',
    danger: 'border-red-500/20 text-red-400 hover:border-red-500/50 hover:text-red-300 hover:bg-red-500/5',
    primary: 'bg-subtle-gold/10 border-subtle-gold/50 text-subtle-gold hover:bg-subtle-gold/20',
    ghost: 'border-transparent text-soft-white/40 hover:text-soft-white hover:bg-glass/10',
  }
  return (
    <motion.button whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick} disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
      onMouseEnter={() => !disabled && setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
      {Icon && <Icon size={14} />}{children}
    </motion.button>
  )
}

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message, setCursorVariant }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-matte-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onCancel}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="glass-strong p-8 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="text-red-400" size={24} />
            <h3 className="text-xl font-display font-semibold text-soft-white">{title}</h3>
          </div>
          <p className="text-soft-white/60 text-sm mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <ActionButton onClick={onCancel} setCursorVariant={setCursorVariant}>Cancel</ActionButton>
            <ActionButton onClick={onConfirm} variant="danger" setCursorVariant={setCursorVariant}>Confirm Delete</ActionButton>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

// ── Admin Home ─────────────────────────────────────────────────────────────

const AdminHome = ({ setCursorVariant }) => {
  const { churchData } = useChurchData()
  const navigate = useNavigate()

  const { isAdmin, isPastor } = useAuth()

  const stats = [
    { label: 'Sermons',    value: churchData.sermons.length,    icon: FiVideo,          color: 'from-red-500/20 to-pink-500/20' },
    { label: 'Events',     value: churchData.events.length,     icon: FiCalendar,       color: 'from-purple-500/20 to-indigo-500/20' },
    { label: 'Ministries', value: churchData.ministries.length, icon: FiUsers,          color: 'from-cyan-500/20 to-blue-500/20' },
    { label: 'Gallery',    value: churchData.gallery.length,    icon: FiGrid,           color: 'from-amber-500/20 to-yellow-500/20' },
  ]

  const sections = [
    { title: 'Church Info',      icon: FiFileText,      path: '/admin/church-info', description: 'Name, pastor, social links', color: 'from-blue-500/20 to-purple-500/20', show: true },
    { title: 'Hero Section',     icon: FiImage,         path: '/admin/hero',        description: 'Title, buttons, background', color: 'from-yellow-500/20 to-orange-500/20', show: true },
    { title: 'About Section',    icon: FiBook,          path: '/admin/about',       description: 'Mission, vision, story',     color: 'from-green-500/20 to-emerald-500/20', show: true },
    { title: 'Sermons',          icon: FiVideo,         path: '/admin/sermons',     description: `${churchData.sermons.length} sermons`, color: 'from-red-500/20 to-pink-500/20', show: true },
    { title: 'Events',           icon: FiCalendar,      path: '/admin/events',      description: `${churchData.events.length} events`, color: 'from-purple-500/20 to-indigo-500/20', show: isPastor },
    { title: 'Ministries',       icon: FiUsers,         path: '/admin/ministries',  description: `${churchData.ministries.length} ministries`, color: 'from-cyan-500/20 to-blue-500/20', show: isPastor },
    { title: 'Gallery',          icon: FiGrid,          path: '/admin/gallery',     description: `${churchData.gallery.length} items`, color: 'from-amber-500/20 to-yellow-500/20', show: isPastor },
    { title: 'Contact',          icon: FiMail,          path: '/admin/contact',     description: 'Address, phone, map',       color: 'from-teal-500/20 to-cyan-500/20', show: isPastor },
    { title: 'Prayer Requests',  icon: FiMessageSquare, path: '/admin/prayer',      description: 'View & manage requests',    color: 'from-rose-500/20 to-pink-500/20', show: isPastor },
    { title: 'User Management',  icon: FiShield,        path: '/admin/users',       description: 'Add, activate, deactivate', color: 'from-violet-500/20 to-purple-500/20', show: isAdmin },
    { title: 'Settings',         icon: FiSettings,      path: '/admin/settings',    description: 'Export, import, reset',     color: 'from-gray-500/20 to-slate-500/20', show: true },
  ].filter(s => s.show)

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-soft-white/60">Manage all your church website content</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="glass p-5 rounded-2xl">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="text-soft-white" size={18} />
            </div>
            <p className="text-3xl font-display font-bold text-soft-white">{stat.value}</p>
            <p className="text-soft-white/40 text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section, index) => (
          <motion.button key={index} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(section.path)}
            className="glass p-6 rounded-2xl text-left hover:bg-glass/10 transition-all duration-300 group"
            onMouseEnter={() => setCursorVariant('text')} onMouseLeave={() => setCursorVariant('default')}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
              <section.icon className="text-soft-white text-xl" />
            </div>
            <h3 className="text-xl font-display font-semibold text-soft-white mb-2">{section.title}</h3>
            <p className="text-soft-white/50 text-sm">{section.description}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

// ── Church Info Editor ─────────────────────────────────────────────────────

const ChurchInfoEditor = ({ setCursorVariant }) => {
  const { churchData, updateChurchInfo } = useChurchData()
  // FIX: Sync form when context updates (e.g. after import/reset)
  const [formData, setFormData] = useState(churchData.churchInfo)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    setFormData({
      ...churchData.churchInfo,
      socialLinks: {
        facebook: '', instagram: '', youtube: '', telegram: '',
        ...churchData.churchInfo.socialLinks,
      },
    })
  }, [churchData.churchInfo])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    if (name.startsWith('social.')) {
      const social = name.split('.')[1]
      setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [social]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    updateChurchInfo(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FiInfo },
    { id: 'pastor', label: 'Pastor', icon: FiUser },
    { id: 'contact', label: 'Contact', icon: FiMail },
    { id: 'social', label: 'Social Media', icon: FiStar },
  ]

  return (
    <div>
      <SectionHeader title="Church Information" description="Manage your church's basic information" setCursorVariant={setCursorVariant} />
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${activeTab === tab.id ? 'bg-subtle-gold/10 text-subtle-gold border border-subtle-gold/30' : 'glass text-soft-white/50 hover:text-soft-white border border-transparent'}`}
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div key="basic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-strong p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-display font-semibold text-soft-white">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Church Name" name="name" value={formData.name} onChange={handleChange} required />
                <FormInput label="Short Name" name="shortName" value={formData.shortName} onChange={handleChange} />
                <FormInput label="Tagline" name="tagline" value={formData.tagline} onChange={handleChange} />
                <FormInput label="Description" name="description" value={formData.description} onChange={handleChange} />
              </div>
            </motion.div>
          )}
          {activeTab === 'pastor' && (
            <motion.div key="pastor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-strong p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-display font-semibold text-soft-white">Pastor Information</h3>
              <FormInput label="Pastor Name" name="pastorName" value={formData.pastorName} onChange={handleChange} icon={FiUser} />
              <FormInput label="Pastor Message" name="pastorMessage" value={formData.pastorMessage} onChange={handleChange} rows={5} placeholder="Write a welcoming message from the pastor..." />
            </motion.div>
          )}
          {activeTab === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-strong p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-display font-semibold text-soft-white">Contact Details</h3>
              <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} icon={FiMapPin} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} icon={FiPhone} />
                <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} icon={FiMail} />
              </div>
            </motion.div>
          )}
          {activeTab === 'social' && (
            <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-strong p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-display font-semibold text-soft-white">Social Media Links</h3>
              <FormInput label="Facebook URL" name="social.facebook" value={formData.socialLinks.facebook} onChange={handleChange} placeholder="https://facebook.com/yourchurch" />
              <FormInput label="Instagram URL" name="social.instagram" value={formData.socialLinks.instagram} onChange={handleChange} placeholder="https://instagram.com/yourchurch" />
              <FormInput label="YouTube URL" name="social.youtube" value={formData.socialLinks.youtube} onChange={handleChange} placeholder="https://youtube.com/@yourchurch" />
              <FormInput label="Telegram URL or Username" name="social.telegram" value={formData.socialLinks.telegram || ''} onChange={handleChange} placeholder="https://t.me/yourchurch" icon={FaTelegramPlane} />
            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton setCursorVariant={setCursorVariant}>Save All Changes</SaveButton>
        <AnimatePresence>{saved && <SuccessMessage />}</AnimatePresence>
      </motion.form>
    </div>
  )
}

// ── Hero Editor ────────────────────────────────────────────────────────────

const HeroEditor = ({ setCursorVariant }) => {
  const { churchData, updateHero } = useChurchData()
  const [formData, setFormData] = useState(churchData.hero)
  const [saved, setSaved] = useState(false)

  // FIX: Sync on external updates
  useEffect(() => { setFormData(churchData.hero) }, [churchData.hero])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateHero(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <SectionHeader title="Hero Section" description="Customize the main hero banner" setCursorVariant={setCursorVariant} />
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-strong p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-display font-semibold text-soft-white">Hero Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />
            <FormInput label="Subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} required />
            <FormInput label="Primary Button Text" name="primaryButtonText" value={formData.primaryButtonText} onChange={handleChange} />
            <FormInput label="Primary Button Link" name="primaryButtonLink" value={formData.primaryButtonLink} onChange={handleChange} placeholder="#contact" />
            <FormInput label="Secondary Button Text" name="secondaryButtonText" value={formData.secondaryButtonText} onChange={handleChange} />
            <FormInput label="Secondary Button Link" name="secondaryButtonLink" value={formData.secondaryButtonLink} onChange={handleChange} placeholder="#" />
          </div>
          <div>
            <label className="block text-sm text-soft-white/70 mb-2">Background Type</label>
            <select name="backgroundType" value={formData.backgroundType} onChange={handleChange}
              className="w-full bg-matte-black/50 border border-soft-white/10 rounded-lg px-4 py-3 text-soft-white focus:outline-none focus:border-subtle-gold/50 transition-colors">
              <option value="gradient">Gradient (Default)</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          {formData.backgroundType === 'image' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <FileUpload
                label="Upload Background Image"
                accept="image"
                maxSizeMB={10}
                currentUrl={formData.backgroundImage}
                currentType="image"
                onUpload={async (file) => {
                  const result = await uploadAPI.hero(file)
                  setFormData(prev => ({ ...prev, backgroundImage: result.url, backgroundType: 'image' }))
                  return result
                }}
                setCursorVariant={setCursorVariant}
                hint="JPG, PNG, WebP up to 10MB"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or paste URL</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <FormInput label="Background Image URL" name="backgroundImage" value={formData.backgroundImage || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" icon={FiImage} />
            </motion.div>
          )}
          {formData.backgroundType === 'video' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <FileUpload
                label="Upload Background Video"
                accept="video"
                maxSizeMB={100}
                currentUrl={formData.backgroundVideo}
                currentType="video"
                onUpload={async (file) => {
                  const result = await uploadAPI.hero(file)
                  setFormData(prev => ({ ...prev, backgroundVideo: result.url, backgroundType: 'video' }))
                  return result
                }}
                setCursorVariant={setCursorVariant}
                hint="MP4, MOV, WebM up to 100MB"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or paste URL</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <FormInput label="Background Video URL" name="backgroundVideo" value={formData.backgroundVideo || ''} onChange={handleChange} placeholder="https://example.com/video.mp4" icon={FiVideo} />
            </motion.div>
          )}
        </div>
        <SaveButton setCursorVariant={setCursorVariant}>Save Hero Section</SaveButton>
        <AnimatePresence>{saved && <SuccessMessage />}</AnimatePresence>
      </motion.form>
    </div>
  )
}

// ── About Editor ───────────────────────────────────────────────────────────

const AboutEditor = ({ setCursorVariant }) => {
  const { churchData, updateAbout } = useChurchData()
  const [formData, setFormData] = useState(churchData.about)
  const [saved, setSaved] = useState(false)

  // FIX: Sync on external updates
  useEffect(() => { setFormData(churchData.about) }, [churchData.about])

  const handleChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateAbout(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <SectionHeader title="About Section" description="Edit mission, vision, and story content" setCursorVariant={setCursorVariant} />
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit} className="space-y-6">
        {['mission', 'vision', 'story'].map((section) => (
          <div key={section} className="glass-strong p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-display font-semibold text-soft-white capitalize">{section}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FIX: Added name prop to FormInput so inputs have proper name attributes */}
              <FormInput label="Title" name={`${section}-title`} value={formData[section].title} onChange={(e) => handleChange(section, 'title', e.target.value)} />
              <FormInput label="Icon (Emoji)" name={`${section}-icon`} value={formData[section].icon} onChange={(e) => handleChange(section, 'icon', e.target.value)} />
            </div>
            <FormInput label="Description" name={`${section}-description`} value={formData[section].description} onChange={(e) => handleChange(section, 'description', e.target.value)} rows={4} />
          </div>
        ))}
        <SaveButton setCursorVariant={setCursorVariant}>Save About Section</SaveButton>
        <AnimatePresence>{saved && <SuccessMessage />}</AnimatePresence>
      </motion.form>
    </div>
  )
}

// ── Sermons Editor ─────────────────────────────────────────────────────────

const SermonsEditor = ({ setCursorVariant }) => {
  const { churchData, addSermon, updateSermon, deleteSermon } = useChurchData()
  const [editingSermon, setEditingSermon] = useState(null)
  const [formData, setFormData] = useState({ title: '', series: '', pastor: '', description: '', youtubeUrl: '', thumbnail: DEFAULT_EMOJI.sermon })
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const formRef = useRef(null)

  const resetForm = () => {
    setFormData({ title: '', series: '', pastor: '', description: '', youtubeUrl: '', thumbnail: DEFAULT_EMOJI.sermon })
    setEditingSermon(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSermon) { await updateSermon(editingSermon.id, formData) } else { await addSermon(formData) }
      resetForm()
      setShowForm(false)
    } catch (err) {
      console.error('Failed to save sermon:', err)
      alert('Failed to save sermon. Please try again.')
    }
  }

  const handleEdit = (sermon) => {
    setEditingSermon(sermon)
    setFormData({ title: sermon.title || '', series: sermon.series || '', pastor: sermon.pastor || '', description: sermon.description || '', youtubeUrl: sermon.youtubeUrl || '', thumbnail: sermon.thumbnail || DEFAULT_EMOJI.sermon })
    setShowForm(true)
    // FIX: Scroll to the form element, not the top of the page
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleDelete = (id) => {
    deleteSermon(id)
    setConfirmDelete(null)
    if (editingSermon?.id === id) { resetForm(); setShowForm(false) }
  }

  return (
    <div ref={formRef}>
      <SectionHeader title="Sermons Management" description={`${churchData.sermons.length} sermon${churchData.sermons.length !== 1 ? 's' : ''} total`} setCursorVariant={setCursorVariant} />
      <div className="mb-6">
        <ActionButton icon={showForm ? FiX : FiPlus} onClick={() => { setShowForm(!showForm); if (!showForm) resetForm() }} variant="primary" setCursorVariant={setCursorVariant}>
          {showForm ? 'Cancel' : 'Add New Sermon'}
        </ActionButton>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="glass-strong p-8 rounded-2xl space-y-4 mb-8 overflow-hidden">
            <h3 className="text-lg font-display font-semibold text-soft-white">{editingSermon ? 'Edit Sermon' : 'Add New Sermon'}</h3>
            <FormInput label="Sermon Title" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Series" name="series" value={formData.series} onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))} />
              <FormInput label="Pastor" name="pastor" value={formData.pastor} onChange={(e) => setFormData(prev => ({ ...prev, pastor: e.target.value }))} />
            </div>
            <FormInput label="YouTube URL" name="youtubeUrl" value={formData.youtubeUrl} onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." icon={FiPlay} />
            <FileUpload
              label="Thumbnail Image (optional — replaces emoji)"
              accept="image"
              maxSizeMB={10}
              currentUrl={formData.thumbnailUrl}
              currentType="image"
              onUpload={async (file) => {
                const result = await uploadAPI.sermonThumbnail(file, editingSermon?.id || null)
                setFormData(prev => ({ ...prev, thumbnailUrl: result.url }))
                return result
              }}
              setCursorVariant={setCursorVariant}
              hint="JPG, PNG, WebP up to 10MB"
            />
            <FormInput label="Thumbnail Emoji (used if no image uploaded)" name="thumbnail" value={formData.thumbnail} onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))} />
            <FormInput label="Description" name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            <div className="flex gap-3 pt-2">
              <SaveButton setCursorVariant={setCursorVariant}>{editingSermon ? 'Update Sermon' : 'Add Sermon'}</SaveButton>
              {editingSermon && <ActionButton icon={FiX} onClick={() => { resetForm(); setShowForm(false) }} setCursorVariant={setCursorVariant}>Cancel Edit</ActionButton>}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
        {churchData.sermons.length === 0 ? (
          <EmptyState icon={FiVideo} title="No Sermons Yet" description="Add your first sermon using the button above" />
        ) : (
          churchData.sermons.map((sermon, index) => (
            <motion.div key={sermon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass p-5 rounded-2xl flex items-center justify-between group hover:bg-glass/10 transition-all duration-300">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-3xl flex-shrink-0">{sermon.thumbnail}</span>
                <div className="min-w-0">
                  <h4 className="text-soft-white font-semibold truncate">{sermon.title}</h4>
                  <p className="text-soft-white/50 text-sm truncate">{sermon.series && `${sermon.series} • `}{sermon.pastor}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                <ActionButton icon={FiEdit} onClick={() => handleEdit(sermon)} setCursorVariant={setCursorVariant}>Edit</ActionButton>
                <ActionButton icon={FiTrash2} onClick={() => setConfirmDelete(sermon.id)} variant="danger" setCursorVariant={setCursorVariant}>Delete</ActionButton>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
      <ConfirmDialog isOpen={!!confirmDelete} onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)}
        title="Delete Sermon" message="Are you sure you want to delete this sermon? This action cannot be undone." setCursorVariant={setCursorVariant} />
    </div>
  )
}

// ── Events Editor ──────────────────────────────────────────────────────────

const EventsEditor = ({ setCursorVariant }) => {
  const { churchData, addEvent, updateEvent, deleteEvent } = useChurchData()
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({ title: '', date: '', time: '', location: '', description: '', image: DEFAULT_EMOJI.event, featured: false })
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const formRef = useRef(null)

  const resetForm = () => {
    setFormData({ title: '', date: '', time: '', location: '', description: '', image: DEFAULT_EMOJI.event, featured: false })
    setEditingEvent(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEvent) { await updateEvent(editingEvent.id, formData) } else { await addEvent(formData) }
      resetForm()
    } catch (err) {
      console.error('Failed to save event:', err)
      alert('Failed to save event. Please try again.')
    }
    setShowForm(false)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({ title: event.title || '', date: event.date || '', time: event.time || '', location: event.location || '', description: event.description || '', image: event.image || DEFAULT_EMOJI.event, featured: event.featured || false })
    setShowForm(true)
    // FIX: Scroll to form, not page top
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleDelete = (id) => {
    deleteEvent(id)
    setConfirmDelete(null)
    if (editingEvent?.id === id) { resetForm(); setShowForm(false) }
  }

  return (
    <div ref={formRef}>
      <SectionHeader title="Events Management" description={`${churchData.events.length} event${churchData.events.length !== 1 ? 's' : ''} total`} setCursorVariant={setCursorVariant} />
      <div className="mb-6">
        <ActionButton icon={showForm ? FiX : FiPlus} onClick={() => { setShowForm(!showForm); if (!showForm) resetForm() }} variant="primary" setCursorVariant={setCursorVariant}>
          {showForm ? 'Cancel' : 'Add New Event'}
        </ActionButton>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="glass-strong p-8 rounded-2xl space-y-4 mb-8 overflow-hidden">
            <h3 className="text-lg font-display font-semibold text-soft-white">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
            <FormInput label="Event Title" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput label="Date" name="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
              <FormInput label="Time" name="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} placeholder="10:00 AM" required icon={FiClock} />
              <FormInput label="Icon Emoji" name="image" value={formData.image} onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))} />
            </div>
            <FormInput label="Location" name="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} required icon={FiMapPin} />
            <FormInput label="Description" name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} required />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-5 h-5 rounded border-soft-white/20 bg-matte-black/50 text-subtle-gold focus:ring-subtle-gold focus:ring-offset-0" />
              <span className="text-sm text-soft-white/70 flex items-center gap-2"><FiStar className="text-subtle-gold" size={14} />Feature this event</span>
            </label>
            <div className="flex gap-3 pt-2">
              <SaveButton setCursorVariant={setCursorVariant}>{editingEvent ? 'Update Event' : 'Add Event'}</SaveButton>
              {editingEvent && <ActionButton icon={FiX} onClick={() => { resetForm(); setShowForm(false) }} setCursorVariant={setCursorVariant}>Cancel Edit</ActionButton>}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
        {churchData.events.length === 0 ? (
          <EmptyState icon={FiCalendar} title="No Events Yet" description="Add your first event using the button above" />
        ) : (
          churchData.events.map((event, index) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass p-5 rounded-2xl flex items-center justify-between group hover:bg-glass/10 transition-all duration-300">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-3xl flex-shrink-0">{event.image}</span>
                <div className="min-w-0">
                  <h4 className="text-soft-white font-semibold truncate">
                    {event.featured && <FiStar className="inline text-subtle-gold mr-1" size={14} />}{event.title}
                  </h4>
                  <p className="text-soft-white/50 text-sm truncate">{event.date} • {event.time}</p>
                  <p className="text-soft-white/40 text-xs truncate">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                <ActionButton icon={FiEdit} onClick={() => handleEdit(event)} setCursorVariant={setCursorVariant}>Edit</ActionButton>
                <ActionButton icon={FiTrash2} onClick={() => setConfirmDelete(event.id)} variant="danger" setCursorVariant={setCursorVariant}>Delete</ActionButton>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
      <ConfirmDialog isOpen={!!confirmDelete} onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)}
        title="Delete Event" message="Are you sure you want to delete this event? This action cannot be undone." setCursorVariant={setCursorVariant} />
    </div>
  )
}

// ── Ministries Editor ──────────────────────────────────────────────────────

const MinistriesEditor = ({ setCursorVariant }) => {
  const { churchData, addMinistry, updateMinistry, deleteMinistry } = useChurchData()
  const [editingMinistry, setEditingMinistry] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', icon: DEFAULT_EMOJI.youth, color: COLOR_PRESETS[0].value })
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const formRef = useRef(null)

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: DEFAULT_EMOJI.youth, color: COLOR_PRESETS[0].value })
    setEditingMinistry(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMinistry) { await updateMinistry(editingMinistry.id, formData) } else { await addMinistry(formData) }
      resetForm()
    } catch (err) {
      console.error('Failed to save ministry:', err)
      alert('Failed to save ministry. Please try again.')
    }
    setShowForm(false)
  }

  const handleEdit = (ministry) => {
    setEditingMinistry(ministry)
    setFormData({ name: ministry.name || '', description: ministry.description || '', icon: ministry.icon || DEFAULT_EMOJI.youth, color: ministry.color || COLOR_PRESETS[0].value })
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleDelete = (id) => {
    deleteMinistry(id)
    setConfirmDelete(null)
    if (editingMinistry?.id === id) { resetForm(); setShowForm(false) }
  }

  return (
    <div ref={formRef}>
      <SectionHeader title="Ministries Management" description={`${churchData.ministries.length} ministr${churchData.ministries.length !== 1 ? 'ies' : 'y'} total`} setCursorVariant={setCursorVariant} />
      <div className="mb-6">
        <ActionButton icon={showForm ? FiX : FiPlus} onClick={() => { setShowForm(!showForm); if (!showForm) resetForm() }} variant="primary" setCursorVariant={setCursorVariant}>
          {showForm ? 'Cancel' : 'Add New Ministry'}
        </ActionButton>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="glass-strong p-8 rounded-2xl space-y-4 mb-8 overflow-hidden">
            <h3 className="text-lg font-display font-semibold text-soft-white">{editingMinistry ? 'Edit Ministry' : 'Add New Ministry'}</h3>
            <FormInput label="Ministry Name" name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
            <FormInput label="Icon Emoji" name="icon" value={formData.icon} onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))} />
            <FormInput label="Description" name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} required />
            <div>
              <label className="block text-sm text-soft-white/70 mb-2">Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button key={preset.value} type="button" onClick={() => setFormData(prev => ({ ...prev, color: preset.value }))}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all duration-300 ${formData.color === preset.value ? 'border-subtle-gold text-subtle-gold bg-subtle-gold/10' : 'border-soft-white/10 text-soft-white/50 hover:border-soft-white/30'}`}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <SaveButton setCursorVariant={setCursorVariant}>{editingMinistry ? 'Update Ministry' : 'Add Ministry'}</SaveButton>
              {editingMinistry && <ActionButton icon={FiX} onClick={() => { resetForm(); setShowForm(false) }} setCursorVariant={setCursorVariant}>Cancel Edit</ActionButton>}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {churchData.ministries.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={FiUsers} title="No Ministries Yet" description="Add your first ministry using the button above" /></div>
        ) : (
          churchData.ministries.map((ministry, index) => (
            <motion.div key={ministry.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass p-6 rounded-2xl group hover:bg-glass/10 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${ministry.color} opacity-5`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{ministry.icon}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton icon={FiEdit} onClick={() => handleEdit(ministry)} setCursorVariant={setCursorVariant} />
                    <ActionButton icon={FiTrash2} onClick={() => setConfirmDelete(ministry.id)} variant="danger" setCursorVariant={setCursorVariant} />
                  </div>
                </div>
                <h4 className="text-lg font-display font-semibold text-soft-white mb-2">{ministry.name}</h4>
                <p className="text-soft-white/50 text-sm line-clamp-2">{ministry.description}</p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
      <ConfirmDialog isOpen={!!confirmDelete} onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)}
        title="Delete Ministry" message="Are you sure you want to delete this ministry? This action cannot be undone." setCursorVariant={setCursorVariant} />
    </div>
  )
}

// ── Gallery Editor ─────────────────────────────────────────────────────────

const GalleryEditor = ({ setCursorVariant }) => {
  const { churchData, addGalleryItem, deleteGalleryItem } = useChurchData()
  const [formData, setFormData] = useState({ src: DEFAULT_EMOJI.gallery, alt: '', category: '' })
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addGalleryItem(formData)
      setFormData({ src: DEFAULT_EMOJI.gallery, alt: '', category: '' })
    } catch (err) {
      console.error('Failed to save gallery item:', err)
      alert('Failed to save gallery item. Please try again.')
    }
    // FIX: Close the form after adding an item
    setShowForm(false)
  }

  return (
    <div>
      <SectionHeader title="Gallery Management" description={`${churchData.gallery.length} item${churchData.gallery.length !== 1 ? 's' : ''} in gallery`} setCursorVariant={setCursorVariant} />
      <div className="mb-6">
        <ActionButton icon={showForm ? FiX : FiPlus} onClick={() => setShowForm(!showForm)} variant="primary" setCursorVariant={setCursorVariant}>
          {showForm ? 'Cancel' : 'Add Gallery Item'}
        </ActionButton>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="glass-strong p-8 rounded-2xl space-y-4 mb-8 overflow-hidden">
            <h3 className="text-lg font-display font-semibold text-soft-white">Add Gallery Item</h3>
            <FileUpload
              label="Upload Photo or Video"
              accept="both"
              maxSizeMB={100}
              onUpload={async (file) => {
                const result = await uploadAPI.gallery(
                  file,
                  formData.alt || 'Gallery item',
                  formData.category || 'General'
                )
                // Gallery item already saved to DB by the server — just refresh
                setFormData({ src: DEFAULT_EMOJI.gallery, alt: '', category: '' })
                setShowForm(false)
                return result
              }}
              setCursorVariant={setCursorVariant}
              hint="Images (JPG, PNG, WebP) or Videos (MP4, MOV) up to 100MB"
            />
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or add emoji item</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            <FormInput label="Icon Emoji" name="src" value={formData.src} onChange={(e) => setFormData(prev => ({ ...prev, src: e.target.value }))} />
            <FormInput label="Title / Alt Text" name="alt" value={formData.alt} onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))} required />
            <FormInput label="Category" name="category" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required placeholder="e.g., Worship, Youth, Events" />
            <SaveButton setCursorVariant={setCursorVariant}>Add to Gallery</SaveButton>
          </motion.form>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        {churchData.gallery.length === 0 ? (
          <EmptyState icon={FiGrid} title="No Gallery Items" description="Add images to your gallery using the button above" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {churchData.gallery.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative glass rounded-xl p-6 text-center hover:bg-glass/10 transition-all duration-300">
                <span className="text-5xl block mb-3">{item.src}</span>
                <p className="text-soft-white text-sm font-medium truncate">{item.alt}</p>
                <p className="text-soft-white/40 text-xs">{item.category}</p>
                <button onClick={() => setConfirmDelete(item.id)}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  aria-label="Delete gallery item">
                  <FiTrash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      <ConfirmDialog isOpen={!!confirmDelete} onConfirm={() => { deleteGalleryItem(confirmDelete); setConfirmDelete(null) }} onCancel={() => setConfirmDelete(null)}
        title="Delete Gallery Item" message="Are you sure you want to delete this gallery item?" setCursorVariant={setCursorVariant} />
    </div>
  )
}

// ── Contact Editor ─────────────────────────────────────────────────────────

const ContactEditor = ({ setCursorVariant }) => {
  const { churchData, updateContact } = useChurchData()
  const [formData, setFormData] = useState(churchData.contact)
  const [saved, setSaved] = useState(false)

  // FIX: Sync on external updates
  useEffect(() => { setFormData(churchData.contact) }, [churchData.contact])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateContact(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <SectionHeader title="Contact Section" description="Update contact details and map" setCursorVariant={setCursorVariant} />
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-strong p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-display font-semibold text-soft-white">Contact Details</h3>
          <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} icon={FiMapPin} placeholder="123 Church Street, City" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} icon={FiPhone} placeholder="+251 11 234 5678" />
            <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} icon={FiMail} placeholder="info@church.org" />
          </div>
        </div>
        <div className="glass-strong p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-display font-semibold text-soft-white">Google Maps</h3>
          <FormInput label="Google Maps Embed URL" name="mapEmbedUrl" value={formData.mapEmbedUrl} onChange={handleChange} icon={FiMapPin} placeholder="https://www.google.com/maps/embed?pb=..." />
          {formData.mapEmbedUrl && (
            <div className="aspect-video rounded-xl overflow-hidden bg-matte-black/50">
              <iframe src={formData.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Church Location" />
            </div>
          )}
        </div>
        <SaveButton setCursorVariant={setCursorVariant}>Save Contact Info</SaveButton>
        <AnimatePresence>{saved && <SuccessMessage />}</AnimatePresence>
      </motion.form>
    </div>
  )
}

// ── Settings Editor ────────────────────────────────────────────────────────

const SettingsEditor = ({ setCursorVariant }) => {
  const { churchData, resetToDefault, exportData, importData } = useChurchData()
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  // FIX: fileInputRef is used via htmlFor on the label — removed redundant ref usage
  const totalItems = churchData.sermons.length + churchData.events.length + churchData.ministries.length + churchData.gallery.length

  const handleImport = () => {
    if (!importText.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste JSON data first' })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }
    const success = importData(importText)
    if (success) {
      setImportStatus({ type: 'success', message: 'Data imported successfully! Refreshing...' })
      setTimeout(() => { window.location.reload() }, 1500)
    } else {
      setImportStatus({ type: 'error', message: 'Invalid JSON format. Please check your data.' })
      setTimeout(() => setImportStatus(null), 4000)
    }
  }

  const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImportText(event.target.result)
        setImportStatus({ type: 'info', message: 'File loaded. Click "Import Data" to apply.' })
        setTimeout(() => setImportStatus(null), 3000)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div>
      <SectionHeader title="Settings" description="Export, import, or reset your data" setCursorVariant={setCursorVariant} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
        <div className="glass-strong p-8 rounded-2xl">
          <h3 className="text-xl font-display font-semibold text-soft-white mb-4 flex items-center gap-3">
            <FiDownload className="text-subtle-gold" />Export Data
          </h3>
          <p className="text-soft-white/50 mb-6">Download all your church website data as a JSON file for backup.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <ActionButton icon={FiDownload} onClick={exportData} variant="primary" setCursorVariant={setCursorVariant}>Download JSON</ActionButton>
            <span className="text-soft-white/30 text-sm">{totalItems} total items</span>
          </div>
        </div>

        <div className="glass-strong p-8 rounded-2xl">
          <h3 className="text-xl font-display font-semibold text-soft-white mb-4 flex items-center gap-3">
            <FiUpload className="text-subtle-gold" />Import Data
          </h3>
          <p className="text-soft-white/50 mb-4">Restore your data from a backup file or paste JSON directly.</p>
          <div className="mb-4">
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" id="file-import" />
            <label htmlFor="file-import"
              className="inline-flex items-center gap-2 px-4 py-2 border border-soft-white/20 text-soft-white/70 hover:border-subtle-gold/50 hover:text-subtle-gold rounded-lg transition-all duration-300 text-sm cursor-pointer"
              onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}>
              <FiUpload size={14} />Choose JSON File
            </label>
          </div>
          <FormInput label="Or paste JSON data" name="importText" value={importText} onChange={(e) => setImportText(e.target.value)} rows={6} placeholder="Paste your JSON data here..." />
          <div className="mt-4">
            <ActionButton icon={FiUpload} onClick={handleImport} variant="primary" setCursorVariant={setCursorVariant}>Import Data</ActionButton>
          </div>
          <AnimatePresence>
            {importStatus && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`mt-4 flex items-center gap-2 text-sm p-3 rounded-lg ${importStatus.type === 'success' ? 'text-green-400 bg-green-500/10 border border-green-500/20' : importStatus.type === 'error' ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'}`}>
                {importStatus.type === 'success' ? <FiCheck /> : importStatus.type === 'error' ? <FiAlertCircle /> : <FiInfo />}
                {importStatus.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="glass-strong p-8 rounded-2xl border border-red-500/10">
          <h3 className="text-xl font-display font-semibold text-red-400 mb-4 flex items-center gap-3"><FiAlertCircle />Danger Zone</h3>
          <p className="text-soft-white/50 mb-6">This will permanently delete all custom content and reset to defaults.</p>
          {!showConfirmReset ? (
            <ActionButton icon={FiRefreshCw} onClick={() => setShowConfirmReset(true)} variant="danger" setCursorVariant={setCursorVariant}>Reset All Data</ActionButton>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <FiAlertCircle className="text-red-400 flex-shrink-0" size={24} />
              <div>
                <p className="text-red-400 font-semibold text-sm mb-2">Are you absolutely sure?</p>
                <p className="text-soft-white/50 text-xs mb-3">This will delete all sermons, events, ministries, gallery items, and settings.</p>
                <div className="flex gap-2">
                  <ActionButton onClick={() => { resetToDefault(); setTimeout(() => window.location.reload(), 500) }} variant="danger" setCursorVariant={setCursorVariant}>Yes, Reset Everything</ActionButton>
                  <ActionButton onClick={() => setShowConfirmReset(false)} setCursorVariant={setCursorVariant}>Cancel</ActionButton>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Main AdminDashboard ────────────────────────────────────────────────────

const AdminDashboard = ({ setCursorVariant }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const { isAdmin, isPastor } = useAuth()

  const sidebarLinks = [
    { title: 'Dashboard',       icon: FiHome,           path: '/admin',                show: true },
    { title: 'Church Info',     icon: FiFileText,       path: '/admin/church-info',    show: true },
    { title: 'Hero Section',    icon: FiImage,          path: '/admin/hero',           show: true },
    { title: 'About Section',   icon: FiBook,           path: '/admin/about',          show: true },
    { title: 'Sermons',         icon: FiVideo,          path: '/admin/sermons',        show: true },
    { title: 'Events',          icon: FiCalendar,       path: '/admin/events',         show: isPastor },
    { title: 'Ministries',      icon: FiUsers,          path: '/admin/ministries',     show: isPastor },
    { title: 'Gallery',         icon: FiGrid,           path: '/admin/gallery',        show: isPastor },
    { title: 'Contact',         icon: FiMail,           path: '/admin/contact',        show: isPastor },
    { title: 'Prayer Requests', icon: FiMessageSquare,  path: '/admin/prayer',         show: isPastor },
    { title: 'Users',           icon: FiShield,         path: '/admin/users',          show: isAdmin  },
    { title: 'Settings',        icon: FiSettings,       path: '/admin/settings',       show: true },
  ].filter(l => l.show)

  return (
    <div className="min-h-screen pt-20 pb-20 flex">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-24 left-4 z-50 lg:hidden glass p-3 rounded-xl text-soft-white hover:bg-glass/10 transition-all"
        onMouseEnter={() => setCursorVariant('button')} onMouseLeave={() => setCursorVariant('default')}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-matte-black/80 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="fixed left-0 top-20 bottom-0 w-64 glass-strong border-r border-soft-white/5 z-40 overflow-y-auto lg:translate-x-0">
            <div className="p-6">
              <Link to="/" className="inline-flex items-center gap-2 text-soft-white/50 hover:text-subtle-gold transition-colors mb-8 text-sm group"
                onMouseEnter={() => setCursorVariant('link')} onMouseLeave={() => setCursorVariant('default')}>
                <FiArrowLeft size={14} /><span>View Website</span>
                <FiExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  // FIX: Use exact matching for all sidebar items to prevent multiple active states
                  const isActive = location.pathname === link.path
                  return (
                    <button key={link.path} onClick={() => { navigate(link.path); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm ${isActive ? 'bg-subtle-gold/10 text-subtle-gold border border-subtle-gold/20' : 'text-soft-white/50 hover:text-soft-white hover:bg-glass/10 border border-transparent'}`}
                      onMouseEnter={() => setCursorVariant('link')} onMouseLeave={() => setCursorVariant('default')}>
                      <link.icon size={16} />
                      <span className="flex-1 text-left">{link.title}</span>
                      {isActive && <FiChevronRight size={14} />}
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <Routes>
            <Route index element={<AdminHome setCursorVariant={setCursorVariant} />} />
            <Route path="church-info" element={<ChurchInfoEditor setCursorVariant={setCursorVariant} />} />
            <Route path="hero" element={<HeroEditor setCursorVariant={setCursorVariant} />} />
            <Route path="about" element={<AboutEditor setCursorVariant={setCursorVariant} />} />
            <Route path="sermons" element={<SermonsEditor setCursorVariant={setCursorVariant} />} />
            <Route path="events" element={<EventsEditor setCursorVariant={setCursorVariant} />} />
            <Route path="ministries" element={<MinistriesEditor setCursorVariant={setCursorVariant} />} />
            <Route path="gallery" element={<GalleryEditor setCursorVariant={setCursorVariant} />} />
            <Route path="contact" element={<ContactEditor setCursorVariant={setCursorVariant} />} />
            <Route path="prayer" element={<PrayerRequestsViewer setCursorVariant={setCursorVariant} />} />
            <Route path="users" element={<UserManagement setCursorVariant={setCursorVariant} />} />
            <Route path="settings" element={<SettingsEditor setCursorVariant={setCursorVariant} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

// ════════════════════════════════════════════════════════════════════════════
// PRAYER REQUESTS VIEWER
// ════════════════════════════════════════════════════════════════════════════
const PrayerRequestsViewer = ({ setCursorVariant }) => {
  const [prayers, setPrayers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all') // all | unread | read

  const load = async () => {
    setLoading(true)
    try {
      const { prayerAPI } = await import('../utils/api')
      const data = await prayerAPI.getAll()
      setPrayers(data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [])

  const markRead = async (id) => {
    try {
      const { prayerAPI } = await import('../utils/api')
      await prayerAPI.markRead(id)
      setPrayers(prev => prev.map(p => p.id === id ? { ...p, is_read: true } : p))
    } catch {}
  }

  const filtered = prayers.filter(p => filter === 'all' ? true : filter === 'unread' ? !p.is_read : p.is_read)
  const unreadCount = prayers.filter(p => !p.is_read).length

  return (
    <div>
      <SectionHeader title="Prayer Requests" description={`${prayers.length} total · ${unreadCount} unread`} setCursorVariant={setCursorVariant} />
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','unread','read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm capitalize transition-all duration-300"
            style={{ background: filter === f ? 'var(--accent-bg)' : 'transparent', color: filter === f ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}` }}>
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--text-faint)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiMail} title="No prayer requests" description="Prayer requests will appear here" />
      ) : (
        <div className="space-y-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass p-6 rounded-2xl transition-all duration-300"
              style={{ borderLeft: `3px solid ${p.is_read ? 'var(--border)' : 'var(--accent)'}` }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text)' }}>{p.name}</h4>
                  {p.email && <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{p.email}</p>}
                  {p.pastor_name && <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>→ {p.pastor_name}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                  {p.is_private && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Private</span>}
                  {!p.is_read && (
                    <ActionButton icon={FiCheck} onClick={() => markRead(p.id)} variant="primary" setCursorVariant={setCursorVariant}>
                      Mark Read
                    </ActionButton>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.request}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (Superadmin only)
// ════════════════════════════════════════════════════════════════════════════
const UserManagement = ({ setCursorVariant }) => {
  const { user: currentUser } = useAuth ? useAuth() : { user: null }
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [formData, setFormData] = React.useState({ username: '', email: '', password: '', fullName: '', role: 'pastor' })
  const [saving, setSaving] = React.useState(false)
  const [confirmToggle, setConfirmToggle] = React.useState(null)
  const [resetTarget, setResetTarget] = React.useState(null)
  const [newPassword, setNewPassword] = React.useState('')
  const [feedback, setFeedback] = React.useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { usersAPI } = await import('../utils/api')
      const data = await usersAPI.getAll()
      setUsers(data)
    } catch {} finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { usersAPI } = await import('../utils/api')
      await usersAPI.create(formData)
      setFeedback('User created successfully!')
      setShowForm(false)
      setFormData({ username:'', email:'', password:'', fullName:'', role:'pastor' })
      load()
    } catch (err) { setFeedback(err.message) }
    finally { setSaving(false); setTimeout(() => setFeedback(''), 3000) }
  }

  const handleToggle = async (u) => {
    try {
      const { usersAPI } = await import('../utils/api')
      const result = await usersAPI.toggleActive(u.id)
      setFeedback(result.message)
      setConfirmToggle(null)
      load()
    } catch (err) { setFeedback(err.message) }
    finally { setTimeout(() => setFeedback(''), 3000) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { usersAPI } = await import('../utils/api')
      await usersAPI.resetPassword(resetTarget.id, newPassword)
      setFeedback(`Password reset for ${resetTarget.full_name}`)
      setResetTarget(null); setNewPassword('')
    } catch (err) { setFeedback(err.message) }
    finally { setSaving(false); setTimeout(() => setFeedback(''), 3000) }
  }

  const roleColors = { superadmin: '#C9A96E', pastor: '#3B82F6', teacher: '#10B981' }

  return (
    <div>
      <SectionHeader title="User Management" description="Manage pastors and teachers" setCursorVariant={setCursorVariant} />

      {feedback && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl text-sm text-center"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
          {feedback}
        </motion.div>
      )}

      <div className="mb-6">
        <ActionButton icon={showForm ? FiX : FiPlus} onClick={() => setShowForm(!showForm)} variant="primary" setCursorVariant={setCursorVariant}>
          {showForm ? 'Cancel' : 'Add New User'}
        </ActionButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }} onSubmit={handleCreate}
            className="glass-strong p-8 rounded-2xl space-y-4 mb-8 overflow-hidden">
            <h3 className="text-lg font-display font-semibold" style={{ color: 'var(--text)' }}>Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={e => setFormData(p=>({...p,fullName:e.target.value}))} required />
              <FormInput label="Username" name="username" value={formData.username} onChange={e => setFormData(p=>({...p,username:e.target.value}))} required />
              <FormInput label="Email" name="email" type="email" value={formData.email} onChange={e => setFormData(p=>({...p,email:e.target.value}))} required />
              <FormInput label="Password (min 8 chars)" name="password" type="password" value={formData.password} onChange={e => setFormData(p=>({...p,password:e.target.value}))} required />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Role</label>
              <div className="flex gap-3">
                {['pastor','teacher'].map(r => (
                  <button key={r} type="button" onClick={() => setFormData(p=>({...p,role:r}))}
                    className="px-5 py-2 rounded-lg text-sm capitalize font-medium transition-all duration-300"
                    style={{ background: formData.role===r ? 'var(--accent-bg)' : 'transparent', color: formData.role===r ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${formData.role===r ? 'var(--accent)' : 'var(--border)'}` }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <SaveButton setCursorVariant={setCursorVariant} disabled={saving}>
              {saving ? 'Creating...' : 'Create User'}
            </SaveButton>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--text-faint)' }}>Loading users...</div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass p-5 rounded-2xl flex items-center justify-between gap-4 group"
              style={{ opacity: u.is_active ? 1 : 0.6 }}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ background: roleColors[u.role] || '#666' }}>
                  {u.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{u.full_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--accent-bg)', color: roleColors[u.role] }}>
                      {u.role}
                    </span>
                    {!u.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>@{u.username} · {u.email}</p>
                  {u.last_login && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Last login: {new Date(u.last_login).toLocaleDateString()}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <ActionButton
                  icon={u.is_active ? FiUserX : FiUserCheck}
                  onClick={() => setConfirmToggle(u)}
                  variant={u.is_active ? 'danger' : 'primary'}
                  setCursorVariant={setCursorVariant}>
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </ActionButton>
                <ActionButton icon={FiKey} onClick={() => setResetTarget(u)} setCursorVariant={setCursorVariant}>
                  Reset PW
                </ActionButton>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm toggle dialog */}
      <ConfirmDialog
        isOpen={!!confirmToggle}
        onConfirm={() => handleToggle(confirmToggle)}
        onCancel={() => setConfirmToggle(null)}
        title={confirmToggle?.is_active ? 'Deactivate User' : 'Activate User'}
        message={confirmToggle?.is_active
          ? `Deactivating ${confirmToggle?.full_name} will immediately revoke their access and log them out.`
          : `This will restore ${confirmToggle?.full_name}'s access to the admin panel.`}
        setCursorVariant={setCursorVariant}
      />

      {/* Reset password modal */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={() => setResetTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-strong p-8 rounded-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--text)' }}>Reset Password</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Set new password for {resetTarget?.full_name}</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <FormInput label="New Password (min 8 chars)" name="newpw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <div className="flex gap-3">
                  <SaveButton setCursorVariant={setCursorVariant} disabled={saving}>
                    {saving ? 'Saving...' : 'Reset Password'}
                  </SaveButton>
                  <ActionButton onClick={() => { setResetTarget(null); setNewPassword('') }} setCursorVariant={setCursorVariant}>Cancel</ActionButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
