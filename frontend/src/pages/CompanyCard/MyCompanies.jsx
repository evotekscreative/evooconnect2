import React, { useEffect, useState } from "react";
import MyCompanyCard from "../../components/CompanyCard/MyCompanyCard.jsx";
import Case from "../../components/Case.jsx";
import CompanySidebar from "../../components/CompanyCard/CompanySidebar.jsx";


export default function MyCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/api/my-companies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCompanies(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <div>Loading...</div>;

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
                      Company Management
                    </h2>
                    <div className="overflow-x-auto">
                      <div className="flex flex-wrap">
                         {Array.isArray(companies) && companies.map((company) => (
                            <MyCompanyCard key={company.id} company={company} />
                         ))}
                      </div>
                    </div>
                 </div>
              </div>
            </div>
         </div>
      </div>
    </Case>
  );
}