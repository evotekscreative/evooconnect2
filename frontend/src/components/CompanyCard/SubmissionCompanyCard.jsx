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

export default function SubmissionCompanyCard({ company, showStatus = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    if (!company) return null;

    // Status color mapping for card header
    const statusColors = {
        approved: { bg: "bg-green-100", text: "text-green-700" },
        pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
        rejected: { bg: "bg-red-100", text: "text-red-700" },
        default: { bg: "bg-gray-100", text: "text-gray-700" },
    };

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
            <div className="w-64 rounded-xl shadow-lg bg-white mx-auto mb-6 border border-gray-200 overflow-hidden">
                {/* Status di bagian atas card */}
                <div className={`px-4 py-2 ${statusColors[company.status]?.bg || statusColors.default.bg}`}>
                    <span className={`${statusColors[company.status]?.text || statusColors.default.text} font-semibold text-xs uppercase`}>
                        {company.status || "Unknown"}
                    </span>
                </div>
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
                        className="w-full py-2 rounded-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleViewSubmission(company)}
                    >
                        DETAIL
                    </button>
                </div>
            </div>

            {isModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                            onClick={handleCloseModal}
                        >
                            ×
                        </button>
                        <div className={`px-4 py-2 rounded-t-lg mb-4 ${selectedSubmission.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedSubmission.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            <span className="font-semibold text-lg">{selectedSubmission.name}</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col items-center">
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
                                <div><span className="font-semibold">LinkedIn: </span>{selectedSubmission.linkedin_url || "-"}</div>
                                <div><span className="font-semibold">Website: </span>{selectedSubmission.website || "-"}</div>
                                <div><span className="font-semibold">Industry: </span>{selectedSubmission.industry || "-"}</div>
                                <div><span className="font-semibold">Organization Size: </span>{selectedSubmission.size || "-"}</div>
                                <div><span className="font-semibold">Organization Type: </span>{selectedSubmission.type || "-"}</div>
                            </div>
                        </div>
                        <hr className="my-4" />
                        <div className="text-center">
                            {selectedSubmission.status === "pending" && <p className="text-yellow-700">Your submission is under review.</p>}
                            {selectedSubmission.status === "approved" && <p className="text-green-700">Your company has been <b>approved</b>!</p>}
                            {selectedSubmission.status === "rejected" && (
                                <div>
                                    <p className="text-red-700">Your submission was <b>rejected</b>.</p>
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
            )}
        </>
    );
}