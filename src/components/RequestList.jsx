import RequestItem from './RequestItem'

const RequestList = ({
  requests = [],
  onAcceptRequest,
  onRejectRequest,
  className = '',
}) => {
  // Placeholder function for accepting a request
  const handleAcceptRequest = (requestData) => {
    console.log('Accepting request:', requestData)
    if (onAcceptRequest) {
      onAcceptRequest(requestData)
    }
  }

  // Placeholder function for rejecting a request
  const handleRejectRequest = (requestData) => {
    console.log('Rejecting request:', requestData)
    if (onRejectRequest) {
      onRejectRequest(requestData)
    }
  }

  // Placeholder requests array if none provided
  const defaultRequests = [
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
      status: 'Accepted',
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
      status: 'In-Progress',
    },
  ]

  const requestsToDisplay = requests.length > 0 ? requests : defaultRequests

  if (requestsToDisplay.length === 0) {
    return (
      <div
        className={`
          bg-white rounded-lg shadow-md border border-gray-200
          p-8 md:p-12
          text-center
          ${className}
        `}
        role="status"
        aria-label="No requests available"
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
          No Requests Available
        </h3>
        <p className="text-gray-600 text-sm md:text-base">
          There are no service requests at the moment.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`
        space-y-4 md:space-y-6
        max-h-[calc(100vh-300px)] overflow-y-auto
        pr-2
        ${className}
      `}
      role="list"
      aria-label="List of service requests"
    >
      {requestsToDisplay.map((request) => (
        <RequestItem
          key={request.id || request.customerName + request.serviceName}
          customerName={request.customerName}
          serviceName={request.serviceName}
          urgency={request.urgency}
          price={request.price}
          status={request.status}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          currency={request.currency || 'USD'}
          requestId={request.id}
        />
      ))}
    </div>
  )
}

export default RequestList

