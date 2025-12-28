import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RequestList from '../components/RequestList'
import Toast from '../components/Toast'

const MechanicDashboard = () => {
  const navigate = useNavigate()
  const { authState, requests: contextRequests, updateRequest, addNotification } = useApp()
  const userName = authState.user?.name || 'Mechanic'
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Use requests from context or fallback to default
  // Filter to show only pending requests for mechanics
  const requests = useMemo(() => {
    if (contextRequests.length > 0) {
      // Map requests to display format
      return contextRequests
        .filter(req => req.status === 'Pending' || req.status === 'pending')
        .map(r => ({
          id: r.id,
          customerName: r.customerName || 'Customer',
          serviceName: r.serviceName || r.service || 'Service',
          urgency: r.urgency || 'normal',
          price: r.price || r.finalPrice || 0,
          status: r.status || 'Pending',
        }))
    }
    
    // Fallback to default data
    return [
      {
        id: 1,
        customerName: 'John Doe',
        serviceName: 'Oil Change',
        urgency: 'normal',
        price: 74.99,
        status: 'Pending',
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        serviceName: 'Brake Repair',
        urgency: 'emergency',
        price: 249.99,
        status: 'Pending',
      },
      {
        id: 3,
        customerName: 'Mike Johnson',
        serviceName: 'Tire Replacement',
        urgency: 'normal',
        price: 199.99,
        status: 'Pending',
      },
      {
        id: 4,
        customerName: 'Sarah Williams',
        serviceName: 'Engine Diagnostic',
        urgency: 'normal',
        price: 134.99,
        status: 'Pending',
      },
      {
        id: 5,
        customerName: 'David Brown',
        serviceName: 'AC Service',
        urgency: 'emergency',
        price: 194.99,
        status: 'Pending',
      },
      {
        id: 6,
        customerName: 'Emily Davis',
        serviceName: 'Battery Replacement',
        urgency: 'normal',
        price: 269.99,
        status: 'Pending',
      },
    ]
  }, [contextRequests])

  // Handle accepting a request
  const handleAcceptRequest = async (requestData) => {
    try {
      const requestId = requestData.requestId || requestData.id
      
      if (!requestId) {
        throw new Error('Request ID not found')
      }

      await updateRequest(requestId, {
        status: 'Accepted',
        mechanicId: authState.user?.id,
        mechanicName: authState.user?.name || 'Mechanic',
      })

      // Add notification
      addNotification({
        type: 'success',
        title: 'Request Accepted',
        message: `You have accepted the request for ${requestData.serviceName} from ${requestData.customerName}`,
        userId: authState.user?.id,
      })

      // Show success toast
      setToastMessage(`Request for ${requestData.serviceName} has been accepted!`)
      setToastType('success')
      setShowToast(true)
    } catch (error) {
      console.error('Error accepting request:', error)
      setToastMessage('Failed to accept request. Please try again.')
      setToastType('error')
      setShowToast(true)
    }
  }

  // Handle rejecting a request
  const handleRejectRequest = async (requestData) => {
    try {
      const requestId = requestData.requestId || requestData.id
      
      if (!requestId) {
        throw new Error('Request ID not found')
      }

      await updateRequest(requestId, {
        status: 'Rejected',
      })

      // Add notification
      addNotification({
        type: 'info',
        title: 'Request Rejected',
        message: `You have rejected the request for ${requestData.serviceName} from ${requestData.customerName}`,
        userId: authState.user?.id,
      })

      // Show info toast
      setToastMessage(`Request for ${requestData.serviceName} has been rejected.`)
      setToastType('info')
      setShowToast(true)
    } catch (error) {
      console.error('Error rejecting request:', error)
      setToastMessage('Failed to reject request. Please try again.')
      setToastType('error')
      setShowToast(true)
    }
  }

  // Calculate stats
  const totalRequests = requests.length
  const pendingRequests = requests.filter((r) => r.status === 'Pending' || r.status === 'pending').length
  const emergencyRequests = requests.filter(
    (r) => r.urgency === 'emergency' || r.urgency === 'urgent'
  ).length
  const inProgressRequests = contextRequests.filter(
    (r) => (r.status === 'In-Progress' || r.status === 'In Progress' || r.status === 'in-progress') && 
           (r.mechanicId === authState.user?.id || r.mechanicName === authState.user?.name)
  ).length

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                  Welcome,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                    {userName}
                  </span>
                  !
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  Review and manage incoming service requests
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
              <div
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                role="region"
                aria-label="Total requests statistic"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Total Requests
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-indigo-600">
                      {totalRequests}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-indigo-600"
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
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                role="region"
                aria-label="Pending requests statistic"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Pending
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-yellow-600">
                      {pendingRequests}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                role="region"
                aria-label="Emergency requests statistic"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Emergency
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-red-600">
                      {emergencyRequests}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                role="region"
                aria-label="In progress requests statistic"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      In Progress
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-purple-600">
                      {inProgressRequests}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Section */}
            <section aria-label="Incoming service requests">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-4 md:p-6 lg:p-8 transform transition-all duration-300 hover:shadow-3xl">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                    Incoming Requests
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg">
                    Review and respond to service requests from customers
                  </p>
                </div>

                {/* RequestList Component */}
                <RequestList
                  requests={requests}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                />
              </div>
            </section>
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

export default MechanicDashboard
