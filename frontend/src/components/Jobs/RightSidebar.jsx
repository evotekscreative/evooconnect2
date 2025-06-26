import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import dayjs from "dayjs";

export default function RightSidebar({ activeTab }) {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    if (activeTab === "job") {
      fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/jobs/random`, {
        headers,
      })
        .then((res) => res.json())
        .then((response) => setJobs(response.data?.jobs || []))
        .catch((err) => {
          console.error("Error fetching random jobs:", err);
          setJobs([]);
        });
    } else {
      fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/companies-random`, {
        headers,
      })
        .then((res) => res.json())
        .then((response) => setCompanies(response.data?.companies || []))
        .catch((err) => {
          console.error("Error fetching random companies:", err);
          setCompanies([]);
        });
    }
  }, [activeTab]);

  const items = activeTab === "job" ? jobs : companies;

  return (
    <div className="col-span-12 space-y-2 lg:col-span-3">
      <div className="p-5 bg-white shadow-md rounded-xl">
        <h3 className="mb-1 font-semibold">Because you viewed</h3>
        <p className="mb-4 text-sm text-gray-500">
          {activeTab === "job"
            ? "Designer at Google?"
            : "Tech companies in your area"}
        </p>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-3 transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={() =>
                (window.location.href =
                  activeTab === "job"
                    ? `/jobs/${item.id}`
                    : `/company-detail/${item.id}`)
              }
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {activeTab === "job" ? item.title : item.name}
                  </h4>
                  {activeTab === "job" ? (
                    <p className="text-xs font-medium text-blue-500">
                      {item.company?.name || "Company"}
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-blue-500">
                      {item.jobs} open jobs
                    </p>
                  )}
                </div>
                {((activeTab === "job" && item.company?.logo) ||
                  (activeTab !== "job" && item.logo)) && (
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 p-1 ml-2 bg-white rounded-full">
                    <img
                      src={
                        activeTab === "job"
                          ? item.company.logo.startsWith("http")
                            ? item.company.logo
                            : `${import.meta.env.VITE_APP_BACKEND_URL}/${
                                item.company.logo
                              }`
                          : item.logo.startsWith("http")
                          ? item.logo
                          : `${import.meta.env.VITE_APP_BACKEND_URL}/${
                              item.logo
                            }`
                      }
                      alt="Logo"
                      className="object-cover w-full h-full rounded-full"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center mb-2 text-xs text-gray-600">
                <MapPin size={12} className="flex-shrink-0 mr-1" />
                <span className="truncate">
                  {activeTab === "job"
                    ? item.location || "Remote"
                    : item.industry || "Industry"}
                </span>
              </div>

              {activeTab === "job" && (item.min_salary || item.max_salary) && (
                <div className="mb-2 text-xs font-medium text-green-600">
                  {item.min_salary && item.max_salary
                    ? `${
                        item.currency || "$"
                      } ${item.min_salary.toLocaleString()} - ${item.max_salary.toLocaleString()}`
                    : item.min_salary
                    ? `From ${
                        item.currency || "$"
                      } ${item.min_salary.toLocaleString()}`
                    : `Up to ${
                        item.currency || "$"
                      } ${item.max_salary.toLocaleString()}`}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {activeTab === "job"
                    ? item.job_type || "Full-time"
                    : "Company"}
                </span>
                <span className="text-xs text-gray-400">
                  {activeTab === "job" && item.created_at
                    ? dayjs(item.created_at).fromNow()
                    : "Recently posted"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
