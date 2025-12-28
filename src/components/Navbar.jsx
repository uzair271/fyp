import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const Navbar = ({ customLinks = null }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { authState, logout } = useApp()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const isAuthenticated = !!authState.token
  const userRole = authState.role

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar-container')) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  // Determine navigation links based on authentication and role
  const getNavLinks = () => {
    if (customLinks) return customLinks

    if (!isAuthenticated) {
      return [
        { path: '/', label: 'Home' },
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' },
      ]
    }

    // Role-based navigation
    if (userRole === 'customer') {
      return [
        { path: '/customer/dashboard', label: 'Dashboard' },
        { path: '/customer/history', label: 'History' },
        { path: '/customer/profile', label: 'Profile' },
      ]
    } else if (userRole === 'mechanic') {
      return [
        { path: '/mechanic/dashboard', label: 'Dashboard' },
        { path: '/mechanic/profile', label: 'Profile' },
      ]
    } else if (userRole === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
      ]
    }

    return [
      { path: '/', label: 'Home' },
      { path: '/login', label: 'Login' },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <nav
      className={`navbar-container sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200'
          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/App Name */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className={`
                flex items-center space-x-2 font-bold text-xl md:text-2xl
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md px-2 py-1
                ${
                  isScrolled
                    ? 'text-indigo-600 hover:text-indigo-700 focus:ring-indigo-500'
                    : 'text-white hover:opacity-90 focus:ring-white focus:ring-offset-transparent'
                }
              `}
              aria-label="Go to home page"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="font-extrabold">Vehicle Maintenance System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 font-medium rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      isScrolled
                        ? isActive
                          ? 'bg-indigo-100 text-indigo-700 focus:ring-indigo-500'
                          : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
                        : isActive
                        ? 'bg-white/30 text-white'
                        : 'text-white hover:bg-white/20 focus:ring-white focus:ring-offset-transparent'
                    }
                    hover:scale-105 active:scale-95
                  `}
                  aria-label={`Navigate to ${link.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`
                  px-4 py-2 font-medium rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 ml-2
                  ${
                    isScrolled
                      ? 'text-red-600 hover:bg-red-50 focus:ring-red-500'
                      : 'text-white hover:bg-red-500/30 focus:ring-white focus:ring-offset-transparent'
                  }
                  hover:scale-105 active:scale-95
                `}
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`
              md:hidden flex items-center justify-center w-10 h-10 rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                isScrolled
                  ? 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
                  : 'text-white hover:bg-white/20 focus:ring-white focus:ring-offset-transparent'
              }
            `}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
              <span
                className={`
                  block h-0.5 w-6 transition-all duration-300
                  ${isScrolled ? 'bg-gray-700' : 'bg-white'}
                  ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}
                `}
              />
              <span
                className={`
                  block h-0.5 w-6 transition-all duration-300
                  ${isScrolled ? 'bg-gray-700' : 'bg-white'}
                  ${isMenuOpen ? 'opacity-0' : 'opacity-100'}
                `}
              />
              <span
                className={`
                  block h-0.5 w-6 transition-all duration-300
                  ${isScrolled ? 'bg-gray-700' : 'bg-white'}
                  ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}
                `}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
          aria-hidden={!isMenuOpen}
        >
          <div className={`px-2 pt-2 pb-4 space-y-1 border-t ${
            isScrolled ? 'border-gray-200' : 'border-white/20'
          }`}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    block w-full text-left px-4 py-3 font-medium rounded-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      isScrolled
                        ? isActive
                          ? 'bg-indigo-100 text-indigo-700 focus:ring-indigo-500'
                          : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
                        : isActive
                        ? 'bg-white/30 text-white'
                        : 'text-white hover:bg-white/20 focus:ring-white focus:ring-offset-transparent'
                    }
                    active:bg-opacity-30
                  `}
                  aria-label={`Navigate to ${link.label}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`
                  block w-full text-left px-4 py-3 font-medium rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    isScrolled
                      ? 'text-red-600 hover:bg-red-50 focus:ring-red-500'
                      : 'text-white hover:bg-red-500/30 focus:ring-white focus:ring-offset-transparent'
                  }
                  active:bg-opacity-40
                `}
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
