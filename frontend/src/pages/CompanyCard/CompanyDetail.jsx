import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CompanyDetail() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/api/companies/${companyId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCompany(data.data || null);
      } catch (error) {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetail();
  }, [companyId]);

  if (loading) return <p className="text-center">Loading company detail...</p>;

  if (!company)
    return (
      <div className="text-center text-red-500">
        Failed to load company details.
        <button onClick={() => navigate(-1)} className="mt-4 underline text-blue-600">
          Go back
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
      <img
        src={company.logo ? `http://localhost:3000/${company.logo}` : "/default-company-logo.png"}
        alt="Company Logo"
        className="w-48 h-48 object-cover rounded-lg mb-6"
      />
      <p><strong>Industry:</strong> {company.industry}</p>
      <p><strong>Employees:</strong> {company.employees}</p>
      <p><strong>Description:</strong> {company.description}</p>
      {/* Tambahkan detail lain sesuai kebutuhan */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 py-2 px-4 bg-gray-300 hover:bg-gray-400 rounded"
      >
        Back
      </button>
    </div>
  );
}
