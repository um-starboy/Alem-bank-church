import React, { useState, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { ChurchDataProvider } from './context/ChurchDataContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { useIsTouchDevice, usePrefersReducedMotion } from './hooks/useMediaQuery'
import Navbar from './components/layout/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import NoiseOverlay from './components/effects/NoiseOverlay'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ScrollToTop from './utils/ScrollToTop'
import LoadingScreen from './components/ui/LoadingScreen'

const HomePage       = lazy(() => import('./pages/HomePage'))
const LoginPage      = lazy(() => import('./pages/LoginPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'))

function AppInner() {
  const [cursorVariant, setCursorVariant] = useState('default')
  const isTouchDevice = useIsTouchDevice()
  const prefersReducedMotion = usePrefersReducedMotion()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  const handleSetCursorVariant = useCallback((v) => {
    if (!isTouchDevice) setCursorVariant(v)
  }, [isTouchDevice])

  const showCustomCursor = !isTouchDevice && !prefersReducedMotion

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <a href="#main-content" className="skip-to-main">Skip to main content</a>

      {showCustomCursor && (
        <>
          <CustomCursor variant={cursorVariant} />
          <NoiseOverlay />
        </>
      )}

      <ScrollToTop />
      {!isLoginPage && <Navbar setCursorVariant={handleSetCursorVariant} />}

      <main id="main-content">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage setCursorVariant={handleSetCursorVariant} />} />
              <Route path="/login" element={<LoginPage setCursorVariant={handleSetCursorVariant} />} />
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminDashboard setCursorVariant={handleSetCursorVariant} />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage setCursorVariant={handleSetCursorVariant} />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChurchDataProvider>
            <AppInner />
          </ChurchDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
