import React, { useState } from "react";

const statusStyle = {
    approved: "bg-green-100 text-green-700 border-b border-green-300",
    pending: "bg-yellow-100 text-yellow-700 border-b border-yellow-300",
    rejected: "bg-red-100 text-red-700 border-b border-red-300",
    default: "bg-gray-100 text-gray-700 border-b border-gray-300",
};

const statusLabel = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
};

export default function CompanyCard({ company, showStatus = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    if (!company) return null;

    const status = company.status ? company.status.toLowerCase() : "default";
    const badgeStyle = statusStyle[status] || statusStyle.default;
    const badgeLabel = statusLabel[status] || "Unknown";

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSubmission(null);
    };

    return (
        <>
            <div className="rounded-xl shadow-lg bg-white w-80 mx-auto mb-6">
                {showStatus && (
                    <div className={`rounded-t-xl px-4 py-2 text-sm font-semibold ${badgeStyle}`}>
                        {badgeLabel}
                    </div>
                )}
                <div className="flex flex-col items-center py-6 px-4">
                    <img
                        src={company.logo ? 'http://localhost:3000/' + company.logo : "/default-company-logo.png"}
                        alt="Company logo"
                        className="w-20 h-20 rounded-full object-cover mb-4 border"
                    />
                    <h3 className="text-lg font-bold mb-1 text-center">{company.name || "No Name"}</h3>
                    <div className="text-gray-600 text-sm mb-1 text-center">{company.industry || "-"}</div>
                    <div className="text-gray-500 text-xs mb-4 text-center">{company.size || "-"}</div>
                    <button
                        className={`w-full py-2 rounded-lg font-semibold transition ${showStatus
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        onClick={() => showStatus && handleViewSubmission(company)}
                        disabled={!showStatus}
                    >
                        DETAIL
                    </button>
                </div>
            </div>

            {/* Modal detail */}
            {isModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                            onClick={handleCloseModal}
                        >
                            ×
                        </button>
                        {/* Header */}
                        <div className={`px-4 py-2 rounded-t-lg mb-4 ${selectedSubmission.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedSubmission.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}>
                            <span className="font-semibold text-lg">{selectedSubmission.name}</span>
                        </div>
                        {/* Body */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col items-center">
                                {/* Logo */}
                                <div className="w-28 h-28 bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                                    {selectedSubmission.logo ? (
                                        <img src={selectedSubmission.logo.startsWith('http') ? selectedSubmission.logo : 'http://localhost:3000/' + selectedSubmission.logo} alt="Company Logo" className="object-contain h-full" />
                                    ) : (
                                        <span className="text-gray-400">Company Logo</span>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h2 className="font-bold text-xl">{selectedSubmission.name}</h2>
                                    <p className="italic text-blue-700 text-sm">{selectedSubmission.tagline}</p>
                                    <div className="mt-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedSubmission.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : selectedSubmission.status === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                            {selectedSubmission.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <span className="font-semibold">LinkedIn: </span>
                                    <span>{selectedSubmission.linkedin || "-"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Website: </span>
                                    <span>{selectedSubmission.website || "-"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Industry: </span>
                                    <span>{selectedSubmission.industry || "-"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Organization Size: </span>
                                    <span>{selectedSubmission.size || "-"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Organization Type: </span>
                                    <span>{selectedSubmission.type || "-"}</span>
                                </div>
                            </div>
                        </div>
                        <hr className="my-4" />
                        {/* Status Message */}
                        <div className="text-center">
                            {selectedSubmission.status === "pending" && (
                                <p className="text-yellow-700">
                                    Your submission is under review. You'll be notified once the verification process is complete.
                                </p>
                            )}
                            {selectedSubmission.status === "approved" && (
                                <p className="text-green-700">
                                    Your company has been <b>approved</b>! You can now access all company features.
                                </p>
                            )}
                            {selectedSubmission.status === "rejected" && (
                                <div>
                                    <p className="text-red-700">
                                        Your submission was <b>rejected</b>.
                                    </p>
                                    {selectedSubmission.rejection_reason && (
                                        <div className="mt-2 p-2 bg-red-100 rounded">
                                            <span className="text-xs text-red-700">
                                                <strong>Reason:</strong> {selectedSubmission.rejection_reason}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// edit
const EditModal = ({ company, onClose }) => {
    const [editedCompany] = useState({
        name: company.name,
        linkedin: "linkedin.com/company/tech-solutions",
        website: "www.techsolutions.com",
        industry: company.industry,
        organizationSize: company.employees,
        organizationType: "Private Limited",
        logo: company.logo,
        tagline: "Innovative tech solutions for your business"
    });

    const location = useLocation();
    const isPendingEdit = location.pathname === "/company-pending";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl">
                <div className="bg-blue-100 px-4 py-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="font-semibold">Edit Company: {company.name}</h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        &times;
                    </button>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Data */}
                    <div className="border-r pr-6">
                        <h4 className="font-medium mb-4 text-gray-700">Current Data</h4>

                        <div className="flex flex-col items-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mb-3">
                                <img
                                    src={company.logo}
                                    alt="Company Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="mt-4 space-y-4 text-left w-full divide-y divide-gray-200">
                                <p className="text-sm text pt-4">
                                    <span className="font-medium">Name:</span> {editedCompany.name}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Tagline:</span> {editedCompany.tagline}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">LinkedIn:</span> {editedCompany.linkedin}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Website:</span> {editedCompany.website}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Industry:</span> {editedCompany.industry}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Organization Size:</span> {editedCompany.organizationSize}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Organization Type:</span> {editedCompany.organizationType}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Logo URL:</span> {editedCompany.logo}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edited Data */}
                    <div>
                        <h4 className="font-medium mb-4 text-gray-700">
                            {isPendingEdit ? "Edited Data" : "Edit Data"}
                        </h4>

                        <div className="flex flex-col items-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mb-3">
                                <img
                                    src={editedCompany.logo}
                                    alt="Edited Company Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="mt-4 space-y-4 text-left w-full divide-y divide-gray-200">
                                <p className="text-sm text pt-4">
                                    <span className="font-medium">Name:</span> {editedCompany.name}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Tagline:</span> {editedCompany.tagline}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">LinkedIn:</span> {editedCompany.linkedin}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Website:</span> {editedCompany.website}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Industry:</span> {editedCompany.industry}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Organization Size:</span> {editedCompany.organizationSize}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Organization Type:</span> {editedCompany.organizationType}
                                </p>
                                <p className="text-sm pt-4">
                                    <span className="font-medium">Logo URL:</span> {editedCompany.logo}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CompanyCards = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleDetailClick = (company) => {
        if (location.pathname === "/company-management/company-detail") {
            navigate(`/company-profile/${company.id}`);
        } else if (location.pathname === "/company-management/company-pending") {
            setSelectedCompany(company);
            setShowModal(true);
        } else if (location.pathname === "/company-management/company-edit") {
            setSelectedCompany(company);
            setShowEditModal(true);
        }
    };

    const handleCancelRequest = () => {
        console.log("Canceling request for company:", selectedCompany.id);
        setShowModal(false);
        // Add API call or state update here
    };

    const handleSaveChanges = (editedData) => {
        console.log("Saving changes:", {
            companyId: selectedCompany.id,
            changes: editedData
        });
        setShowEditModal(false);
        // Add API call or state update here
    };

    return (
        <div className="flex p-4">
            {companies.map(company => (
                <StatusCard
                    key={company.id}
                    company={company}
                    onDetailClick={handleDetailClick}
                />
            ))}

            {showModal && selectedCompany && (
                <CompanyModal
                    company={selectedCompany}
                    onClose={() => setShowModal(false)}
                    onCancelRequest={handleCancelRequest}
                />
            )}

            {showEditModal && selectedCompany && (
                <EditModal
                    company={selectedCompany}
                    onClose={() => setShowEditModal(false)}
                    onSaveChanges={handleSaveChanges}
                />
            )}
        </div>
    );
};

export default CompanyCards;