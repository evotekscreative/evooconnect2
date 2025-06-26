import React, { useState, useEffect } from "react";
import { ArrowDownToLine, Save, MessageCircle, CheckCircle, Clock, UserCheck, Calendar, XCircle, FileText } from 'lucide-react';

const ModalList = ({ applicant, onClose }) => {
    const [detailData, setDetailData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [notes, setNotes] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

    // Status configuration with icons and colors
    const statusConfig = {
        submitted: { 
            label: "Submitted", 
            icon: FileText, 
            color: "bg-blue-100 text-blue-800 border-blue-200",
            bgColor: "bg-blue-50"
        },
        under_review: { 
            label: "Under Review", 
            icon: Clock, 
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            bgColor: "bg-yellow-50"
        },
        shortlisted: { 
            label: "Shortlisted", 
            icon: UserCheck, 
            color: "bg-purple-100 text-purple-800 border-purple-200",
            bgColor: "bg-purple-50"
        },
        interview_scheduled: { 
            label: "Interview Scheduled", 
            icon: Calendar, 
            color: "bg-indigo-100 text-indigo-800 border-indigo-200",
            bgColor: "bg-indigo-50"
        },
        accepted: { 
            label: "Accepted", 
            icon: CheckCircle, 
            color: "bg-green-100 text-green-800 border-green-200",
            bgColor: "bg-green-50"
        },
        rejected: { 
            label: "Rejected", 
            icon: XCircle, 
            color: "bg-red-100 text-red-800 border-red-200",
            bgColor: "bg-red-50"
        }
    };

    useEffect(() => {
        if (applicant && applicant.id) {
            const fetchApplicantDetail = async () => {
                try {
                    const userToken = localStorage.getItem("token");
                    const response = await get(
                        `${apiUrl}/api/job-application/${applicant.id}`,
                        {
                            headers: { Authorization: `Bearer ${userToken}` },
                        }
                    );
                    const data = await response.json();
                    
                    if (data?.data) {
                        setDetailData(data.data);
                        const currentStatus = data.data.status || applicant.status || "submitted";
                        setSelectedStatus(currentStatus);
                        setNotes(data.data.notes || "");
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

    // Track changes
    useEffect(() => {
        const originalStatus = detailData?.status || applicant?.status || "submitted";
        const originalNotes = detailData?.notes || "";
        
        setHasChanges(
            selectedStatus !== originalStatus || 
            notes !== originalNotes
        );
    }, [selectedStatus, notes, detailData, applicant]);

    const handleStatusUpdate = async () => {
    if (!applicant || !applicant.id) return;
    
    setActionLoading(true);
    try {
        const userToken = localStorage.getItem("token");
        const response = await fetch(
            `${apiUrl}/api/job-app/${applicant.id}/review`,
            {
                method: 'PUT', 
                headers: { 
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: selectedStatus,
                    notes: notes
                })
            }
        );
        
        const data = await response.json();
        if (data?.data) {
            setDetailData(data.data);
            setHasChanges(false);
        }
        onClose();
    } catch (error) {
        console.error("Failed to update applicant status:", error);
        alert("Failed to update application. Please try again.");
    } finally {
        setActionLoading(false);
    }
};

const handleReject = async () => {
    if (!applicant || !applicant.id || !rejectionReason) return;
    
    setActionLoading(true);
    try {
        const userToken = localStorage.getItem("token");
        const response = await fetch(
            `${apiUrl}/api/job-app/${applicant.id}/review`,
            {
                method: 'PUT', 
                headers: { 
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: "rejected",
                    rejection_reason: rejectionReason,
                    notes: notes
                })
            }
        );
        
        const data = await response.json();
        if (data?.data) {
            setDetailData(data.data);
        }
        onClose();
    } catch (error) {
        console.error("Failed to reject applicant:", error);
        alert("Failed to reject application. Please try again.");
    } finally {
        setActionLoading(false);
        setShowRejectForm(false);
    }
};


    if (!applicant) return null;
    
    const data = detailData || applicant;
    const applicantName = data.applicant?.name || data.name || "Unknown";
    const applicantEmail = data.applicant?.email || data.contact_info?.email || data.email || "No email provided";
    const applicantPhone = data.contact_info?.phone || data.phone || "No phone provided";
    const applicantHeadline = data.applicant?.headline || data.headline || "";
    const appliedDate = data.submitted_at || data.appliedDate || "Unknown date";
    const coverLetter = data.cover_letter || "No cover letter provided";
    const cvFilePath = data.cv_file_path || "";
    const motivationLetter = data.motivation_letter || "";
    const status = data.status || applicant.status || "submitted";

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const StatusIcon = statusConfig[status]?.icon || FileText;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
                {/* Modal Header */}
                <div className="border-b p-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Applicant Profile</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading applicant details...</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
                        {/* Current Status Badge */}
                        <div className="flex justify-end">
                            <div className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full border ${statusConfig[status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {statusConfig[status]?.label || status.replace("_", " ")}
                            </div>
                        </div>
                        
                        {/* Profile section */}
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
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700">{applicantEmail}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-700">{applicantPhone}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700">Applied on {formatDate(appliedDate)}</span>
                            </div>
                            {data.contact_info?.address && (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <h4 className="font-semibold mb-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        CV Document
                                    </h4>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{cvFilePath.split('/').pop()}</p>
                                            <p className="text-sm text-gray-500">PDF Document</p>
                                        </div>
                                        <a
                                            href={`${apiUrl}/${cvFilePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                        >
                                            <ArrowDownToLine className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {coverLetter && (
                                <div>
                                    <h4 className="font-semibold mb-2">Cover Letter</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                                            {coverLetter}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {motivationLetter && (
                                <div>
                                    <h4 className="font-semibold mb-2">Motivation Letter</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                                            {motivationLetter}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Status Management Section */}
                            <div className="border-t pt-6">
                                <h4 className="font-semibold mb-4 flex items-center">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Application Review
                                </h4>
                                
                                {/* Status Selection */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Update Status
                                        </label>
                                        <div className="relative">
                                            <select 
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                disabled={actionLoading}
                                            >
                                                {Object.entries(statusConfig).map(([key, config]) => (
                                                    <option key={key} value={key}>
                                                        {config.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows="3"
                                            placeholder="Add any notes about this application..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            disabled={actionLoading}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3 pt-2">
                                        <button
                                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                                                hasChanges && !actionLoading
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            onClick={handleStatusUpdate}
                                            disabled={!hasChanges || actionLoading}
                                        >
                                            {actionLoading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {actionLoading ? 'Updating...' : 'Save Changes'}
                                        </button>

                                        {selectedStatus === 'rejected' && (
                                            <button
                                                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
                                                onClick={() => setShowRejectForm(true)}
                                                disabled={actionLoading}
                                            >
                                                Reject
                                            </button>
                                        )}
                                    </div>

                                    {/* Changes indicator */}
                                    {hasChanges && (
                                        <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                                            <Clock className="w-4 h-4 mr-2" />
                                            You have unsaved changes
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Form Modal */}
                {showRejectForm && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason for Rejection
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        rows="4"
                                        placeholder="Please provide a reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                        onClick={() => setShowRejectForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        onClick={handleReject}
                                        disabled={!rejectionReason || actionLoading}
                                    >
                                        {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalList;
