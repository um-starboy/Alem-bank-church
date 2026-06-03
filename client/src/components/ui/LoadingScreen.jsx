import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }} role="status" aria-label="Loading">
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center">
      <img src="/church-logo.jpg" alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 animate-pulse" style={{ border: '2px solid var(--accent)' }} />
      <div className="w-8 h-8 border-2 border-t-2 rounded-full animate-spin mx-auto"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </motion.div>
  </div>
)
export default LoadingScreen
