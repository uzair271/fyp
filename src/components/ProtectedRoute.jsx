import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const ProtectedRoute = ({ children, allowedRoles = [], isAuthenticated = false, userRole = null }) => {
  const location = useLocation()
  const previousPathRef = useRef(null)

  // Focus management for accessibility
  useEffect(() => {
    // Store previous path for smooth transitions
    previousPathRef.current = location.pathname

    // Focus management: focus main content on route change
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1')
      mainContent.focus()
      mainContent.removeAttribute('tabindex')
    }
  }, [location.pathname])

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    // Redirect based on role
    if (userRole === 'customer') {
      return <Navigate to="/customer/dashboard" replace />
    } else if (userRole === 'mechanic') {
      return <Navigate to="/mechanic/dashboard" replace />
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

