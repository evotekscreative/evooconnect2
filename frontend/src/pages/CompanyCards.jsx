import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Case from "../components/Case.jsx";
import { Link } from 'react-router-dom';

export default function CompanyCards() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/api/companies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <Case>
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-8 mt-16 px-8 justify-start">
          {companies.map((company) => (
            <Link
              to={`/company-profile/${company.id}`}
              key={company.id}
              className="transition-transform transform hover:scale-95"
            >
              <div className="relative bg-gray-100 rounded-2xl p-6 pt-16 w-80 text-center shadow-md hover:shadow-lg cursor-pointer">
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <img
                    src={company.logo || "https://via.placeholder.com/100"}
                    alt="Company"
                    className="w-24 h-24 rounded-full border-4 border-white shadow"
                  />
                </div>
                <h2 className="text-xl font-semibold mt-2">{company.name}</h2>
                <p className="text-gray-600">{company.tagline}</p>
                <p className="text-gray-700 font-medium">{company.industry}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Case>
  );
}
