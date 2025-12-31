import { useContext, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import ServiceContext from '../context/ServiceContext'
import { useNavigate } from 'react-router-dom'

const MechanicDashboard = () => {
  const { authState } = useApp()
  const userName = authState.user?.name || 'Mechanic'
  const { serviceData , setServiceData } = useContext(ServiceContext)
  const navigate = useNavigate()
  
  
  const stats = useMemo(() => {
    const requests = serviceData?.requests || []
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      emergency: requests.filter(r => r.urgency === 'emergency').length,
      accept: requests.filter(r => r.status === 'ACCEPTED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length,
    }
  }, [serviceData])
  


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="max-w-7xl mx-auto">
           
            <div className="mb-8">
              <div className="bg-white/80 rounded-2xl shadow-xl p-6 flex justify-between items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, <span className="text-indigo-600">{userName}</span>
                  </h1>
                  <p className="text-gray-600">
                    Review and manage incoming service requests
                  </p>
                </div>
                <div>
                  <button 
                  onClick={()=> navigate('/mechanic/history')}
                  className="px-4 py-3 rounded-xl bg-indigo-600 text-white">
                   View Request
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats.total}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-sm text-gray-600">Emergency</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.emergency}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.accept}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.rejected}
                </p>
              </div>
            </div>

            <section>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-indigo-600 mb-4">
                  Incoming Requests
                </h2>

                {!serviceData || serviceData.requests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No service requests available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceData.requests
                      .filter((request) => request.status === "PENDING")
                      .map((request, index) => (
                        <div
                          key={request.id || index}
                          className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                        >
                          <div className="flex-1">
                            <p>
                              <strong>Vehicle:</strong>{" "}
                              {request.vehicle || "N/A"}
                            </p>
                            <p>
                              <strong>Service Type:</strong>{" "}
                              {request.serviceType || "N/A"}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              <span
                                className={`font-semibold ${
                                  request.status === "PENDING"
                                    ? "text-yellow-600"
                                    : request.status === "IN_PROGRESS"
                                    ? "text-purple-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {request.status || "PENDING"}
                              </span>
                            </p>
                            <p>Price: {request.price || "N/A"}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setServiceData({
                                  type: "ACCEPT_REQUEST",
                                  payload: { requestId: request.id },
                                })
                              }
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                setServiceData({
                                  type: "REJECT_REQUEST",
                                  payload: { requestId: request.id },
                                })
                              }
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>

      <Toast />
    </>
  );
}

export default MechanicDashboard
