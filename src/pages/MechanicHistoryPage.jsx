import { useContext, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ServiceContext from "../context/ServiceContext";
import { useNavigate } from "react-router-dom";


export default function MechanicHistoryPage() {
    const { serviceData , setServiceData } = useContext(ServiceContext);
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState(null);

   const handleStartClick = (requestId) => {
     setLoadingId(requestId);

     setServiceData({
       type: "START_SERVICE",
       payload: { requestId },
     });

     setTimeout(() => {
       setLoadingId(null);
     }, 800);
   };

   const handleCompleteClick = (requestId) => {
     setLoadingId(requestId);

     setServiceData({
       type: "COMPLETE_REQUEST",
       payload: { requestId },
     });

     setTimeout(() => {
       setLoadingId(null);
     }, 800);
   };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <h1 className="text-3xl py-5 pl-5 font-bold text-indigo-600 ">
          Mechanic Service History
        </h1>

        {serviceData?.requests && serviceData.requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {serviceData.requests
                  .filter(
                    (request) =>
                      request.status === "ACCEPTED" ||
                      request.status === "IN_PROGRESS" ||
                      request.status === "COMPLETED"
                  )
                  .map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-gray-800 font-medium">
                        {request.vehicle}
                      </td>

                      <td className="py-4 px-6 text-gray-700">
                        {request.serviceType}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {request.date || "Not specified"}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${
                  request.urgency === "emergency"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }
              `}
                        >
                          {request.urgency}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {loadingId === request.id ? (
                          <span className="text-gray-500 animate-pulse">
                            Processing...
                          </span>
                        ) : (
                          <>
                            {request.status === "ACCEPTED" && (
                              <button
                                onClick={() => handleStartClick(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                              >
                                Start
                              </button>
                            )}

                            {request.status === "IN_PROGRESS" && (
                              <button
                                onClick={() => handleCompleteClick(request.id)}
                                className="ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                              >
                                Complete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No service history available.</p>
        )}

        <Footer />
      </div>
    </>
  );
}