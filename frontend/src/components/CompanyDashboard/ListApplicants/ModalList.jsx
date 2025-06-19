import React from "react";
import { ArrowDownToLine } from 'lucide-react';

const ModalList = ({ applicant, onClose }) => {
    if (!applicant) return null;

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
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
                    {/* Profile section with photo, name and status */}
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-3xl font-medium">
                                    {applicant.name.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{applicant.name}</h2>
                            <p className="text-gray-600">{applicant.headline}</p>
                        </div>
                    </div>

                    {/* Contact information */}
                    <div className="bg-gray-50 p-4 rounded space-y-2">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">{applicant.email}</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{applicant.phone}</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">Applied on {applicant.appliedDate}</span>
                        </div>
                    </div>

                    {/* Documents section */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Documents</h4>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{applicant.name.replace(/\s+/g, '_').toLowerCase()}_resume.pdf</p>
                                    <p className="text-sm text-gray-500 truncate">PDF Document • 2.4 MB</p>
                                </div>
                                <a
                                    href="#"
                                    className="text-blue-500 hover:text-blue-700 ml-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <ArrowDownToLine className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Cover Letter</h4>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700">
                                    Dear Hiring Manager,<br /><br />
                                    I'm excited to apply for the Frontend Developer position at your company. With 5 years of experience in React and modern JavaScript frameworks, I believe I would be a great fit for your team...<br /><br />
                                    Best regards,<br />
                                    {applicant.name.split(' ')[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalList;