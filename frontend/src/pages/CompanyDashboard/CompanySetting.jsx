import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../components/CompanyDashboard/Sidebar/Sidebar";
import AdminNavbar from "../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import TableSetting from "../../components/CompanyDashboard/Table/TableSetting.jsx";
import Case from "../../components/Case";

export default function CompanyDashboard() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { company_id } = useParams();

  // Fetch company data from localStorage or API
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiUrl}/api/companies/${company_id}/details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch company data: ${response.status}`);
      }

      const result = await response.json();

      // Check if the API response has the expected structure
      if (result.code === 200 && result.data) {
        setCompanyData(result.data);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company_id) {
      fetchCompanyData();
    }
  }, [company_id, apiUrl]);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="relative md:ml-64 bg-blueGray-100">
          <Case />
          <HeaderStats />
          <div className="w-full px-4 pt-20 mx-auto -m-32 md:px-10">
            <div className="flex flex-wrap mt-4">
              <div className="w-full px-4 mb-12">
                <div className="flex items-center justify-center p-8 bg-white rounded shadow-lg">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-4 border-4 rounded-full border-sky-600 border-t-transparent animate-spin"></div>
                    <p className="text-gray-600">Loading company data...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <div className="relative md:ml-64 bg-blueGray-100">
          <Case />
          <HeaderStats />
          <div className="w-full px-4 pt-20 mx-auto -m-32 md:px-10">
            <div className="flex flex-wrap mt-4">
              <div className="w-full px-4 mb-12">
                <div className="p-8 bg-white rounded shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Error Loading Company Data
                    </h3>
                    <p className="mb-4 text-gray-600">{error}</p>
                    <button
                      onClick={fetchCompanyData}
                      className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Case />
        <HeaderStats />
        <div className="w-full px-4 pt-20 mx-auto -m-32 md:px-10">
          <div className="flex flex-wrap mt-4">
            <div className="w-full px-4 mb-12">
              <TableSetting companyData={companyData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
