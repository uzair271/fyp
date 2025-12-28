import { useEffect, useState, useRef } from 'react'

// Export calculatePrice function for use in other components
export const calculatePrice = (basePrice, distance, urgency) => {
  let price = basePrice
  price += distance * 10
  if (urgency === 'emergency' || urgency?.toLowerCase() === 'emergency') {
    price += 50
  }
  // Round to 2 decimal places
  return Math.round(price * 100) / 100
}

const DynamicPricing = ({
  basePrice = 0,
  distance = 0,
  urgency = 'normal',
  currency = 'USD',
  className = '',
}) => {
  const [displayPrice, setDisplayPrice] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousPriceRef = useRef(0)
  const announcementRef = useRef(null)

  // Format price with currency
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  // Calculate and update price when inputs change
  useEffect(() => {
    const newPrice = calculatePrice(basePrice, distance, urgency)
    
    if (newPrice !== previousPriceRef.current) {
      setIsAnimating(true)
      setDisplayPrice(newPrice)
      previousPriceRef.current = newPrice
      
      // Announce price change to screen readers
      if (announcementRef.current) {
        announcementRef.current.textContent = `Price updated to ${formatPrice(newPrice, currency)}`
      }
      
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [basePrice, distance, urgency, currency])

  const formattedPrice = formatPrice(displayPrice, currency)

  return (
    <div
      className={`
        bg-gradient-to-br from-gray-50 to-gray-100
        rounded-xl p-4 md:p-6
        shadow-inner border border-gray-200
        ${className}
      `}
      role="region"
      aria-label="Dynamic Price Calculation"
    >
      {/* Label */}
      <div className="mb-3">
        <p className="text-sm md:text-base font-medium text-gray-700">
          Calculated Price
        </p>
      </div>

      {/* Price Display */}
      <div className="relative">
        <div
          className={`
            bg-white rounded-lg
            px-4 py-3 md:px-6 md:py-4
            border-2 border-gray-300
            shadow-md
            transition-all duration-300 ease-in-out
            ${isAnimating ? 'scale-105 border-indigo-500 shadow-lg' : 'scale-100'}
          `}
        >
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`
                text-3xl md:text-4xl lg:text-5xl font-extrabold
                transition-colors duration-300 ease-in-out
                ${isAnimating ? 'text-indigo-600' : 'text-gray-900'}
              `}
              aria-live="polite"
              aria-atomic="true"
            >
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Animation indicator */}
        {isAnimating && (
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full animate-ping"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Price breakdown (optional, for transparency) */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
            <span className="font-semibold text-gray-700">Base:</span>{' '}
            <span className="text-gray-900 font-medium">{formatPrice(basePrice, currency)}</span>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
            <span className="font-semibold text-gray-700">Distance:</span>{' '}
            <span className="text-gray-900 font-medium">{distance} km × $10 = {formatPrice(distance * 10, currency)}</span>
          </div>
          <div className="col-span-2 md:col-span-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <span className="font-semibold text-gray-700">Urgency:</span>{' '}
            <span className="text-gray-900 font-medium">
              {urgency === 'emergency' || urgency?.toLowerCase() === 'emergency' 
                ? `Emergency (+${formatPrice(50, currency)})` 
                : 'Normal (+$0.00)'}
            </span>
          </div>
        </div>
      </div>

      {/* Screen reader announcement - ARIA live region */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        Price updated to {formattedPrice}
      </div>
    </div>
  )
}

export default DynamicPricing
