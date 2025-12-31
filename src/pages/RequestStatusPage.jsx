import { useEffect, useContext, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Toast from "../components/Toast"
import ServiceContext from "../context/ServiceContext"
import { useNavigate } from "react-router-dom"

const STATUS_STEPS = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
]

const RequestStatusPage = ({ requestID }) => {
  const { serviceData } = useContext(ServiceContext)
  const [request, setRequest] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!requestID || !serviceData?.requests) return

    const found = serviceData.requests.find(
      (r) => String(r.id) === String(requestID)
    )

    setRequest(found || null)
  }, [requestID, serviceData])

  
  const currentStepIndex = request
    ? STATUS_STEPS.indexOf(request.status)
    : 0

  const safeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0

  const progressPercentage =
    (safeStepIndex / (STATUS_STEPS.length - 1)) * 100

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 flex justify-between items-center">
              <div >
                <h1 className="text-3xl font-bold text-indigo-600">
                Request Status
              </h1>
              <p className="text-gray-600 mt-1">
                Request ID:
                <span className="ml-2 font-mono font-semibold text-indigo-700">
                  {requestID}
                </span>
              </p>
                </div>
                <div>
                   <button 
                  onClick={()=> navigate('/customer/dashboard')}
                  className="px-4 py-3 rounded-xl bg-indigo-600 text-white">
                  Go to Dashboard
                  </button>
                </div>
            
            </div>

            
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Status Progress</h2>

             
              <div className="relative mb-10">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                {STATUS_STEPS.map((status, index) => {
                  const isCompleted = index < safeStepIndex
                  const isCurrent = index === safeStepIndex

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                          ${
                            isCompleted
                              ? "bg-indigo-600 text-white"
                              : isCurrent
                              ? "bg-indigo-600 text-white ring-4 ring-indigo-200"
                              : "bg-gray-200 text-gray-500"
                          }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>

                      <span
                        className={`mt-2 text-sm font-semibold
                          ${
                            isCompleted || isCurrent
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

           
            
<div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-6">Request Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Service
                  </p>
                  <p className="font-bold text-lg">
                    {request?.serviceType || "Not specified"}
                  </p>
                </div>
                
              <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Mechanic</p>
              <p className="font-bold text-lg">   {request?.mechanic ? "Assigned" : "Not assigned yet"}</p>
              </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-800">
                    {request?.status || "PENDING"}
                  </span>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Urgency
                  </p>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800">
                    {request?.urgency || "Normal"}
                  </span>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Price</p>
                  <p className="font-extrabold text-2xl">
                    ${request?.price != null ? request.price : "0.00"}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Vehicle
                  </p>
                  <p className="font-bold">
                    {request?.vehicle || "Not specified"}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Date
                  </p>
                  <p className="font-bold">
                    {request?.date || "Not specified"}
                  </p>
                </div>

                <div className="bg-teal-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Distance
                  </p>
                  <p className="font-bold">
                    {request?.distance != null
                      ? request.distance
                      : "Not specified"}{" "}
                    km
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <Toast />
    </>
  )
}


export default RequestStatusPage
