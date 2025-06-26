import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyCompanyCard({ company }) {
  const navigate = useNavigate();
            const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";


  const handleDetailClick = () => {
    navigate(`/company-dashboard/${company.id}`);
  };

  return (
    <div className="w-64 rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white mx-3 mb-5">
      <div className="px-3 py-4">
        <div className="flex flex-col items-center mb-3">
          <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden mb-2">
            <img
              src={company.logo ? `${apiUrl}/${company.logo}` : "/default-company-logo.png"}
              alt="Company Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-bold text-gray-800 text-center">{company.name}</h3>
        </div>
        <div className="text-center mb-4">
          <p className="text-gray-600 text-xs mb-1">{company.industry}</p>
          <p className="text-gray-500 text-xs">{company.employees}</p>
        </div>
        <button
          onClick={handleDetailClick}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition duration-200"
        >
          DASHBOARD MANAGEMENT
        </button>
      </div>
    </div>
  );
}
