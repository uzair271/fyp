import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Toast from '../components/Toast'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { authState, updateAuthState, vehicles: contextVehicles, updateVehicle, addVehicle, fetchVehicles } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Get user data from auth state
  const userData = authState.user || {}
  const userVehicle = contextVehicles.find(v => v.userId === userData.id || v.userId === null) || {}

  // Phone validation regex
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userData.name || '',
      phone: userData.phone || '',
      vehicleType: userVehicle.type || '',
      vehicleModel: userVehicle.model || '',
      licensePlate: userVehicle.licensePlate || '',
    },
  })

  // Update form when user data changes
  useEffect(() => {
    reset({
      name: userData.name || '',
      phone: userData.phone || '',
      vehicleType: userVehicle.type || '',
      vehicleModel: userVehicle.model || '',
      licensePlate: userVehicle.licensePlate || '',
    })
  }, [userData, userVehicle, reset])

  // Handle profile update
  const handleProfileUpdate = async (data) => {
    setIsSubmitting(true)
    try {
      // Update user info in auth state
      updateAuthState({
        user: {
          ...authState.user,
          name: data.name,
          phone: data.phone,
        }
      })

      // Update or add vehicle
      if (userVehicle.id) {
        await updateVehicle(userVehicle.id, {
          type: data.vehicleType,
          model: data.vehicleModel,
          licensePlate: data.licensePlate,
        })
      } else {
        await addVehicle({
          userId: authState.user?.id,
          type: data.vehicleType,
          model: data.vehicleModel,
          licensePlate: data.licensePlate,
        })
      }

      // Show success toast
      setToastMessage('Profile updated successfully!')
      setToastType('success')
      setShowToast(true)

      // Optionally navigate back after a delay
      // setTimeout(() => {
      //   const role = authState.role || 'customer'
      //   navigate(`/${role}/dashboard`)
      // }, 1500)
    } catch (error) {
      console.error('Profile update error:', error)
      setToastMessage('Failed to update profile. Please try again.')
      setToastType('error')
      setShowToast(true)
    } finally {
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
                  Profile Settings
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  Update your personal information and vehicle details
                </p>
              </div>
            </div>

            {/* Profile Form Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-3xl">
              <form onSubmit={handleSubmit(handleProfileUpdate)} noValidate>
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-indigo-200 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Personal Information
                  </h2>

                  {/* Name Field */}
                  <div className="mb-6">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        id="name"
                        type="text"
                        {...register('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters',
                          },
                        })}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-xl border-2
                          text-sm md:text-base
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${
                            errors.name
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-400'
                          }
                        `}
                        placeholder="Enter your full name"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                    </div>
                    {errors.name && (
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
                          id="name-error"
                          className="text-sm text-red-600 font-medium"
                          role="alert"
                        >
                          {errors.name.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="mb-6">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Phone Number <span className="text-red-500">*</span>
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502.463l-3.001 1.402a2 2 0 00-.926 2.241l.248 1.484a2 2 0 002.276 1.866l1.055-.303a1 1 0 011.018.314l1.5 1.5a2 2 0 002.828 0l1.5-1.5a1 1 0 011.018-.314l1.055.303a2 2 0 002.276-1.866l.248-1.484a2 2 0 00-.926-2.241l-3.001-1.402a1 1 0 01-.502-.463l-1.498-4.493A1 1 0 006.28 3H3z"
                          />
                        </svg>
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: phoneRegex,
                            message: 'Please enter a valid phone number',
                          },
                        })}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-xl border-2
                          text-sm md:text-base
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${
                            errors.phone
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-400'
                          }
                        `}
                        placeholder="+1 (555) 123-4567"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                    </div>
                    {errors.phone && (
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
                          id="phone-error"
                          className="text-sm text-red-600 font-medium"
                          role="alert"
                        >
                          {errors.phone.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Information Section */}
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-200 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-purple-600"
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
                    Vehicle Information
                  </h2>

                  {/* Vehicle Type Field */}
                  <div className="mb-6">
                    <label
                      htmlFor="vehicleType"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Vehicle Type <span className="text-red-500">*</span>
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <select
                        id="vehicleType"
                        {...register('vehicleType', {
                          required: 'Vehicle type is required',
                        })}
                        className={`
                          w-full pl-10 pr-10 py-3 rounded-xl border-2 appearance-none
                          text-sm md:text-base
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                          bg-white
                          ${
                            errors.vehicleType
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400'
                          }
                        `}
                        aria-invalid={errors.vehicleType ? 'true' : 'false'}
                        aria-describedby={errors.vehicleType ? 'vehicleType-error' : undefined}
                      >
                        <option value="">Select vehicle type</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Truck">Truck</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Van">Van</option>
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
                    {errors.vehicleType && (
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
                          id="vehicleType-error"
                          className="text-sm text-red-600 font-medium"
                          role="alert"
                        >
                          {errors.vehicleType.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Model Field */}
                  <div className="mb-6">
                    <label
                      htmlFor="vehicleModel"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Vehicle Model <span className="text-red-500">*</span>
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <input
                        id="vehicleModel"
                        type="text"
                        {...register('vehicleModel', {
                          required: 'Vehicle model is required',
                        })}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-xl border-2
                          text-sm md:text-base
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${
                            errors.vehicleModel
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-400'
                          }
                        `}
                        placeholder="e.g., Toyota Camry 2020"
                        aria-invalid={errors.vehicleModel ? 'true' : 'false'}
                        aria-describedby={errors.vehicleModel ? 'vehicleModel-error' : undefined}
                      />
                    </div>
                    {errors.vehicleModel && (
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
                          id="vehicleModel-error"
                          className="text-sm text-red-600 font-medium"
                          role="alert"
                        >
                          {errors.vehicleModel.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* License Plate Field */}
                  <div className="mb-6">
                    <label
                      htmlFor="licensePlate"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      License Plate <span className="text-red-500">*</span>
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <input
                        id="licensePlate"
                        type="text"
                        {...register('licensePlate', {
                          required: 'License plate is required',
                        })}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-xl border-2
                          text-sm md:text-base
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${
                            errors.licensePlate
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-400'
                          }
                        `}
                        placeholder="ABC-1234"
                        aria-invalid={errors.licensePlate ? 'true' : 'false'}
                        aria-describedby={errors.licensePlate ? 'licensePlate-error' : undefined}
                      />
                    </div>
                    {errors.licensePlate && (
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
                          id="licensePlate-error"
                          className="text-sm text-red-600 font-medium"
                          role="alert"
                        >
                          {errors.licensePlate.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200">
                  <Button
                    label="Cancel"
                    onClick={(e) => {
                      e.preventDefault()
                      const role = authState.role || 'customer'
                      navigate(`/${role}/dashboard`)
                    }}
                    type="secondary"
                    className="sm:w-auto w-full"
                    ariaLabel="Cancel and go back to dashboard"
                  />
                  <Button
                    label="Update Profile"
                    buttonType="submit"
                    loading={isSubmitting}
                    className="sm:w-auto w-full"
                    ariaLabel="Update profile information"
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

export default ProfilePage
