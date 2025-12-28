import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import Toast from '../components/Toast'

const RequestStatusPage = ({ requestID }) => {
  const navigate = useNavigate()
  const { requests, fetchRequests, authState } = useApp()
  const [requestData, setRequestData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Fetch request data from global state
  const fetchRequestData = async (id) => {
    try {
      // Fetch all requests from context
      const allRequests = await fetchRequests()
      const foundRequest = allRequests.find(req => req.id === id || req.id === `REQ-${id}`)
      
      if (foundRequest) {
        // Map request data to display format
        const mappedData = {
          id: foundRequest.id,
          service: foundRequest.serviceName || 'Service',
          mechanic: foundRequest.mechanicName || 'Not assigned yet',
          status: foundRequest.status || 'Pending',
          urgency: foundRequest.urgency || 'normal',
          price: foundRequest.price || foundRequest.finalPrice || 0,
          vehicle: foundRequest.vehicle || 'N/A',
          distance: foundRequest.distance || 0,
          createdAt: foundRequest.createdAt,
          estimatedCompletion: foundRequest.estimatedCompletion,
        }
        setRequestData(mappedData)
      } else {
        // Fallback to mock data if not found
        const mockData = {
          id: id || 'REQ-001',
          service: 'Oil Change',
          mechanic: 'Not assigned yet',
          status: 'Pending',
          urgency: 'normal',
          price: 74.99,
          vehicle: 'Toyota Camry 2020',
          distance: 25,
          createdAt: new Date().toISOString(),
          estimatedCompletion: null,
        }
        setRequestData(mockData)
      }
    } catch (error) {
      console.error('Error fetching request data:', error)
      setToastMessage('Failed to load request details')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount and when requestID changes
  useEffect(() => {
    if (requestID) {
      setIsLoading(true)
      fetchRequestData(requestID)
    }
  }, [requestID])

  // Watch for changes in global requests state
  useEffect(() => {
    if (requestID && requests.length > 0 && requestData) {
      const foundRequest = requests.find(req => req.id === requestID || req.id === `REQ-${requestID}`)
      if (foundRequest) {
        // Update if status changed
        if (foundRequest.status !== requestData.status) {
          const mappedData = {
            ...requestData,
            service: foundRequest.serviceName || requestData.service,
            mechanic: foundRequest.mechanicName || requestData.mechanic,
            status: foundRequest.status,
            urgency: foundRequest.urgency || requestData.urgency,
            price: foundRequest.price || foundRequest.finalPrice || requestData.price,
          }
          setRequestData(mappedData)
          setToastMessage('Request status updated!')
          setToastType('success')
          setShowToast(true)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, requestID])

  // Handle refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchRequestData(requestID)
      setToastMessage('Request status refreshed!')
      setToastType('success')
      setShowToast(true)
    } catch (error) {
      console.error('Error refreshing request:', error)
      setToastMessage('Failed to refresh request status')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Status configuration
  const statusConfig = {
    pending: { label: 'Pending', step: 0, color: 'yellow' },
    accepted: { label: 'Accepted', step: 1, color: 'blue' },
    'in-progress': { label: 'In-Progress', step: 2, color: 'purple' },
    inprogress: { label: 'In-Progress', step: 2, color: 'purple' },
    completed: { label: 'Completed', step: 3, color: 'green' },
  }

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '-')
    return statusConfig[statusLower] || statusConfig.pending
  }

  const getStatusBadgeColor = (status) => {
    const config = getStatusConfig(status)
    const colorMap = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
    }
    return colorMap[config.color] || colorMap.yellow
  }

  const getUrgencyBadgeColor = (urgency) => {
    const urgencyLower = urgency?.toLowerCase()
    if (urgencyLower === 'emergency' || urgencyLower === 'urgent') {
      return 'bg-red-100 text-red-700 border-red-200'
    }
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading request details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 mb-4 font-medium">Request not found</p>
            <Button
              label="Go Back"
              onClick={() => navigate(-1)}
              type="primary"
              ariaLabel="Go back to previous page"
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentStatus = getStatusConfig(requestData.status)
  const progressPercentage = (currentStatus.step / 3) * 100

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="max-w-4xl mx-auto">
            {/* Header with Refresh Button */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 mb-6 md:mb-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                    Request Status
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg">
                    Request ID: <span className="font-mono font-semibold text-indigo-600">{requestData.id}</span>
                  </p>
                </div>
                <Button
                  label="Refresh"
                  onClick={handleRefresh}
                  loading={isRefreshing}
                  type="secondary"
                  className="sm:w-auto w-full"
                  ariaLabel="Refresh request status"
                />
              </div>
            </div>

            {/* Status Progress Bar */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 mb-6 md:mb-8 transform transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Status Progress
              </h2>
              
              {/* Progress Steps */}
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full" aria-hidden="true">
                  <div
                    className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={currentStatus.step}
                    aria-valuemin="0"
                    aria-valuemax="3"
                    aria-label={`Progress: ${currentStatus.label}`}
                  />
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {Object.values(statusConfig).map((status, index) => {
                    const isActive = index <= currentStatus.step
                    const isCurrent = index === currentStatus.step
                    
                    return (
                      <div key={status.label} className="flex flex-col items-center flex-1">
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            transition-all duration-300 ease-in-out
                            transform hover:scale-110
                            ${
                              isCurrent
                                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white scale-110 shadow-lg ring-4 ring-indigo-200'
                                : isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-500'
                            }
                          `}
                          aria-label={`Status: ${status.label}${isCurrent ? ' (Current)' : isActive ? ' (Completed)' : ' (Pending)'}`}
                        >
                          {isActive ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span
                          className={`
                            mt-3 text-xs md:text-sm font-semibold text-center
                            transition-colors duration-300
                            ${isCurrent ? 'text-indigo-600' : isActive ? 'text-gray-700' : 'text-gray-400'}
                          `}
                        >
                          {status.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Request Details Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Request Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Service */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 md:p-5 border border-indigo-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Service
                  </label>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {requestData.service}
                  </p>
                </div>

                {/* Mechanic */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-5 border border-purple-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Mechanic Assigned
                  </label>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {requestData.mechanic || 'Not assigned yet'}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 md:p-5 border border-yellow-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Status
                  </label>
                  <span
                    className={`
                      inline-block px-4 py-2 rounded-full text-sm font-bold border-2
                      ${getStatusBadgeColor(requestData.status)}
                    `}
                    aria-label={`Request status: ${requestData.status}`}
                  >
                    {requestData.status}
                  </span>
                </div>

                {/* Urgency */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 md:p-5 border border-red-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Urgency
                  </label>
                  <span
                    className={`
                      inline-block px-4 py-2 rounded-full text-sm font-bold border-2
                      ${getUrgencyBadgeColor(requestData.urgency)}
                    `}
                    aria-label={`Urgency level: ${requestData.urgency}`}
                  >
                    {requestData.urgency}
                  </span>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-5 border border-green-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Price
                  </label>
                  <p className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    {formatPrice(requestData.price)}
                  </p>
                </div>

                {/* Vehicle */}
                {requestData.vehicle && requestData.vehicle !== 'N/A' && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 md:p-5 border border-blue-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Vehicle
                    </label>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {requestData.vehicle}
                    </p>
                  </div>
                )}

                {/* Distance */}
                {requestData.distance && requestData.distance > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 md:p-5 border border-teal-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Distance
                    </label>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {requestData.distance} km
                    </p>
                  </div>
                )}

                {/* Created At */}
                {requestData.createdAt && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 md:p-5 border border-gray-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Created At
                    </label>
                    <p className="text-sm md:text-base text-gray-700 font-medium">
                      {formatDate(requestData.createdAt)}
                    </p>
                  </div>
                )}

                {/* Estimated Completion */}
                {requestData.estimatedCompletion && (
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 md:p-5 border border-violet-100 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Estimated Completion
                    </label>
                    <p className="text-sm md:text-base text-gray-700 font-medium">
                      {formatDate(requestData.estimatedCompletion)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
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

export default RequestStatusPage
