import React, { useState } from 'react';
import { ChevronLeft, ArrowDownToLine, X, FileText, Loader2, Download, Upload } from 'lucide-react';
import ConfirmationDialog from '../../components/ApplicantRequest/ConfirmationDialog.jsx';

const ResumeUpload = ({ userData, onBack, onNext, onResumeChange, isSubmitting, onClose }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            onResumeChange(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        onResumeChange(null);
    };

    const handleClose = () => {
        setShowConfirmDialog(true);
    };

    const handleSaveAndClose = () => {
        setShowConfirmDialog(false);
        onClose();
    };

    const handleDiscard = () => {
        setShowConfirmDialog(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat(bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-start justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mt-10 max-h-[90vh] flex flex-col animate-slide-down overflow-y-auto max-h-[80vh]">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="p-1 rounded-full hover:bg-gray-100 mr-2"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-800">Resume</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-6 border-t border-gray-200 pt-4">
                        <div>
                            <div className="mb-1">
                                <span className="text-sm font-medium text-gray-700">Resume</span>
                                <span className="text-red-500"> *</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3 italic">Be sure to include an updated resume</p>

                            <div className="border border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors">
                                {userData.resume ? (
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-50 p-2 rounded-md">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {userData.resume.name || userData.resume.path?.split('/').pop()}
                                                </p>
                                                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                    <span>{userData.resume.size ? formatFileSize(userData.resume.size) : 'Unknown size'}</span>
                                                    <span>•</span>
                                                    <span>Uploaded at {userData.resume.lastModified ? formatDate(userData.resume.lastModified) : 'Unknown date'}</span>
                                                </div>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">
                                                    {(userData.resume.name || userData.resume.path)?.split('.').pop()?.toUpperCase() || 'FILE'}
                                                </span>
                                                <div className="flex gap-2 mt-2">
                                                    {userData.resume.path && (
                                                        <a
                                                            href={`${import.meta.env.VITE_APP_BACKEND_URL}/${userData.resume.path}`}
                                                            download
                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                                                        >
                                                            <Download className="w-3 h-3 mr-1" />
                                                            Download
                                                        </a>
                                                    )}
                                                    <label
                                                        htmlFor="resume-update"
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 border border-green-600 rounded hover:bg-green-50 cursor-pointer transition-colors"
                                                    >
                                                        <Upload className="w-3 h-3 mr-1" />
                                                        Update
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".doc,.docx,.pdf"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="resume-update"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveFile}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                            aria-label="Remove file"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Upload resume</p>
                                        <p className="text-xs text-gray-500 mb-3">DOC, DOCX, PDF</p>

                                        <input
                                            type="file"
                                            accept=".doc,.docx,.pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label
                                            htmlFor="resume-upload"
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                                        >
                                            <ArrowDownToLine className="w-4 h-4 mr-2" />
                                            Select file
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-5">
                            Submitting this application won't change your profile.
                        </p>

                        <div className="flex justify-between border-t border-gray-200 pt-4">
                            <button
                                onClick={onBack}
                                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={onNext}
                                disabled={!userData.resume || isSubmitting}
                                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors ${
                                    !userData.resume || isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                        Processing...
                                    </span>
                                ) : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmDialog && (
                <ConfirmationDialog
                    onConfirm={handleSaveAndClose}
                    onCancel={handleDiscard}
                    onDiscard={onClose}
                />
            )}
        </div>
    );
};

export default ResumeUpload;
