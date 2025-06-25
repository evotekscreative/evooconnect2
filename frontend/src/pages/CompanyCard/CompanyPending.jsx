import React, { useEffect, useState } from 'react';
import Case from "../../components/Case.jsx";
import CompanySidebar from "../../components/CompanyCard/CompanySidebar.jsx";
import SubmissionCompanyCard from "../../components/CompanyCard/SubmissionCompanyCard.jsx";

export default function CompanyPending() {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/api/company/submissions/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setPendingCompanies(data.data || []);
      } catch (err) {
        setPendingCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, []);

  const displayedCompanies = showAll ? pendingCompanies : pendingCompanies.slice(0, 3);

  return (
    <Case>
      <div className="px-4 sm:px-6 lg:px-12 xl:px-24 bg-gray-100 min-h-screen">
        <div className="container mx-auto py-6 sm:py-8">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            {/* Sidebar */}
            <div className="md:sticky md:top-8 w-full md:w-1/4">
              <CompanySidebar />
            </div>

            {/* Main content */}
            <div className="w-full md:w-3/4">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6 min-h-[400px]">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 pb-4 border-b border-gray-200">
                  Pending Company Submissions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-6">
                  {isLoading ? (
                    <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
                  ) : displayedCompanies.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">No pending submissions.</div>
                  ) : (
                    displayedCompanies.map(company => (
                      <SubmissionCompanyCard
                        key={company.id}
                        company={company}
                      />
                    ))
                  )}
                </div>

                {pendingCompanies.length > 3 && (
                  <div className="flex justify-center mt-4">
                    <button
                      className="text-sm px-4 py-2 bg-gray-200 text-blue-700 rounded hover:bg-gray-300 transition"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? "Show Less" : "Show All"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Case>
  );
}
