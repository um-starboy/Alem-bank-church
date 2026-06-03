import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, setTokens, clearTokens, getAccessToken } from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken()
      if (!token) { setLoading(false); return }
      try {
        const me = await authAPI.me()
        setUser(me)
      } catch {
        clearTokens()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authAPI.login(username, password)
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    localStorage.setItem('authUser', JSON.stringify(data.user))
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await authAPI.logout(refreshToken)
    } catch { /* ignore */ }
    clearTokens()
    setUser(null)
  }, [])

  const isAdmin     = user?.role === 'superadmin'
  const isPastor    = user?.role === 'pastor' || isAdmin
  const isTeacher   = user?.role === 'teacher' || isPastor
  const isLoggedIn  = !!user

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isLoggedIn, isAdmin, isPastor, isTeacher,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
