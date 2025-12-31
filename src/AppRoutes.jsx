import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboard from './pages/CustomerDashboard'
import ServiceRequestPage from './pages/ServiceRequestPage'
import RequestStatusPage from './pages/RequestStatusPage'
import RequestStatusWrapper from './components/RequestStatusWrapper'
import ServiceHistoryPage from './pages/ServiceHistoryPage'
import ProfilePage from './pages/ProfilePage'
import MechanicDashboard from './pages/MechanicDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Test from './pages/Test'
import MechanicHistoryPage from './pages/MechanicHistoryPage'

const AppRoutes = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')

  // Use App Context for global state
  const { authState } = useApp()

  const isAuthenticated = !!authState.token
  const userRole = authState.role

  // Smooth page transitions
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut')
    }
  }, [location, displayLocation])

  const onTransitionEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn')
      setDisplayLocation(location)
    }
  }

  // Focus management for accessibility
  useEffect(() => {
    // Focus main content on route change
    const timer = setTimeout(() => {
      const mainContent = document.querySelector('main')
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1')
        mainContent.focus()
        mainContent.removeAttribute('tabindex')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div
      className={`transition-opacity duration-300 ${transitionStage === 'fadeOut' ? 'opacity-0' : 'opacity-100'}`}
      onTransitionEnd={onTransitionEnd}
    >
      <Routes location={displayLocation}>
        {/* Public Routes */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            
              <CustomerDashboard />
         
          }
        />
        <Route
          path="/customer/request"
          element={
           
              <ServiceRequestPage />
         
          }
        />
        <Route
          path="/customer/status/:id"
          element={
          
              <RequestStatusWrapper />
           
          }
        />
        <Route
          path="/customer/view-request"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={['customer']}
            >
              <Test />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/history"
          element={
          
              <ServiceHistoryPage />
        
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={['customer']}
            >
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Mechanic Routes */}
        <Route
          path="/mechanic/dashboard"
          element={ 
              <MechanicDashboard />
          }
        />
        <Route
          path="/mechanic/requests/:id"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={['mechanic']}
            >
              <RequestStatusWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic/profile"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={['mechanic']}
            >
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mechanic/history"
          element={<MechanicHistoryPage></MechanicHistoryPage>}
        />

        {/* Admin Routes (Optional) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={['admin']}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={<NotFoundPage navigate={navigate} />}
        />
      </Routes>
    </div>
  )
}

// 404 Not Found Component
const NotFoundPage = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Go to home page"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Go back"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppRoutes
