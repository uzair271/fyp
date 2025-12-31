import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceContext from "../context/ServiceContext";
import { v4 as uuid } from "uuid"
import { set } from "react-hook-form";

const ServiceRequestPage = () => {
  const { serviceData, setServiceData } = useContext(ServiceContext);
  const [requestData, setRequestData] = useState({
    id: "",
    vehicle: "",
    serviceType: "",
    urgency: "",
    distance: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const distanceNum = Number(requestData.distance);
    if (
      !requestData.vehicle || 
      !requestData.serviceType || 
      !requestData.urgency || 
      !distanceNum || 
      distanceNum <= 0
    ) {
      alert("Please fill out all required fields correctly.");
      return;
    }
    
    const finalPrice = calculatePrice(requestData);
    
    const newRequest = {
      ...requestData,
      id: uuid(), 
      distance: distanceNum,
      price: finalPrice,
      date : new Date().toISOString(),
    };
 
    setServiceData({ type: 'ADD_REQUEST', payload: newRequest });
    navigate("/customer/status/" + newRequest.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prevData) => ({
      ...prevData,
      [name]: name === 'distance' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const calculatePrice = ({ serviceType, distance }) => {
  let basePrice = 0;

  switch (serviceType) {
    case "Oil Change":
      basePrice = 50;
      break;
    case "Brake Repair":
      basePrice = 200;
      break;
    case "Tire Replacement":
      basePrice = 150;
      break;
    default:
      basePrice = 0;
  }

  const distanceCharge = distance > 0 ? distance * 1 : 0; // $1 per km

  return basePrice + distanceCharge;
};

const handleCancel = () => {
  setRequestData({
    id: "",
    vehicle: "",
    serviceType: "",
    urgency: "",
    distance: "",
  });
  navigate("/customer/dashboard");
}

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
        <Navbar />
        <nav></nav>

        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 md:mb-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                  Request Service
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  Fill out the form below to request a service for your vehicle
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicle"
                    value={requestData.vehicle}
                    onChange={handleChange}
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-300"
                  >
                    <option value="">Select a vehicle</option>
                    <option value="Toyota Camry 2020 (ABC-1234)">
                      Toyota Camry 2020 (ABC-1234)
                    </option>
                    <option value="Honda Civic 2019 (XYZ-5678)">
                      Honda Civic 2019 (XYZ-5678)
                    </option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceType"
                    value={requestData.serviceType}
                    onChange={handleChange}
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-300"
                  >
                    <option value="">Select a service type</option>
                    <option value="Oil Change">Oil Change - $49.99</option>
                    <option value="Brake Repair">Brake Repair - $199.99</option>
                    <option value="Tire Replacement">
                      Tire Replacement - $149.99
                    </option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center p-4 rounded-xl border-2 border-gray-300">
                      <input
                        type="radio"
                        name="urgency"
                        value="normal"
                        checked={requestData.urgency === "normal"}
                        onChange={handleChange}
                      />
                      <span className="ml-3">Normal</span>
                    </label>
                    <label className="flex items-center p-4 rounded-xl border-2 border-gray-300">
                      <input
                        type="radio"
                        name="urgency"
                        value="emergency"
                        checked={requestData.urgency === "emergency"}
                        onChange={handleChange}
                      />
                      <span className="ml-3">Emergency</span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Distance (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="distance"
                    value={requestData.distance}
                    onChange={handleChange}
                    placeholder="Enter distance in kilometers"
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-300"
                  />
                </div>

                <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-gray-700 font-medium">
                    Estimated Price: <span className="font-bold text-lg"> ${calculatePrice(requestData).toFixed(2)}</span> 
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-xl border"
                    onClick={handleCancel}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ServiceRequestPage;
