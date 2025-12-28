import { useEffect, useRef, useState } from 'react'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  content,
  actions = [],
  className = '',
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  closeOnOutsideClick = true,
  closeOnEsc = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, closeOnEsc, onClose])

  // Handle outside click
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    // Use setTimeout to avoid immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeOnOutsideClick, onClose])

  // Focus trap and management
  useEffect(() => {
    if (!isOpen) return

    // Store previous focus
    previousFocusRef.current = document.activeElement

    // Find all focusable elements
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements && focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0]
      lastFocusableRef.current = focusableElements[focusableElements.length - 1]

      // Focus first element
      firstFocusableRef.current?.focus()
    }

    // Handle tab key for focus trap
    const handleTab = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)

    // Restore focus on close
    return () => {
      document.removeEventListener('keydown', handleTab)
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Allow body scroll when modal is closed
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  if (!isOpen && !isAnimating) return null

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
        transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby="modal-content"
      onClick={(e) => {
        if (closeOnOutsideClick && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-50' : 'opacity-0'}
        `}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative z-10
          bg-white rounded-2xl shadow-2xl
          w-full ${sizeClasses[size]}
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={() => {
          if (!isOpen) {
            setIsAnimating(false)
          }
        }}
      >
        {/* Header */}
        {(title || closeOnOutsideClick) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2
                id="modal-title"
                className="text-2xl font-bold text-gray-900"
              >
                {title}
              </h2>
            )}
            {closeOnOutsideClick && (
              <button
                onClick={onClose}
                className="
                  ml-auto
                  p-2 rounded-lg
                  text-gray-400 hover:text-gray-600
                  hover:bg-gray-100
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                "
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          id="modal-content"
          className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]"
        >
          {typeof content === 'string' ? (
            <p className="text-gray-700">{content}</p>
          ) : (
            content
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {actions.map((action, index) => {
              // If action is a Button component or has Button-like props
              if (typeof action === 'object' && action.label) {
                return (
                  <Button
                    key={index}
                    label={action.label}
                    onClick={action.onClick || onClose}
                    type={action.type || 'primary'}
                    disabled={action.disabled}
                    loading={action.loading || action.isLoading}
                    className={action.className || ''}
                    ariaLabel={action.ariaLabel}
                  />
                )
              }
              // If action is a React element
              return <div key={index}>{action}</div>
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
