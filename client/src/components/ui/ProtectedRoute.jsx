import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/ui/LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  if (!isLoggedIn) {
    // Redirect to login, remembering where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
