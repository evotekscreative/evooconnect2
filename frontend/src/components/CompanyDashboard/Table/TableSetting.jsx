import React from "react";
import { useState } from "react";
import {
  Building2,
  Globe,
  Users,
  Calendar,
  Edit3,
  ExternalLink,
  Shield,
  Eye,
  Clock,
} from "lucide-react";
import CompanyEditModal from "../../CompanyProfile/CompanyEditModal.jsx";
import { toast } from "sonner";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

// Component untuk menampilkan pending edit request
const PendingEditPreview = ({ isOpen, onClose, pendingData, companyData }) => {
  if (!isOpen) return null;

  // Extract the actual data from API response structure
  const requestedChanges = pendingData?.requested_changes || {};
  const currentData = pendingData?.current_data || {};

  const InfoCompare = ({ label, currentValue, pendingValue, icon: Icon }) => (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center mb-2">
        <Icon className="w-4 h-4 mr-2 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Current:</p>
          <p className="text-sm text-gray-900">{currentValue || "N/A"}</p>
        </div>
        {pendingValue !== currentValue && (
          <div>
            <p className="text-xs text-blue-600">Pending:</p>
            <p className="text-sm font-medium text-blue-800">
              {pendingValue || "N/A"}
            </p>
          </div>
        )}
        {pendingValue === currentValue && (
          <p className="text-xs text-gray-400">No changes requested</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Edit Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-4 mb-6 border-l-4 border-yellow-400 rounded-r-lg bg-yellow-50">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-3 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Request Status:{" "}
                  {pendingData.status === "pending"
                    ? "Pending Review"
                    : pendingData.status}
                </p>
                <p className="text-sm text-yellow-700">
                  Request ID:{" "}
                  <span className="font-mono">{pendingData.id}</span>
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  Submitted: {new Date(pendingData.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCompare
              label="Company Name"
              currentValue={currentData.name}
              pendingValue={requestedChanges.name}
              icon={Building2}
            />

            <InfoCompare
              label="Tagline"
              currentValue={currentData.tagline}
              pendingValue={requestedChanges.tagline}
              icon={Building2}
            />

            <InfoCompare
              label="Industry"
              currentValue={currentData.industry}
              pendingValue={requestedChanges.industry}
              icon={Building2}
            />

            <InfoCompare
              label="Company Size"
              currentValue={currentData.size}
              pendingValue={requestedChanges.size}
              icon={Users}
            />

            <InfoCompare
              label="Company Type"
              currentValue={currentData.type}
              pendingValue={requestedChanges.type}
              icon={Building2}
            />

            <InfoCompare
              label="Website"
              currentValue={currentData.website}
              pendingValue={requestedChanges.website}
              icon={Globe}
            />

            <InfoCompare
              label="LinkedIn URL"
              currentValue={currentData.linkedin_url}
              pendingValue={requestedChanges.linkedin_url}
              icon={Globe}
            />
          </div>

          {/* Logo comparison */}
          {(requestedChanges.logo || currentData.logo) && (
            <div className="p-4 mt-6 border border-gray-200 rounded-lg">
              <h3 className="mb-4 text-sm font-medium text-gray-700">
                Logo Changes
              </h3>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="mb-2 text-xs text-gray-500">Current Logo</p>
                  <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border rounded-lg">
                    {currentData.logo ? (
                      <img
                        src={
                          currentData.logo.startsWith("http")
                            ? currentData.logo
                            : `${BASE_URL}/${currentData.logo.replace(
                                /^\/+/,
                                ""
                              )}`
                        }
                        alt="Current logo"
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-500">
                        {currentData.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                </div>
                {requestedChanges.logo &&
                  requestedChanges.logo !== currentData.logo && (
                    <div className="text-center">
                      <p className="mb-2 text-xs text-blue-600">Pending Logo</p>
                      <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border rounded-lg">
                        <img
                          src={
                            requestedChanges.logo.startsWith("http")
                              ? requestedChanges.logo
                              : `${BASE_URL}/${requestedChanges.logo.replace(
                                  /^\/+/,
                                  ""
                                )}`
                          }
                          alt="Pending logo"
                          className="object-cover w-full h-full rounded-lg"
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Show request details */}
          <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="mb-4 text-sm font-medium text-gray-700">
              Request Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Requested by</p>
                <p className="text-sm font-medium text-gray-900">
                  {pendingData.user?.name || "Unknown User"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {pendingData.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(pendingData.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(pendingData.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CompanyProfileDashboard({ companyData }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPendingPreview, setShowPendingPreview] = useState(false);
  const [previousRequest, setPreviousRequest] = useState(null);
  const [pendingEditData, setPendingEditData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState(companyData);

  // Add loading state check
  if (!companyData) {
    return (
      <div className="relative flex flex-col w-full min-w-0 mb-6 break-words bg-white rounded shadow-lg">
        <div className="px-4 py-6 mb-0 border-0 rounded-t bg-sky-800">
          <div className="flex flex-wrap items-center">
            <div className="relative flex-1 flex-grow w-full max-w-full px-4">
              <h3 className="text-lg font-bold text-white">Company Details</h3>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 rounded-full border-sky-600 border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading company data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle edit request submission
  const handleSubmitEditRequest = async (changes) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add all the changes to FormData
      Object.keys(changes).forEach((key) => {
        if (key === "logo" && changes[key].startsWith("data:")) {
          // Convert base64 to blob for logo
          const base64Data = changes[key].split(",")[1];
          const mimeType = changes[key]
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];
          const blob = new Blob(
            [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
            { type: mimeType }
          );
          formData.append("logo", blob, "logo.png");
        } else {
          formData.append(key, changes[key]);
        }
      });

      const response = await fetch(
        `${BASE_URL}/api/companies/${company.id}/request-edit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit edit request");
      }

      if (result.code === 201) {
        toast.success("Edit request submitted successfully!");
        // Close modal after successful submission
        setTimeout(() => {
          setShowEditModal(false);
        }, 1500);

        // edit companies data
        const updatedCompanyData = {
          ...company,
          ...changes,
          has_pending_edit: true,
          pending_edit_id: result.data.id,
        };

        setCompany(updatedCompanyData);
      } else {
        throw new Error(result.message || "Failed to submit edit request");
      }
    } catch (error) {
      console.error("Error submitting edit request:", error);
      toast.error(error.message || "Failed to submit edit request");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to fetch previous edit request
  const fetchPreviousRequest = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/companies/${companyData.id}/edit-requests/latest`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200 && result.data) {
          setPreviousRequest(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching previous request:", error);
    }
  };

  // Function to fetch pending edit request details
  const fetchPendingEditRequest = async (editRequestId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/companies-edit-requests/${editRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200 && result.data) {
          setPendingEditData(result.data);
          setShowPendingPreview(true);
        }
      } else {
        toast.error("Failed to fetch pending edit request details");
      }
    } catch (error) {
      console.error("Error fetching pending edit request:", error);
      toast.error("Failed to load pending edit request");
    }
  };

  // Fetch previous request when modal opens
  React.useEffect(() => {
    if (showEditModal) {
      fetchPreviousRequest();
    }
  }, [showEditModal]);

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    link = null,
    variant = "default",
  }) => (
    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start space-x-2">
        <div
          className={`p-1 rounded ${
            variant === "warning" ? "bg-yellow-100" : "bg-sky-100"
          }`}
        >
          <Icon
            className={`w-3 h-3 ${
              variant === "warning" ? "text-yellow-600" : "text-sky-600"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 group"
            >
              <span className="truncate">{value || "N/A"}</span>
              <ExternalLink className="w-3 h-3 ml-1 transition-opacity opacity-0 group-hover:opacity-100" />
            </a>
          ) : (
            <p
              className={`font-medium text-sm ${
                variant === "warning" ? "text-yellow-700" : "text-gray-900"
              }`}
            >
              {value || "N/A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col w-full min-w-0 mb-6 break-words bg-white rounded shadow-lg">
      {/* Header Section */}
      <div className="px-4 py-6 mb-0 border-0 rounded-t bg-sky-800">
        <div className="flex flex-wrap items-center">
          <div className="relative flex-1 flex-grow w-full max-w-full px-4">
            <h3 className="text-lg font-bold text-white">Company Details</h3>
          </div>
          <div className="flex items-center space-x-3">
            {company.has_pending_edit && company.pending_edit_id && (
              <button
                className="px-4 py-2 font-semibold text-yellow-800 transition duration-200 bg-yellow-100 rounded-lg shadow hover:bg-yellow-200"
                onClick={() => fetchPendingEditRequest(company.pending_edit_id)}
              >
                <Eye className="inline-block w-4 h-4 mr-2" />
                View Pending Changes
              </button>
            )}
            {!company.has_pending_edit && (
              <button
                className="px-4 py-2 font-semibold transition duration-200 bg-white rounded-lg shadow text-sky-800 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowEditModal(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Edit Company"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Edit Alert */}
      {company.has_pending_edit && (
        <div className="p-4 mx-4 mt-4 border-l-4 border-yellow-400 rounded-r-lg bg-yellow-50">
          <div className="flex items-center">
            <Edit3 className="w-5 h-5 mr-3 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                Pending Edit Request
              </p>
              <p className="text-sm text-yellow-700">
                Edit ID:{" "}
                <span className="font-mono">{company.pending_edit_id}</span>
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                Your edit request is being reviewed by our admin team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="block w-full overflow-x-auto">
        <div className="px-4 py-3">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border rounded-lg">
                {company.logo ? (
                  <img
                    src={
                      company.logo.startsWith("http")
                        ? company.logo
                        : `${BASE_URL}/${company.logo.replace(/^\/+/, "")}`
                    }
                    alt={`${company.name || "Company"} logo`}
                    className="object-cover w-full h-full rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="flex items-center justify-center w-full h-full rounded-lg"
                  style={{ display: company.logo ? "none" : "flex" }}
                >
                  <span className="text-2xl font-bold text-gray-500">
                    {company.name && company.name.length > 0
                      ? company.name.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center mb-2 space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {company.name || "Unnamed Company"}
                </h2>
                {company.is_verified && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {company.has_pending_edit && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    <Shield className="inline-block w-3 h-3 mr-1" />
                    Pending Edit Request
                  </span>
                )}
              </div>
              <p className="mb-4 text-gray-600">
                {company.tagline || "No tagline provided"}
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={Building2}
                  label="Industry"
                  value={company.industry}
                />

                <InfoCard
                  icon={Users}
                  label="Company Size"
                  value={company.size}
                />

                <InfoCard
                  icon={Building2}
                  label="Company Type"
                  value={company.type}
                />

                <InfoCard
                  icon={Globe}
                  label="Website"
                  value={
                    company.website
                      ? company.website.replace("https://", "")
                      : null
                  }
                  link={company.website}
                />

                <InfoCard
                  icon={Building2}
                  label="LinkedIn"
                  value={
                    company.linkedin_url
                      ? `linkedin.com/company/${company.linkedin_url}`
                      : null
                  }
                  link={
                    company.linkedin_url
                      ? `https://www.linkedin.com/company/${company.linkedin_url}`
                      : null
                  }
                />

                <InfoCard
                  icon={Calendar}
                  label="Profile Created"
                  value={
                    company.created_at
                      ? new Date(company.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : null
                  }
                />
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="pt-8 mt-8 border-t border-gray-200">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              System Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Company ID</p>
                <p className="mt-1 font-mono text-sm text-gray-700">
                  {company.id || "N/A"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="mt-1 text-sm text-gray-700">
                  {company.updated_at
                    ? new Date(company.updated_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CompanyEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        companyData={company}
        previousRequest={previousRequest}
        onSubmitEditRequest={handleSubmitEditRequest}
      />

      <PendingEditPreview
        isOpen={showPendingPreview}
        onClose={() => setShowPendingPreview(false)}
        pendingData={pendingEditData}
        companyData={company}
      />
    </div>
  );
}
