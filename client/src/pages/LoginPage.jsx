import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiHome } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { t, tx } from '../utils/translations'
import ThemeLangSwitcher from '../components/ui/ThemeLangSwitcher'

const LoginPage = ({ setCursorVariant }) => {
  const { login } = useAuth()
  const { lang } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px 16px 14px 44px',
    color: 'var(--text)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="cinematic-light w-[500px] h-[500px] top-1/4 -left-1/4" style={{ background: 'var(--accent)' }} />
        <div className="cinematic-light w-[400px] h-[400px] bottom-1/4 -right-1/4" style={{ background: 'var(--accent-hover)' }} />
      </div>

      {/* Top bar */}
      <div className="fixed top-4 left-0 right-0 flex items-center justify-between px-6 z-10">
        <Link to="/" className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}>
          <FiHome size={16} />{tx(t.nav.home, lang)}
        </Link>
        <ThemeLangSwitcher setCursorVariant={setCursorVariant} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">

        {/* Logo & header */}
        <div className="text-center mb-8">
          <img src="/church-logo.jpg" alt="Church logo"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
            style={{ border: '3px solid var(--accent)', boxShadow: '0 0 30px rgba(201,169,110,0.2)' }} />
          <h1 className="text-3xl font-display font-bold gradient-text mb-1">አለም ባንክ ገነት</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {lang === 'am' ? 'ወደ አስተዳዳሪ ፓናል ለመግባት መግቢያ' : 'Sign in to the admin panel'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                {lang === 'am' ? 'የተጠቃሚ ስም' : 'Username'}
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2" size={16}
                  style={{ color: 'var(--text-faint)' }} />
                <input style={inputStyle} value={form.username} autoComplete="username"
                  onChange={e => { setForm(p => ({...p, username: e.target.value})); setError('') }}
                  placeholder={lang === 'am' ? 'የተጠቃሚ ስምዎን ያስገቡ' : 'Enter your username'}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                {lang === 'am' ? 'የይለፍ ቃል' : 'Password'}
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" size={16}
                  style={{ color: 'var(--text-faint)' }} />
                <input style={{ ...inputStyle, paddingRight: '44px' }}
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  autoComplete="current-password"
                  onChange={e => { setForm(p => ({...p, password: e.target.value})); setError('') }}
                  placeholder={lang === 'am' ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password'}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm p-3 rounded-lg text-center"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={() => setCursorVariant?.('button')} onMouseLeave={() => setCursorVariant?.('default')}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>{lang === 'am' ? 'ግባ' : 'Sign In'}</span><FiArrowRight size={18} /></>}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {lang === 'am' ? 'ወይም' : 'or'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Browse as guest */}
          <Link to="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 glass"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
            <FiHome size={15} />
            {lang === 'am' ? 'እንደ እንግዳ ይሰሰሱ' : 'Browse as Guest'}
          </Link>
        </div>

        {/* Role info */}
        <div className="mt-6 glass rounded-xl p-4">
          <p className="text-xs font-medium mb-3 text-center" style={{ color: 'var(--text-faint)' }}>
            {lang === 'am' ? 'የሚኖሩ ሚናዎች' : 'Available Roles'}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { role: lang === 'am' ? 'ሱፐር አስተዳዳሪ' : 'Super Admin', color: '#C9A96E', desc: lang === 'am' ? 'ሁሉንም ያስተዳድሩ' : 'Manages everything' },
              { role: lang === 'am' ? 'ፓስተር' : 'Pastor', color: '#3B82F6', desc: lang === 'am' ? 'ይዘት ያስተዳድሩ' : 'Manages content' },
              { role: lang === 'am' ? 'መምህር' : 'Teacher', color: '#10B981', desc: lang === 'am' ? 'ስብከቶች ብቻ' : 'Sermons only' },
            ].map(r => (
              <div key={r.role} className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: r.color }}>{r.role}</div>
                <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
