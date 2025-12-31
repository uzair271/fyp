import { useContext, useState } from "react";
import ServiceContext from "../context/ServiceContext";
import { useNavigate } from "react-router-dom";


export default function Test() {
  const { serviceData } = useContext(ServiceContext);
    const navigate = useNavigate();
    const handleChange = () => {
        navigate('/customer/request');
    }
  return <div>
    <h1>Service Requests</h1>
    {serviceData.requests.map((request, index) => (
      <div key={index}>
        <p>ID: {request.id}</p>
        <p>Vehicle: {request.vehicle}</p>
        <p>Service Type: {request.serviceType}</p>
        <p>Urgency: {request.urgency}</p>
        <p>Distance: {request.distance}</p>
        <p>Status: {request.status}</p>
        <p>Price: {request.price}</p>
        <hr />
      </div>
    ))}
    <button onClick={handleChange}>Back</button>
  </div>;
}