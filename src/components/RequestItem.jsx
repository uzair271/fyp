import { useState } from 'react'
import Button from './Button'
import Toast from './Toast'
import { useApp } from '../context/AppContext'

const RequestItem = ({
  customerName,
  serviceName,
  urgency = 'normal',
  price,
  status = 'Pending',
  onAccept,
  onReject,
  currency = 'USD',
  className = '',
  requestId,
}) => {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)
  
  const { updateRequest, addNotification, authState } = useApp()

  // Format price with currency
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  // Urgency badge styles
  const getUrgencyStyles = (urgency) => {
    const urgencyLower = urgency.toLowerCase()
    if (urgencyLower === 'emergency' || urgencyLower === 'urgent') {
      return 'bg-red-100 text-red-700 border-red-200'
    }
    return 'bg-green-100 text-green-700 border-green-200'
  }

  // Status badge styles with color-coded stages
  const getStatusStyles = (status) => {
    const statusLower = status.toLowerCase().replace(/\s+/g, '-')
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress':
      case 'inprogress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isPending = currentStatus.toLowerCase() === 'pending'

  const handleAccept = async () => {
    if (!isPending || isProcessing) return

    setIsProcessing(true)

    try {
      // If custom onAccept callback is provided, use it
      if (onAccept) {
        await onAccept({
          customerName,
          serviceName,
          price,
          status: currentStatus,
          requestId,
        })
      } else {
        // Default behavior: update request status in global state
        if (requestId) {
          await updateRequest(requestId, {
            status: 'Accepted',
            mechanicId: authState.user?.id,
          })
        }
      }

      // Update local status
      setCurrentStatus('Accepted')

      // Add notification
      addNotification({
        type: 'success',
        title: 'Request Accepted',
        message: `You have accepted the request for ${serviceName} from ${customerName}`,
        userId: authState.user?.id,
      })

      // Show success toast
      setToastMessage(`Request accepted successfully!`)
      setToastType('success')
      setShowToast(true)
    } catch (error) {
      console.error('Error accepting request:', error)
      setToastMessage('Failed to accept request. Please try again.')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!isPending || isProcessing) return

    // Confirm rejection
    const confirmed = window.confirm(
      `Are you sure you want to reject the request for ${serviceName} from ${customerName}?`
    )

    if (!confirmed) return

    setIsProcessing(true)

    try {
      // If custom onReject callback is provided, use it
      if (onReject) {
        await onReject({
          customerName,
          serviceName,
          price,
          status: currentStatus,
          requestId,
        })
      } else {
        // Default behavior: update request status in global state
        if (requestId) {
          await updateRequest(requestId, {
            status: 'Rejected',
          })
        }
      }

      // Update local status
      setCurrentStatus('Rejected')

      // Add notification
      addNotification({
        type: 'info',
        title: 'Request Rejected',
        message: `You have rejected the request for ${serviceName} from ${customerName}`,
        userId: authState.user?.id,
      })

      // Show info toast
      setToastMessage(`Request rejected.`)
      setToastType('info')
      setShowToast(true)
    } catch (error) {
      console.error('Error rejecting request:', error)
      setToastMessage('Failed to reject request. Please try again.')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const urgencyLabel = urgency.toLowerCase() === 'emergency' || urgency.toLowerCase() === 'urgent' 
    ? 'Emergency' 
    : 'Normal'

  const statusLabel = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)

  return (
    <>
      <div
        className={`
          bg-white rounded-xl shadow-md
          p-4 md:p-6
          border border-gray-200
          transition-all duration-200 ease-in-out
          hover:shadow-lg hover:-translate-y-1
          focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2
          ${className}
        `}
        role="article"
        aria-label={`Service request from ${customerName} for ${serviceName}, status: ${currentStatus}`}
      >
        {/* Header with badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Urgency Badge - Red for emergency, Green for normal */}
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                border ${getUrgencyStyles(urgency)}
                transition-colors duration-200
              `}
              aria-label={`Urgency level: ${urgencyLabel}`}
            >
              {urgencyLabel}
            </span>

            {/* Status Badge - Color-coded stages */}
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                border ${getStatusStyles(currentStatus)}
                transition-colors duration-200
              `}
              aria-label={`Request status: ${statusLabel}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Customer Name */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1" aria-label="Customer name">
            Customer
          </p>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            {customerName}
          </h3>
        </div>

        {/* Service Name */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1" aria-label="Service requested">
            Service
          </p>
          <p className="text-base md:text-lg font-semibold text-gray-800">
            {serviceName}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1" aria-label="Service price">
            Price
          </p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {formatPrice(price, currency)}
          </p>
        </div>

        {/* Action Buttons - Only enabled when status is Pending */}
        {isPending && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              label="Accept"
              onClick={handleAccept}
              type="primary"
              disabled={!isPending || isProcessing}
              loading={isProcessing}
              className="flex-1"
              ariaLabel={`Accept request from ${customerName} for ${serviceName}`}
            />
            <Button
              label="Reject"
              onClick={handleReject}
              type="secondary"
              disabled={!isPending || isProcessing}
              loading={isProcessing}
              className="flex-1"
              ariaLabel={`Reject request from ${customerName} for ${serviceName}`}
            />
          </div>
        )}

        {/* Status message when not pending */}
        {!isPending && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center" role="status" aria-live="polite">
              This request has been <span className="font-semibold">{currentStatus.toLowerCase()}</span>. Actions are disabled.
            </p>
          </div>
        )}
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

export default RequestItem
