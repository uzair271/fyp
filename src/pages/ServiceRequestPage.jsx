import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import DynamicPricing, { calculatePrice } from '../components/DynamicPricing'
import Toast from '../components/Toast'

const ServiceRequestPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { createRequest, vehicles: contextVehicles, services: contextServices, authState, addNotification } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [basePrice, setBasePrice] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Get vehicles from context or use default
  const vehicles = contextVehicles.length > 0 ? contextVehicles.map(v => ({
    id: v.id,
    name: `${v.model} (${v.licensePlate})`,
    value: v.id.toString()
  })) : [
    { id: 1, name: 'Toyota Camry 2020 (ABC-1234)', value: '1' },
    { id: 2, name: 'Honda Civic 2019 (XYZ-5678)', value: '2' },
    { id: 3, name: 'Ford F-150 2021 (DEF-9012)', value: '3' },
    { id: 4, name: 'BMW 3 Series 2022 (GHI-3456)', value: '4' },
  ]

  // Get services from context or use default
  const serviceTypes = contextServices.length > 0 ? contextServices.map(s => ({
    id: s.id,
    name: s.name,
    value: s.id.toString(),
    basePrice: s.basePrice
  })) : [
    { id: 1, name: 'Oil Change', value: '1', basePrice: 49.99 },
    { id: 2, name: 'Brake Repair', value: '2', basePrice: 199.99 },
    { id: 3, name: 'Tire Replacement', value: '3', basePrice: 149.99 },
    { id: 4, name: 'Engine Diagnostic', value: '4', basePrice: 89.99 },
    { id: 5, name: 'AC Service', value: '5', basePrice: 129.99 },
    { id: 6, name: 'Battery Replacement', value: '6', basePrice: 179.99 },
  ]

  // Pre-select service if passed from dashboard
  const preselectedService = location.state?.serviceName || location.state?.service

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceType: preselectedService ? serviceTypes.find(s => s.name === preselectedService)?.value : '',
    }
  })

  // Watch form values for dynamic pricing
  const selectedService = watch('serviceType')
  const distance = watch('distance') || 0
  const urgency = watch('urgency') || 'normal'

  // Update base price when service type changes
  useEffect(() => {
    if (selectedService) {
      const service = serviceTypes.find((s) => s.value === selectedService)
      if (service) {
        setBasePrice(service.basePrice)
      }
    } else {
      setBasePrice(0)
    }
  }, [selectedService, serviceTypes])

  // Pre-fill service if passed from dashboard
  useEffect(() => {
    if (preselectedService) {
      const service = serviceTypes.find(s => s.name === preselectedService)
      if (service) {
        setValue('serviceType', service.value)
      }
    }
  }, [preselectedService, serviceTypes, setValue])

  // Handle form submission
  const handleRequestSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const finalPrice = calculatePrice(basePrice, parseFloat(data.distance) || 0, data.urgency)
      
      // Get selected service name
      const selectedServiceData = serviceTypes.find(s => s.value === data.serviceType)
      const serviceName = selectedServiceData?.name || 'Service'
      
      // Get selected vehicle name
      const selectedVehicleData = vehicles.find(v => v.value === data.vehicle)
      const vehicleName = selectedVehicleData?.name || 'Vehicle'

      const requestData = {
        ...data,
        serviceName,
        vehicle: vehicleName,
        basePrice,
        price: finalPrice,
        customerID: authState.user?.id,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      }
      
      // Create request using context
      const newRequest = await createRequest(requestData)
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Service Requested',
        message: `Your request for ${serviceName} has been submitted successfully!`,
        userId: authState.user?.id,
      })

      // Show success toast
      setToastMessage('Service request submitted successfully!')
      setToastType('success')
      setShowToast(true)
      
      // Navigate to status page after a short delay
      setTimeout(() => {
        navigate(`/customer/status/${newRequest.id}`, { replace: true })
      }, 1500)
    } catch (error) {
      console.error('Request submission error:', error)
      setToastMessage('Failed to submit request. Please try again.')
      setToastType('error')
      setShowToast(true)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                  Request Service
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  Fill out the form below to request a service for your vehicle
                </p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-3xl">
              <form onSubmit={handleSubmit(handleRequestSubmit)} noValidate>
                {/* Vehicle Dropdown */}
                <div className="mb-6">
                  <label
                    htmlFor="vehicle"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <select
                      id="vehicle"
                      {...register('vehicle', {
                        required: 'Please select a vehicle',
                      })}
                      className={`
                        w-full pl-10 pr-10 py-3 rounded-xl border-2 appearance-none
                        text-sm md:text-base
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        bg-white
                        ${
                          errors.vehicle
                            ? 'border-red-500 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400'
                        }
                      `}
                      aria-invalid={errors.vehicle ? 'true' : 'false'}
                      aria-describedby={errors.vehicle ? 'vehicle-error' : undefined}
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.value}>
                          {vehicle.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.vehicle && (
                    <div className="mt-2 flex items-center space-x-1 animate-fade-in">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p
                        id="vehicle-error"
                        className="text-sm text-red-600 font-medium"
                        role="alert"
                      >
                        {errors.vehicle.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Service Type Dropdown */}
                <div className="mb-6">
                  <label
                    htmlFor="serviceType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                    </div>
                    <select
                      id="serviceType"
                      {...register('serviceType', {
                        required: 'Please select a service type',
                      })}
                      className={`
                        w-full pl-10 pr-10 py-3 rounded-xl border-2 appearance-none
                        text-sm md:text-base
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        bg-white
                        ${
                          errors.serviceType
                            ? 'border-red-500 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400'
                        }
                      `}
                      aria-invalid={errors.serviceType ? 'true' : 'false'}
                      aria-describedby={errors.serviceType ? 'serviceType-error' : undefined}
                    >
                      <option value="">Select a service type</option>
                      {serviceTypes.map((service) => (
                        <option key={service.id} value={service.value}>
                          {service.name} - ${service.basePrice.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.serviceType && (
                    <div className="mt-2 flex items-center space-x-1 animate-fade-in">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p
                        id="serviceType-error"
                        className="text-sm text-red-600 font-medium"
                        role="alert"
                      >
                        {errors.serviceType.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Urgency Radio Buttons */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label
                      className={`
                        flex items-center p-4 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${
                          urgency === 'normal'
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-indigo-400 hover:shadow-sm'
                        }
                      `}
                      aria-label="Normal urgency"
                    >
                      <input
                        type="radio"
                        value="normal"
                        {...register('urgency', {
                          required: 'Please select an urgency level',
                        })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                        aria-invalid={errors.urgency ? 'true' : 'false'}
                      />
                      <span className="ml-3 text-sm md:text-base font-medium text-gray-700">
                        Normal
                      </span>
                    </label>
                    <label
                      className={`
                        flex items-center p-4 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${
                          urgency === 'emergency'
                            ? 'border-red-500 bg-red-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-red-400 hover:shadow-sm'
                        }
                      `}
                      aria-label="Emergency urgency"
                    >
                      <input
                        type="radio"
                        value="emergency"
                        {...register('urgency', {
                          required: 'Please select an urgency level',
                        })}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 focus:ring-2"
                        aria-invalid={errors.urgency ? 'true' : 'false'}
                      />
                      <span className="ml-3 text-sm md:text-base font-medium text-gray-700">
                        Emergency
                      </span>
                    </label>
                  </div>
                  {errors.urgency && (
                    <div className="mt-2 flex items-center space-x-1 animate-fade-in">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p
                        className="text-sm text-red-600 font-medium"
                        role="alert"
                      >
                        {errors.urgency.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Distance Input */}
                <div className="mb-6">
                  <label
                    htmlFor="distance"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Distance (km) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="distance"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('distance', {
                        required: 'Distance is required',
                        min: {
                          value: 0.1,
                          message: 'Distance must be a positive number',
                        },
                        valueAsNumber: true,
                      })}
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-xl border-2
                        text-sm md:text-base
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${
                          errors.distance
                            ? 'border-red-500 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-400'
                        }
                      `}
                      placeholder="Enter distance in kilometers"
                      aria-invalid={errors.distance ? 'true' : 'false'}
                      aria-describedby={errors.distance ? 'distance-error' : undefined}
                    />
                  </div>
                  {errors.distance && (
                    <div className="mt-2 flex items-center space-x-1 animate-fade-in">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p
                        id="distance-error"
                        className="text-sm text-red-600 font-medium"
                        role="alert"
                      >
                        {errors.distance.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dynamic Pricing Component */}
                {selectedService && basePrice > 0 && (
                  <div className="mb-6">
                    <DynamicPricing
                      basePrice={basePrice}
                      distance={parseFloat(distance) || 0}
                      urgency={urgency}
                      currency="USD"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    label="Cancel"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/customer/dashboard')
                    }}
                    type="secondary"
                    className="flex-1"
                    ariaLabel="Cancel and go back to dashboard"
                  />
                  <Button
                    label="Submit Request"
                    buttonType="submit"
                    loading={isSubmitting}
                    className="flex-1"
                    ariaLabel="Submit service request"
                  />
                </div>
              </form>
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

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default ServiceRequestPage
