import React, { useState } from 'react';
import JobApplicationModal from '../../components/ApplicantRequest/JobApplicationModal.jsx';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { SquareArrowOutUpRight, StickyNote, BriefcaseBusiness } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const saveJob = async (jobVacancyId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/saved-jobs/${jobVacancyId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.code === 201) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Save failed' };
        }
    } catch (error) {
        return { success: false, error: 'Network error occurred' };
    }
};

const unsaveJob = async (jobVacancyId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/saved-jobs/${jobVacancyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: 'Unsave failed' };
        }
    } catch (error) {
        return { success: false, error: 'Network error occurred' };
    }
};

export default function JobHeader({ job, clickedSave, handleSaveClick }) {
    const [showModal, setShowModal] = useState(false);
    const [showUnsaveModal, setShowUnsaveModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(job.has_applied || false);
    const [applicationStatus, setApplicationStatus] = useState(job.application_status || null);

    // Check if current user is the job creator
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwnJob = job.created_by === currentUser.id || job.company?.owner_id === currentUser.id;
    const handleJobSave = async () => {
        if (clickedSave) {
            setShowUnsaveModal(true);
        } else {
            const result = await saveJob(job.id);

            if (result.success) {
                toast.success('Job saved successfully!');
                handleSaveClick();
            } else {
                toast.error(result.error || 'Failed to save job');
            }
        }
    };

    const handleUnsaveConfirm = async () => {
        const result = await unsaveJob(job.id);

        if (result.success) {
            toast.success('Job unsaved successfully!');
            handleSaveClick();
        } else {
            toast.error(result.error || 'Failed to unsave job');
        }
        setShowUnsaveModal(false);
    };


    const handleApplyClick = () => {
        if (job.type_apply === 'external_apply' && job.external_link) {
            window.open(job.external_link, '_blank');
        } else {
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Fungsi ini dipanggil setelah submit sukses
    const handleApplied = () => {
        setHasApplied(true);
        setApplicationStatus('submitted');
        setShowModal(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-2 w-full max-w-3xl mx-auto">
            {/* Logo & company */}
            <div className="flex items-center mb-1">
                <img
                    src={job.company?.logo?.startsWith('http') ? job.company.logo : `${BASE_URL}/${job.company?.logo || ''}`}
                    alt="logo"
                    className="w-7 h-7 rounded object-cover mr-2"
                />
                <Link to={`/company-detail/${job.company.id || job.company?.name}`} className="text-blackhover:underline">
                    <span className="text-sm font-semibold">{job.company?.name || job.company}</span>
                </Link>
            </div>
            {/* Job Title */}
            <div className="font-bold text-2xl text-gray-900 mb-1">{job.title}</div>
            {/* Location & posted info */}
            <div className="text-sm text-gray-700 mb-1">
                {job.location}
                {job.created_at && (
                    <>
                        <span className="mx-1">·</span>
                        <span>Posted {(() => {
                            // Calculate day difference
                            const now = new Date();
                            const posted = new Date(job.created_at);
                            const diff = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
                            return diff < 1 ? 'today' : `${diff} day${diff > 1 ? 's' : ''} ago`;
                        })()}</span>
                    </>
                )}
                {/* Example: · More than 100 people clicked Apply */}
                {job.total_applied && (
                    <>
                        <span className="mx-1">·</span>
                        <span>Lebih dari {job.total_applied} orang mengklik Lamar</span>
                    </>
                )}
            </div>
            {/* Promosi/Info */}
            {job.promoted && (
                <div className="text-xs text-gray-500 mb-1">
                    Dipromosikan oleh pembuka lowongan · Respon dikelola di luar platform
                </div>
            )}
            {/* Info gabungan/magang */}
            <div className="flex items-center gap-1 text-[12px] text-gray-500 mb-1">
                <span className="flex items-center justify-center gap-1">
                    <span role="img" aria-label="gabungan"><BriefcaseBusiness className='w-3 h-3' /></span>
                    {job.work_type || '-'}
                </span>
                •
                <span className="flex items-center gap-1">
                    <span role="img" aria-label="magang"></span>
                    {job.job_type || 'Magang'}
                </span>
                •
                <span className="flex items-center gap-1">
                    <span role="img" aria-label="magang"></span>
                    {job.experience_level} level
                </span>
            </div>
            {/* Tombol apply/save */}
            <div className="flex flex-row gap-2 mt-2">
                <button
                    className={`flex-1 px-4 py-2 rounded-md font-semibold border transition-colors flex items-center justify-center gap-2
                        ${isOwnJob
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : applicationStatus === 'submitted'
                                ? 'bg-yellow-500 text-white cursor-not-allowed'
                                : applicationStatus === 'accepted'
                                    ? 'bg-green-500 text-white cursor-not-allowed'
                                    : applicationStatus === 'rejected'
                                        ? 'bg-red-500 text-white cursor-not-allowed'
                                        : hasApplied
                                            ? 'bg-blue-500 text-white cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-blue-400'
                        }`}
                    onClick={handleApplyClick}
                    disabled={hasApplied || isOwnJob}
                >
                    {isOwnJob ? 'Your Job' :
                        applicationStatus === 'submitted' ? 'Submitted' :
                            applicationStatus === 'accepted' ? 'Approved' :
                                applicationStatus === 'rejected' ? 'Rejected' :
                                    hasApplied ? 'Applied' :
                                        job.type_apply === 'simple_apply' ? (
                                            <>
                                                <StickyNote size={16} />
                                                <span>Simple Apply</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Apply</span>
                                                <SquareArrowOutUpRight size={16} />
                                            </>
                                        )}
                </button>
                <button
                    className={`flex-1 px-4 py-2 rounded-md font-semibold border transition-colors
                        ${clickedSave ? 'bg-green-500 text-white' : 'border-[#0A66C2] text-[#0A66C2] bg-white hover:bg-blue-50'}
                    `}
                    onClick={handleJobSave}
                >
                    {clickedSave ? 'Saved' : 'Save'}
                </button>
            </div>
            {/* Modal */}
            {showModal && job.type_apply !== 'external_apply' && (
                <JobApplicationModal
                    jobVacancyId={job.id}
                    onClose={handleCloseModal}
                    onApplied={handleApplied}
                    setHasApplied={setHasApplied}
                    onAlreadyApplied={() => {
                        setHasApplied(true);
                        setApplicationStatus('submitted');
                        setShowModal(false);
                        toast.info('You have already applied to this job');
                    }}
                />
            )}
            {showUnsaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Unsave Job</h3>
                            <p className="text-gray-500 text-center mb-6">Are you sure you want to remove this job from your saved list?</p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowUnsaveModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUnsaveConfirm}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}