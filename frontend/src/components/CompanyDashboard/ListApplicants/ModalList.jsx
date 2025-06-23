import React, { useState, useEffect } from "react";
import { ArrowDownToLine } from 'lucide-react';
import axios from "axios";

const ModalList = ({ applicant, onClose }) => {
    const [detailData, setDetailData] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

    useEffect(() => {
        if (applicant && applicant.id) {
            const fetchApplicantDetail = async () => {
                try {
                    const userToken = localStorage.getItem("token");
                    const response = await axios.get(
                        `${apiUrl}/api/job-applications/${applicant.id}`,
                        {
                            headers: { Authorization: `Bearer ${userToken}` },
                        }
                    );
                    
                    if (response.data?.data) {
                        setDetailData(response.data.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch applicant details:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchApplicantDetail();
        }
    }, [applicant, apiUrl]);

    if (!applicant) return null;
    
    // Use detailed data if available, otherwise fallback to basic applicant data
    const data = detailData || applicant;
    
    // Extract data with proper fallbacks
    const applicantName = data.applicant?.name || data.name || "Unknown";
    const applicantEmail = data.applicant?.email || data.contact_info?.email || data.email || "No email provided";
    const applicantPhone = data.contact_info?.phone || data.phone || "No phone provided";
    const applicantHeadline = data.applicant?.headline || data.headline || "";
    const appliedDate = data.submitted_at || data.appliedDate || "Unknown date";
    const coverLetter = data.cover_letter || "No cover letter provided";
    const cvFilePath = data.cv_file_path || "";
    const motivationLetter = data.motivation_letter || "";
    const status = data.status || applicant.status || "submitted";

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
                {/* Modal Header */}
                <div className="border-b p-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Applicant Profile</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                {loading ? (
                    <div className="p-6 text-center">Loading applicant details...</div>
                ) : (
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
                        {/* Status badge */}
                        <div className="flex justify-end">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                status === "submitted" ? "bg-yellow-100 text-yellow-800" :
                                status === "under_review" ? "bg-blue-100 text-blue-800" :
                                status === "rejected" ? "bg-red-100 text-red-800" :
                                status === "hired" ? "bg-green-100 text-green-800" :
                                "bg-gray-100 text-gray-800"
                            }`}>
                                {status.replace("_", " ")}
                            </span>
                        </div>
                        
                        {/* Profile section with photo, name and status */}
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 text-3xl font-medium">
                                        {applicantName.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">{applicantName}</h2>
                                <p className="text-gray-600">{applicantHeadline}</p>
                            </div>
                        </div>

                        {/* Contact information */}
                        <div className="bg-gray-50 p-4 rounded space-y-2">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700">{applicantEmail}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-700">{applicantPhone}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700">Applied on {formatDate(appliedDate)}</span>
                            </div>
                            {data.contact_info?.address && (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-700">{data.contact_info.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Documents section */}
                        <div className="space-y-4">
                            {cvFilePath && (
                                <div>
                                    <h4 className="font-medium mb-2">CV Document</h4>
                                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{cvFilePath.split('/').pop()}</p>
                                            <p className="text-sm text-gray-500 truncate">PDF Document</p>
                                        </div>
                                        <a
                                            href={`${apiUrl}${cvFilePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 ml-2"
                                        >
                                            <ArrowDownToLine className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {coverLetter && (
                                <div>
                                    <h4 className="font-medium mb-2">Cover Letter</h4>
                                    <div className="bg-gray-50 p-4 rounded">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {coverLetter}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {motivationLetter && (
                                <div>
                                    <h4 className="font-medium mb-2">Motivation Letter</h4>
                                    <div className="bg-gray-50 p-4 rounded">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {motivationLetter}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalList;
