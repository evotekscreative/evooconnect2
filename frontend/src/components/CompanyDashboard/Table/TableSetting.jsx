import React from "react";
import { Building2, Globe, Users, Calendar, Edit3, ExternalLink, Shield } from "lucide-react";

export default function CompanyProfileDashboard() {
  const companyData = {
    id: "company-uuid-here",
    name: "Tech Innovators Inc",
    linkedin_url: "tech-innovators",
    website: "https://techinnovators.com",
    industry: "Information Technology",
    size: "51-200 employees",
    type: "Privately Held",
    logo: "company-logos/user-id/logo.jpg",
    tagline: "Innovating for a better tomorrow",
    is_verified: true,
    created_at: "2023-10-15T10:30:00Z",
    updated_at: "2023-10-16T09:00:00Z",
    has_pending_edit: true,
    pending_edit_id: "edit-request-uuid",
  };

  const InfoCard = ({ icon: Icon, label, value, link = null, variant = "default" }) => (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-start space-x-2">
        <div className={`p-1 rounded ${variant === "warning" ? "bg-yellow-100" : "bg-sky-100"}`}>
          <Icon className={`w-3 h-3 ${variant === "warning" ? "text-yellow-600" : "text-sky-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-800 font-medium flex items-center group text-sm"
            >
              <span className="truncate">{value}</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <p className={`font-medium text-sm ${variant === "warning" ? "text-yellow-700" : "text-gray-900"}`}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      {/* Header Section */}
      <div className="rounded-t mb-0 px-4 py-6 border-0 bg-sky-800">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-white">
              Company Details
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white text-sky-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-sky-100 transition duration-200">
              Edit Company
            </button>
          
          </div>
        </div>
      </div>

      {/* Pending Edit Alert */}
      {companyData.has_pending_edit && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <Edit3 className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">Pending Edit Request</p>
              <p className="text-yellow-700 text-sm">
                Edit ID: <span className="font-mono">{companyData.pending_edit_id}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="block w-full overflow-x-auto">
        <div className="px-4 py-3">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border">
                <img
                  src={companyData.logo}
                  alt={`${companyData.name} logo`}
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-gray-500 text-2xl font-bold">
                    {companyData.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{companyData.name}</h2>
               {companyData.is_verified && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
              </div>
              <p className="text-gray-600 mb-4">{companyData.tagline}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={Building2}
                  label="Industry"
                  value={companyData.industry}
                />
                
                <InfoCard
                  icon={Users}
                  label="Company Size"
                  value={companyData.size}
                />
                
                <InfoCard
                  icon={Building2}
                  label="Company Type"
                  value={companyData.type}
                />
                
                <InfoCard
                  icon={Globe}
                  label="Website"
                  value={companyData.website.replace('https://', '')}
                  link={companyData.website}
                />
                
                <InfoCard
                  icon={Building2}
                  label="LinkedIn"
                  value={`linkedin.com/company/${companyData.linkedin_url}`}
                  link={`https://www.linkedin.com/company/${companyData.linkedin_url}`}
                />
                
                <InfoCard
                  icon={Calendar}
                  label="Profile Created"
                  value={new Date(companyData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                />
              </div>
            </div>
          </div>
          
          {/* Metadata Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Company ID</p>
                <p className="font-mono text-sm text-gray-700 mt-1">{companyData.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(companyData.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}