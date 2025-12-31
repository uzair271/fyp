
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useContext } from 'react'
import ServiceContext from '../context/ServiceContext'
import { useNavigate } from 'react-router-dom'


const ServiceHistoryPage = () => {
  const { serviceData } = useContext(ServiceContext)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      <Navbar />

      
      <main className="flex-grow container mx-auto p-6">
       
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-indigo-600">
            Service History
          </h2>
          <p className="text-gray-600">
            View your past service requests
          </p>
        </div>

        
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Mechanic</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {serviceData?.requests && serviceData.requests.length > 0 ? (
                serviceData.requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{request.serviceType}</td>
                    <td className="px-4 py-3">{request?.mechanic ? "Assigned" : "Not assigned yet"}</td>
                    <td className="px-4 py-3">{request.date || 'Not specified'}</td>
                    <td className="px-4 py-3">${request.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          request.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        onClick={() => navigate(`/customer/status/${request.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-600"
                  >
                    No service history available. 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ServiceHistoryPage

