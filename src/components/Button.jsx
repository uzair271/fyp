const Button = ({
  label,
  onClick,
  type = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ariaLabel,
  buttonType = 'button',
  ...rest
}) => {
  // Base styles for all buttons
  const baseStyles = `
    inline-flex items-center justify-center
    px-4 py-2 md:px-6 md:py-3
    text-sm md:text-base font-semibold
    rounded-xl
    shadow-md
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
    active:scale-95
    min-w-[100px]
    relative
    overflow-hidden
  `.trim().replace(/\s+/g, ' ')

  // Type-specific styles with modern gradient colors
  const typeStyles = {
    primary: `
      text-white
      focus:ring-indigo-500
    `.trim().replace(/\s+/g, ' '),
    secondary: `
      bg-white
      text-gray-700
      border-2 border-gray-300
      hover:bg-gray-50
      hover:border-indigo-400
      hover:shadow-lg hover:scale-105
      focus:ring-indigo-500
      active:bg-gray-100
      disabled:bg-gray-100 disabled:text-gray-400
    `.trim().replace(/\s+/g, ' '),
  }

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${typeStyles[type] || typeStyles.primary}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const isDisabled = disabled || loading

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    
    // For submit buttons, don't prevent default - let form handle it
    if (buttonType === 'submit') {
      // Still call onClick if provided (for additional logic)
      if (onClick) {
        onClick(e)
      }
      // Don't prevent default - let form submit naturally
      return
    }
    
    // For non-submit buttons, prevent default if onClick is provided
    if (onClick) {
      e.preventDefault()
      onClick(e)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!isDisabled && onClick) {
        onClick(e)
      }
    }
  }

  // Primary button background style
  const primaryBackgroundStyle = isDisabled
    ? {
        background: '#9ca3af', // gray-400
      }
    : {
        background: 'linear-gradient(to right, #4f46e5, #9333ea, #ec4899)', // indigo-600, purple-600, pink-600
      }

  const primaryHoverStyle = !isDisabled
    ? {
        background: 'linear-gradient(to right, #4338ca, #7e22ce, #db2777)', // indigo-700, purple-700, pink-700
      }
    : {}

  return (
    <button
      type={buttonType}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      className={buttonStyles}
      aria-label={ariaLabel || label}
      aria-disabled={isDisabled}
      aria-busy={loading}
      style={
        type === 'primary'
          ? {
              ...primaryBackgroundStyle,
              color: '#ffffff',
              ...rest.style,
            }
          : { ...rest.style }
      }
      onMouseEnter={(e) => {
        if (type === 'primary' && !isDisabled) {
          Object.assign(e.currentTarget.style, primaryHoverStyle)
        }
        if (rest.onMouseEnter) rest.onMouseEnter(e)
      }}
      onMouseLeave={(e) => {
        if (type === 'primary' && !isDisabled) {
          Object.assign(e.currentTarget.style, primaryBackgroundStyle)
        }
        if (rest.onMouseLeave) rest.onMouseLeave(e)
      }}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center" style={{ color: 'inherit' }}>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ color: 'inherit' }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span style={{ color: 'inherit' }}>Loading...</span>
        </span>
      ) : (
        <span style={{ color: type === 'primary' ? '#ffffff' : 'inherit' }}>{label}</span>
      )}
    </button>
  )
}

export default Button
