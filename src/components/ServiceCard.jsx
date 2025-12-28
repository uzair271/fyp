import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Toast from './Toast'
import { useApp } from '../context/AppContext'

const ServiceCard = ({
  serviceName,
  basePrice,
  category,
  onRequest,
  currency = 'USD',
  className = '',
  serviceId,
}) => {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [isRequesting, setIsRequesting] = useState(false)
  const navigate = useNavigate()
  const { authState, addNotification, createRequest } = useApp()

  // Format price with currency
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const handleRequestClick = async () => {
    // Check if user is authenticated
    if (!authState.isAuthenticated || !authState.user) {
      setToastMessage('Please login to request a service')
      setToastType('warning')
      setShowToast(true)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      return
    }

    setIsRequesting(true)

    try {
      // If custom onRequest callback is provided, use it
      if (onRequest) {
        await onRequest({
          serviceName,
          basePrice,
          category,
          serviceId,
        })
      } else {
        // Default behavior: create request and navigate
        const requestData = {
          serviceName,
          basePrice,
          category,
          serviceId: serviceId || Date.now(),
          customerID: authState.user.id,
          status: 'Pending',
          urgency: 'normal',
          distance: 0,
          createdAt: new Date().toISOString(),
        }

        // Create request in global state
        await createRequest(requestData)

        // Add notification
        addNotification({
          type: 'success',
          title: 'Service Requested',
          message: `Your request for ${serviceName} has been submitted successfully!`,
          userId: authState.user.id,
        })
      }

      // Show success toast
      setToastMessage(`Service "${serviceName}" requested successfully!`)
      setToastType('success')
      setShowToast(true)

      // Navigate to request page after a short delay
      setTimeout(() => {
        navigate('/customer/request', {
          state: { serviceName, basePrice, category },
        })
      }, 1500)
    } catch (error) {
      console.error('Error requesting service:', error)
      setToastMessage('Failed to request service. Please try again.')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <>
      <div
        className={`
          bg-white rounded-xl shadow-md
          p-6 md:p-8
          transition-all duration-300 ease-in-out
          hover:shadow-xl hover:-translate-y-2
          border border-gray-100
          flex flex-col
          h-full
          focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2
          ${className}
        `}
        role="article"
        aria-label={`Service card for ${serviceName}`}
      >
        {/* Category Badge */}
        {category && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs md:text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full border border-indigo-200">
              {category}
            </span>
          </div>
        )}

        {/* Service Name */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          {serviceName}
        </h3>

        {/* Price */}
        <div className="mb-6 flex items-baseline">
          <span className="text-3xl md:text-4xl font-extrabold text-gray-900">
            {formatPrice(basePrice, currency)}
          </span>
          <span className="ml-2 text-sm md:text-base text-gray-500">
            base price
          </span>
        </div>

        {/* Request Now Button */}
        <div className="mt-auto">
          <Button
            label="Request Now"
            onClick={handleRequestClick}
            type="primary"
            loading={isRequesting}
            disabled={isRequesting}
            className="w-full"
            ariaLabel={`Request service: ${serviceName}`}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}

export default ServiceCard
