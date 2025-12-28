import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ServiceCard from '../components/ServiceCard'
import Toast from '../components/Toast'

const CustomerDashboard = () => {
  const navigate = useNavigate()
  const { authState, services: contextServices, createRequest, addNotification } = useApp()
  const userName = authState.user?.name || 'Customer'
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Use services from context or fallback to default
  const services = contextServices.length > 0 ? contextServices : [
    {
      id: 1,
      name: 'Oil Change',
      serviceName: 'Oil Change',
      basePrice: 49.99,
      category: 'Maintenance',
    },
    {
      id: 2,
      name: 'Brake Repair',
      serviceName: 'Brake Repair',
      basePrice: 199.99,
      category: 'Repair',
    },
    {
      id: 3,
      name: 'Tire Replacement',
      serviceName: 'Tire Replacement',
      basePrice: 149.99,
      category: 'Repair',
    },
    {
      id: 4,
      name: 'Engine Diagnostic',
      serviceName: 'Engine Diagnostic',
      basePrice: 89.99,
      category: 'Diagnostic',
    },
    {
      id: 5,
      name: 'AC Service',
      serviceName: 'AC Service',
      basePrice: 129.99,
      category: 'Maintenance',
    },
    {
      id: 6,
      name: 'Battery Replacement',
      serviceName: 'Battery Replacement',
      basePrice: 179.99,
      category: 'Repair',
    },
  ]

  // Handle service request - adds to global state and shows confirmation
  const handleServiceRequest = async (serviceData) => {
    try {
      const { serviceName, basePrice, category, serviceId } = serviceData

      // Create request in global state
      const requestData = {
        serviceName,
        basePrice,
        category,
        serviceId: serviceId || Date.now(),
        customerID: authState.user?.id,
        status: 'Pending',
        urgency: 'normal',
        distance: 0,
        price: basePrice, // Initial price, will be calculated with distance/urgency
        createdAt: new Date().toISOString(),
      }

      await createRequest(requestData)

      // Add notification
      addNotification({
        type: 'success',
        title: 'Service Requested',
        message: `Your request for ${serviceName} has been added successfully!`,
        userId: authState.user?.id,
      })

      // Show success toast
      setToastMessage(`Service "${serviceName}" added to your requests!`)
      setToastType('success')
      setShowToast(true)

      // Optionally navigate to request page after a delay
      // setTimeout(() => {
      //   navigate('/customer/request', {
      //     state: { serviceName, basePrice, category },
      //   })
      // }, 1500)
    } catch (error) {
      console.error('Error requesting service:', error)
      setToastMessage('Failed to add service request. Please try again.')
      setToastType('error')
      setShowToast(true)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          {/* Welcome Section */}
          <section className="mb-8 md:mb-10" aria-label="Welcome section">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  {userName}
                </span>
                !
              </h1>
              <p className="text-gray-600 text-base md:text-lg">
                Browse our services and request what you need
              </p>
            </div>
          </section>

          {/* Quick Navigation Cards */}
          <section className="mb-8 md:mb-10" aria-label="Quick navigation">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <button
                onClick={() => navigate('/customer/request')}
                className="
                  bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-4 md:p-6
                  border border-gray-200
                  transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  text-left group
                "
                aria-label="Navigate to Request Service page"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Request Service
                  </h3>
                  <svg
                    className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Create new request</p>
              </button>

              <button
                onClick={() => navigate('/customer/history')}
                className="
                  bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-4 md:p-6
                  border border-gray-200
                  transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:-translate-y-1 hover:border-purple-300
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  text-left group
                "
                aria-label="Navigate to Service History page"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    History
                  </h3>
                  <svg
                    className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">View past requests</p>
              </button>

              <button
                onClick={() => navigate('/customer/profile')}
                className="
                  bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-4 md:p-6
                  border border-gray-200
                  transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:-translate-y-1 hover:border-pink-300
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                  text-left group
                "
                aria-label="Navigate to Profile page"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                    Profile
                  </h3>
                  <svg
                    className="w-5 h-5 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Manage profile</p>
              </button>

              <button
                onClick={() => navigate('/customer/history')}
                className="
                  bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-4 md:p-6
                  border border-gray-200
                  transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  text-left group
                "
                aria-label="View Request Status"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Status
                  </h3>
                  <svg
                    className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Check status</p>
              </button>
            </div>
          </section>

          {/* Services Section */}
          <section aria-label="Available services">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Available Services
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Select a service to request. Click "Request Now" to add it to your requests.
              </p>
            </div>

            {/* Services Grid - Responsive: stacked on mobile, multi-column on desktop */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              role="list"
              aria-label="List of available services"
            >
              {services.map((service) => (
                <div key={service.id} role="listitem">
                  <ServiceCard
                    serviceName={service.name || service.serviceName}
                    basePrice={service.basePrice}
                    category={service.category}
                    onRequest={handleServiceRequest}
                    serviceId={service.id}
                    currency="USD"
                    ariaLabel={`Service card for ${service.name || service.serviceName}`}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {services.length === 0 && (
              <div
                className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 p-8 md:p-12 text-center"
                role="status"
                aria-label="No services available"
              >
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Services Available
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  There are no services available at the moment.
                </p>
              </div>
            )}
          </section>
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

export default CustomerDashboard
