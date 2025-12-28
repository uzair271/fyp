import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { useForm } from 'react-hook-form'

const AdminDashboard = () => {
  const {
    users: contextUsers,
    services: contextServices,
    requests: contextRequests,
    addUser,
    updateUser,
    deleteUser,
    addService,
    updateService,
    deleteService,
    addNotification,
  } = useApp()

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingService, setEditingService] = useState(null)

  // Use data from context
  const users = contextUsers || []
  const services = contextServices || []
  const requests = contextRequests || []

  // Calculate summary statistics
  const totalCustomers = useMemo(
    () => users.filter((u) => u.role === 'customer' || u.role === 'Customer').length,
    [users]
  )
  const totalMechanics = useMemo(
    () => users.filter((u) => u.role === 'mechanic' || u.role === 'Mechanic').length,
    [users]
  )
  const totalRequests = useMemo(() => requests.length, [requests])

  // User form
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    reset: resetUser,
    formState: { errors: userErrors },
  } = useForm()

  // Service form
  const {
    register: registerService,
    handleSubmit: handleSubmitService,
    reset: resetService,
    formState: { errors: serviceErrors },
  } = useForm()

  // Open user modal for add
  const handleAddUser = () => {
    setEditingUser(null)
    resetUser()
    setShowUserModal(true)
  }

  // Open user modal for edit
  const handleEditUser = (userId) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditingUser(user)
      resetUser({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        status: user.status || 'Active',
      })
      setShowUserModal(true)
    }
  }

  // Submit user form
  const onSubmitUser = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data)
        setToastMessage(`User ${data.name} updated successfully!`)
      } else {
        await addUser(data)
        setToastMessage(`User ${data.name} added successfully!`)
      }
      setToastType('success')
      setShowToast(true)
      setShowUserModal(false)
      resetUser()
      setEditingUser(null)

      // Add notification
      addNotification({
        type: 'success',
        title: editingUser ? 'User Updated' : 'User Added',
        message: `User ${data.name} has been ${editingUser ? 'updated' : 'added'}`,
      })
    } catch (error) {
      console.error('User operation error:', error)
      setToastMessage(`Failed to ${editingUser ? 'update' : 'add'} user. Please try again.`)
      setToastType('error')
      setShowToast(true)
    }
  }

  // Delete user
  const handleDeleteUser = async (userId) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        await deleteUser(userId)
        setToastMessage(`User ${user.name} deleted successfully!`)
        setToastType('success')
        setShowToast(true)

        // Add notification
        addNotification({
          type: 'info',
          title: 'User Deleted',
          message: `User ${user.name} has been deleted`,
        })
      } catch (error) {
        console.error('Delete user error:', error)
        setToastMessage('Failed to delete user. Please try again.')
        setToastType('error')
        setShowToast(true)
      }
    }
  }

  // Open service modal for add
  const handleAddService = () => {
    setEditingService(null)
    resetService()
    setShowServiceModal(true)
  }

  // Open service modal for edit
  const handleEditService = (serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setEditingService(service)
      resetService({
        name: service.name,
        category: service.category,
        basePrice: service.basePrice,
        description: service.description || '',
        status: service.status || 'Active',
      })
      setShowServiceModal(true)
    }
  }

  // Submit service form
  const onSubmitService = async (data) => {
    try {
      const serviceData = {
        ...data,
        basePrice: parseFloat(data.basePrice),
      }

      if (editingService) {
        await updateService(editingService.id, serviceData)
        setToastMessage(`Service ${data.name} updated successfully!`)
      } else {
        await addService(serviceData)
        setToastMessage(`Service ${data.name} added successfully!`)
      }
      setToastType('success')
      setShowToast(true)
      setShowServiceModal(false)
      resetService()
      setEditingService(null)

      // Add notification
      addNotification({
        type: 'success',
        title: editingService ? 'Service Updated' : 'Service Added',
        message: `Service ${data.name} has been ${editingService ? 'updated' : 'added'}`,
      })
    } catch (error) {
      console.error('Service operation error:', error)
      setToastMessage(`Failed to ${editingService ? 'update' : 'add'} service. Please try again.`)
      setToastType('error')
      setShowToast(true)
    }
  }

  // Delete service
  const handleDeleteService = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    if (window.confirm(`Are you sure you want to delete service ${service.name}?`)) {
      try {
        await deleteService(serviceId)
        setToastMessage(`Service ${service.name} deleted successfully!`)
        setToastType('success')
        setShowToast(true)

        // Add notification
        addNotification({
          type: 'info',
          title: 'Service Deleted',
          message: `Service ${service.name} has been deleted`,
        })
      } catch (error) {
        console.error('Delete service error:', error)
        setToastMessage('Failed to delete service. Please try again.')
        setToastType('error')
        setShowToast(true)
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const getStatusBadgeColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  Manage users, services, and system overview
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              {/* Total Customers */}
              <div
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                role="region"
                aria-label="Total customers statistic"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Total Customers
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-indigo-600">
                      {totalCustomers}
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Mechanics */}
              <div
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                role="region"
                aria-label="Total mechanics statistic"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Total Mechanics
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-purple-600">
                      {totalMechanics}
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Requests */}
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
                    <p className="text-3xl md:text-4xl font-bold text-green-600">
                      {totalRequests}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-green-600"
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
            </div>

            {/* Users Table Section */}
            <section aria-label="Users management" className="mb-6 md:mb-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                        Users
                      </h2>
                      <p className="text-sm text-gray-600">
                        Manage system users and their roles
                      </p>
                    </div>
                    <Button
                      label="Add User"
                      onClick={handleAddUser}
                      type="primary"
                      ariaLabel="Add new user"
                    />
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Users table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Email
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Role
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Phone
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Status
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`
                            transition-colors duration-150 ease-in-out
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            hover:bg-indigo-50
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {user.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                inline-block px-3 py-1 rounded-full text-xs font-bold border-2
                                ${getStatusBadgeColor(user.status)}
                              `}
                              aria-label={`Status: ${user.status}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors"
                                aria-label={`Edit user ${user.name}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors"
                                aria-label={`Delete user ${user.name}`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {users.map((user) => (
                    <div key={user.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span
                          className={`
                            inline-block px-3 py-1 rounded-full text-xs font-bold border-2
                            ${getStatusBadgeColor(user.status)}
                          `}
                          aria-label={`Status: ${user.status}`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-500">Role:</span>
                          <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 capitalize">
                            {user.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500">Phone:</span>
                          <span className="ml-2 text-sm text-gray-700">
                            {user.phone || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          aria-label={`Edit user ${user.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          aria-label={`Delete user ${user.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Services Table Section */}
            <section aria-label="Services management">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                        Services
                      </h2>
                      <p className="text-sm text-gray-600">
                        Manage available services and pricing
                      </p>
                    </div>
                    <Button
                      label="Add Service"
                      onClick={handleAddService}
                      type="primary"
                      ariaLabel="Add new service"
                    />
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Services table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Category
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Base Price
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Description
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Status
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services.map((service, index) => (
                        <tr
                          key={service.id}
                          className={`
                            transition-colors duration-150 ease-in-out
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            hover:bg-indigo-50
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {service.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
                              {service.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {formatPrice(service.basePrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs truncate">
                              {service.description || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                inline-block px-3 py-1 rounded-full text-xs font-bold border-2
                                ${getStatusBadgeColor(service.status)}
                              `}
                              aria-label={`Status: ${service.status}`}
                            >
                              {service.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditService(service.id)}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors"
                                aria-label={`Edit service ${service.name}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                className="text-red-600 hover:text-red-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors"
                                aria-label={`Delete service ${service.name}`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {services.map((service) => (
                    <div key={service.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {service.description || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`
                            inline-block px-3 py-1 rounded-full text-xs font-bold border-2
                            ${getStatusBadgeColor(service.status)}
                          `}
                          aria-label={`Status: ${service.status}`}
                        >
                          {service.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-500">Category:</span>
                          <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
                            {service.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500">Price:</span>
                          <span className="ml-2 text-sm font-bold text-gray-900">
                            {formatPrice(service.basePrice)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEditService(service.id)}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          aria-label={`Edit service ${service.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          aria-label={`Delete service ${service.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setEditingUser(null)
          resetUser()
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              {...registerUser('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter user name"
            />
            {userErrors.name && (
              <p className="mt-1 text-sm text-red-600">{userErrors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              {...registerUser('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter email address"
            />
            {userErrors.email && (
              <p className="mt-1 text-sm text-red-600">{userErrors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
              Role *
            </label>
            <select
              id="role"
              {...registerUser('role', { required: 'Role is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Select role</option>
              <option value="customer">Customer</option>
              <option value="mechanic">Mechanic</option>
              <option value="admin">Admin</option>
            </select>
            {userErrors.role && (
              <p className="mt-1 text-sm text-red-600">{userErrors.role.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              {...registerUser('phone')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              {...registerUser('status', { required: 'Status is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {userErrors.status && (
              <p className="mt-1 text-sm text-red-600">{userErrors.status.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              label={editingUser ? 'Update User' : 'Add User'}
              type="submit"
              buttonType="submit"
              ariaLabel={editingUser ? 'Update user' : 'Add user'}
            />
            <Button
              label="Cancel"
              onClick={() => {
                setShowUserModal(false)
                setEditingUser(null)
                resetUser()
              }}
              type="secondary"
              ariaLabel="Cancel"
            />
          </div>
        </form>
      </Modal>

      {/* Service Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false)
          setEditingService(null)
          resetService()
        }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="md"
      >
        <form onSubmit={handleSubmitService(onSubmitService)} className="space-y-4">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-semibold text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              id="serviceName"
              {...registerService('name', { required: 'Service name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter service name"
            />
            {serviceErrors.name && (
              <p className="mt-1 text-sm text-red-600">{serviceErrors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              {...registerService('category', { required: 'Category is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Select category</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Emergency">Emergency</option>
            </select>
            {serviceErrors.category && (
              <p className="mt-1 text-sm text-red-600">{serviceErrors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="basePrice" className="block text-sm font-semibold text-gray-700 mb-1">
              Base Price ($) *
            </label>
            <input
              type="number"
              id="basePrice"
              step="0.01"
              min="0"
              {...registerService('basePrice', {
                required: 'Base price is required',
                min: { value: 0, message: 'Price must be positive' },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter base price"
            />
            {serviceErrors.basePrice && (
              <p className="mt-1 text-sm text-red-600">{serviceErrors.basePrice.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows="3"
              {...registerService('description')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              placeholder="Enter service description"
            />
          </div>

          <div>
            <label htmlFor="serviceStatus" className="block text-sm font-semibold text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="serviceStatus"
              {...registerService('status', { required: 'Status is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {serviceErrors.status && (
              <p className="mt-1 text-sm text-red-600">{serviceErrors.status.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              label={editingService ? 'Update Service' : 'Add Service'}
              type="submit"
              buttonType="submit"
              ariaLabel={editingService ? 'Update service' : 'Add service'}
            />
            <Button
              label="Cancel"
              onClick={() => {
                setShowServiceModal(false)
                setEditingService(null)
                resetService()
              }}
              type="secondary"
              ariaLabel="Cancel"
            />
          </div>
        </form>
      </Modal>

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

export default AdminDashboard
