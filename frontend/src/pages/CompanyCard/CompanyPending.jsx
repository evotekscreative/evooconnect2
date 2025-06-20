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
      <div className="px-36 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:sticky md:top-8 h-auto">
              <CompanySidebar />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 min-h-[500px] w-full">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pb-4 border-b border-gray-200">
                  Pending Company Submissions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {isLoading ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">Loading...</div>
                  ) : displayedCompanies.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">No pending submissions.</div>
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
                  <div className="flex justify-center mt-2">
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 text-blue-700 rounded hover:bg-gray-300 transition"
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
