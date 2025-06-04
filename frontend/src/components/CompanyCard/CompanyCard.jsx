import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const companies = [
    {
        id: 1,
        status: "Approved",
        name: "Tech Solutions Inc.",
        industry: "Information Technology",
        employees: "50-100 employees",
        logo: "https://via.placeholder.com/80"
    },
    {
        id: 2,
        status: "Pending",
        name: "Design Studio Co.",
        industry: "Creative Design",
        employees: "10-50 employees",
        logo: "https://via.placeholder.com/80"
    },
    {
        id: 3,
        status: "Rejected",
        name: "Food Enterprises",
        industry: "Food & Beverage",
        employees: "100+ employees",
        logo: "https://via.placeholder.com/80"
    }
];

// status card
const StatusCard = ({ company, onDetailClick }) => {
    const statusColors = {
        Approved: {
            bg: "bg-green-100",
            text: "text-green-800"
        },
        Pending: {
            bg: "bg-yellow-100",
            text: "text-yellow-800"
        },
        Rejected: {
            bg: "bg-red-100",
            text: "text-red-800"
        }
    };

    // detail
    return (
        <div className="w-64 rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white mx-3 mb-5">
            <div className={`${statusColors[company.status].bg} px-3 py-1.5`}>
                <span className={`${statusColors[company.status].text} font-semibold text-xs`}>
                    {company.status}
                </span>
            </div>

            <div className="px-3 py-4">
                <div className="flex flex-col items-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden mb-2">
                        <img
                            src={company.logo}
                            alt="Company Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 text-center">
                        {company.name}
                    </h3>
                </div>

                <div className="text-center mb-4">
                    <p className="text-gray-600 text-xs mb-1">{company.industry}</p>
                    <p className="text-gray-500 text-xs">{company.employees}</p>
                </div>

                <button
                    onClick={() => onDetailClick(company)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition duration-200"
                >
                    DETAIL
                </button>
            </div>
        </div>
    );
};

// pending
const CompanyModal = ({ company, onClose, onCancelRequest }) => {
    const statusColors = {
        Approved: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Rejected: "bg-red-100 text-red-800"
    };

    // Sample data for the company details
    const companyDetails = {
        linkedin: "linkedin.com/company/" + company.name.toLowerCase().replace(/\s+/g, '-'),
        website: "www." + company.name.toLowerCase().replace(/\s+/g, '') + ".com",
        organizationType: "Private Limited",
        tagline: "Innovative solutions for your business"
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl">
                <div className={`${statusColors[company.status]} px-4 py-3 rounded-t-lg flex justify-between items-center`}>
                    <h3 className="font-semibold">{company.name}</h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        &times;
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Column - Logo and Basic Info */}
                        <div className="flex flex-col items-center md:items-start md:w-1/3">
                            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
                                <img
                                    src={company.logo}
                                    alt="Company Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                    {company.name}
                                </h3>
                                <p className="text-sm text-blue-600 italic mb-3">
                                    "{companyDetails.tagline}"
                                </p>
                                <div className={`${statusColors[company.status]} px-3 py-1 rounded-full text-sm inline-block`}>
                                    {company.status}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Detailed Info */}
                        <div className="md:w-2/3">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">LinkedIn</h4>
                                        <p className="text-sm text-gray-800 mt-1">
                                            {companyDetails.linkedin}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Website</h4>
                                        <p className="text-sm text-gray-800 mt-1">
                                            {companyDetails.website}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Industry</h4>
                                        <p className="text-sm text-gray-800 mt-1">
                                            {company.industry}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Organization Size</h4>
                                        <p className="text-sm text-gray-800 mt-1">
                                            {company.employees}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Organization Type</h4>
                                    <p className="text-sm text-gray-800 mt-1">
                                        {companyDetails.organizationType}
                                    </p>
                                </div>
                            </div>

                            {company.status === "Pending" && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Your submission is under review. You'll be notified once the verification process is complete.
                                    </p>
                                    <button
                                        onClick={onCancelRequest}
                                        className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition duration-200 font-semibold"
                                    >
                                        Cancel Sending Request
                                    </button>
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