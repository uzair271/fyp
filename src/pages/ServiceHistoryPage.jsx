import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useApp } from '../context/AppContext'
import Button from '../components/Button'

const ServiceHistoryPage = () => {
  const navigate = useNavigate()
  const { authState, requests: contextRequests, fetchRequests } = useApp()
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get requests from global state, filtered by current user
  const pastRequests = useMemo(() => {
    if (contextRequests.length > 0) {
      // Filter requests for current user
      const userRequests = contextRequests.filter(req => 
        req.customerID === authState.user?.id || 
        req.customerId === authState.user?.id
      )
      
      // Map to display format
      return userRequests.map(req => ({
        id: req.id,
        serviceName: req.serviceName || 'Service',
        mechanicName: req.mechanicName || 'Not assigned',
        date: req.createdAt || new Date().toISOString(),
        price: req.price || req.finalPrice || 0,
        status: req.status || 'Pending',
      }))
    }
    
    // Fallback to default data
    return [
      {
        id: 'REQ-001',
        serviceName: 'Oil Change',
        mechanicName: 'John Smith',
        date: '2024-01-15T10:30:00Z',
        price: 74.99,
        status: 'Completed',
      },
      {
        id: 'REQ-002',
        serviceName: 'Brake Repair',
        mechanicName: 'Sarah Johnson',
        date: '2024-01-10T14:20:00Z',
        price: 249.99,
        status: 'Completed',
      },
      {
        id: 'REQ-003',
        serviceName: 'Tire Replacement',
        mechanicName: 'Mike Davis',
        date: '2024-01-08T09:15:00Z',
        price: 199.99,
        status: 'Completed',
      },
      {
        id: 'REQ-004',
        serviceName: 'Engine Diagnostic',
        mechanicName: 'John Smith',
        date: '2024-01-05T11:45:00Z',
        price: 134.99,
        status: 'In-Progress',
      },
      {
        id: 'REQ-005',
        serviceName: 'AC Service',
        mechanicName: 'Sarah Johnson',
        date: '2024-01-03T16:30:00Z',
        price: 194.99,
        status: 'Accepted',
      },
      {
        id: 'REQ-006',
        serviceName: 'Battery Replacement',
        mechanicName: 'Mike Davis',
        date: '2023-12-28T10:00:00Z',
        price: 269.99,
        status: 'Completed',
      },
      {
        id: 'REQ-007',
        serviceName: 'Oil Change',
        mechanicName: 'John Smith',
        date: '2023-12-20T13:20:00Z',
        price: 74.99,
        status: 'Completed',
      },
      {
        id: 'REQ-008',
        serviceName: 'Brake Repair',
        mechanicName: 'Sarah Johnson',
        date: '2023-12-15T09:30:00Z',
        price: 249.99,
        status: 'Completed',
      },
      {
        id: 'REQ-009',
        serviceName: 'Tire Replacement',
        mechanicName: 'Mike Davis',
        date: '2023-12-10T15:45:00Z',
        price: 199.99,
        status: 'Pending',
      },
      {
        id: 'REQ-010',
        serviceName: 'Engine Diagnostic',
        mechanicName: 'John Smith',
        date: '2023-12-05T11:00:00Z',
        price: 134.99,
        status: 'Completed',
      },
      {
        id: 'REQ-011',
        serviceName: 'AC Service',
        mechanicName: 'Sarah Johnson',
        date: '2023-11-28T14:30:00Z',
        price: 194.99,
        status: 'Completed',
      },
      {
        id: 'REQ-012',
        serviceName: 'Battery Replacement',
        mechanicName: 'Mike Davis',
        date: '2023-11-20T10:15:00Z',
        price: 269.99,
        status: 'Completed',
      },
    ]
  }, [contextRequests, authState.user?.id])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '-')
    switch (statusLower) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
      case 'inprogress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Sort and paginate data
  const sortedAndPaginatedData = useMemo(() => {
    let sorted = [...pastRequests]

    // Sort data
    sorted.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'status':
          aValue = a.status.toLowerCase()
          bValue = b.status.toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    // Paginate
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sorted.slice(startIndex, endIndex)
  }, [pastRequests, sortBy, sortOrder, currentPage])

  const totalPages = Math.ceil(pastRequests.length / itemsPerPage)

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    // Reset to first page when sorting changes
    setCurrentPage(1)
  }

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      )
    }
    return sortOrder === 'asc' ? (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                Service History
              </h1>
              <p className="text-gray-600 text-base md:text-lg">
                View your past service requests
              </p>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Sort by:
              </label>
              <div className="flex flex-wrap gap-2">
                {['date', 'price', 'status'].map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-semibold
                      transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                      transform hover:scale-105
                      ${
                        sortBy === field
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    aria-label={`Sort by ${field} ${sortBy === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    aria-pressed={sortBy === field}
                  >
                    <span className="flex items-center gap-2 capitalize">
                      {field}
                      {getSortIcon(field)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table - Desktop View */}
          {pastRequests.length > 0 ? (
            <>
              <div className="hidden md:block bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    role="table"
                    aria-label="Service history table"
                  >
                    <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Service Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                          scope="col"
                        >
                          Mechanic Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors rounded-lg"
                          scope="col"
                          onClick={() => handleSort('date')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSort('date')
                            }
                          }}
                          tabIndex={0}
                          aria-label={`Sort by date ${sortBy === 'date' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                          aria-sort={sortBy === 'date' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <span className="flex items-center gap-2">
                            Date
                            {getSortIcon('date')}
                          </span>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors rounded-lg"
                          scope="col"
                          onClick={() => handleSort('price')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSort('price')
                            }
                          }}
                          tabIndex={0}
                          aria-label={`Sort by price ${sortBy === 'price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                          aria-sort={sortBy === 'price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <span className="flex items-center gap-2">
                            Price
                            {getSortIcon('price')}
                          </span>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors rounded-lg"
                          scope="col"
                          onClick={() => handleSort('status')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSort('status')
                            }
                          }}
                          tabIndex={0}
                          aria-label={`Sort by status ${sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                          aria-sort={sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <span className="flex items-center gap-2">
                            Status
                            {getSortIcon('status')}
                          </span>
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
                      {sortedAndPaginatedData.map((request, index) => (
                        <tr
                          key={request.id}
                          className={`
                            transition-colors duration-150 ease-in-out
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            hover:bg-indigo-50
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {request.serviceName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {request.mechanicName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {formatDate(request.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {formatPrice(request.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                inline-block px-3 py-1 rounded-full text-xs font-semibold border
                                ${getStatusBadgeColor(request.status)}
                              `}
                              aria-label={`Status: ${request.status}`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/customer/status/${request.id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                              aria-label={`View details for request ${request.id}`}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* List - Mobile/Tablet View */}
              <div className="md:hidden space-y-4" role="list" aria-label="Service history list">
                {sortedAndPaginatedData.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/20 p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    role="listitem"
                    aria-label={`Service request for ${request.serviceName} on ${formatDate(request.date)}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-1">
                            {request.serviceName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.mechanicName}
                          </p>
                        </div>
                        <span
                          className={`
                            inline-block px-3 py-1 rounded-full text-xs font-semibold border
                            ${getStatusBadgeColor(request.status)}
                          `}
                          aria-label={`Status: ${request.status}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {formatDate(request.date)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Price
                          </label>
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(request.price)}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/customer/status/${request.id}`}
                        className="block w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-3 transform hover:scale-105"
                        aria-label={`View details for request ${request.id}`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="mt-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 md:p-6"
                  aria-label="Pagination"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700 font-medium">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, pastRequests.length)} of{' '}
                      {pastRequests.length} requests
                    </div>
                    <div className="flex gap-2">
                      <Button
                        label="Previous"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        type="secondary"
                        className="text-sm"
                        ariaLabel="Previous page"
                      />
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                              px-4 py-2 rounded-xl text-sm font-semibold min-w-[40px]
                              transition-all duration-200
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                              transform hover:scale-105
                              ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105'
                                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300'
                              }
                            `}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <Button
                        label="Next"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        type="secondary"
                        className="text-sm"
                        ariaLabel="Next page"
                      />
                    </div>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 md:p-12 text-center"
              role="status"
              aria-label="No service requests found"
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
                No Service Requests
              </h3>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                You haven't made any service requests yet.
              </p>
              <Button
                label="Request a Service"
                onClick={() => navigate('/customer/request')}
                type="primary"
                ariaLabel="Navigate to request service page"
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ServiceHistoryPage
