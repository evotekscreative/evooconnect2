import React, { useState } from 'react';
import JobApplicationModal from '../../components/ApplicantRequest/JobApplicationModal.jsx';
import { toast } from 'sonner';

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

export default function JobHeader({ job, clickedSave, handleSaveClick }) {
    const [showModal, setShowModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(job.has_applied || false);
    const [applicationStatus, setApplicationStatus] = useState(job.application_status || null);
    const handleJobSave = async () => {
        const result = await saveJob(job.id);
        
        if (result.success) {
            toast.success('Job saved successfully!');
            handleSaveClick();
        } else {
            toast.error(result.error || 'Failed to save job');
        }
    };


    const handleApplyClick = () => {
        setShowModal(true);
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
        <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="font-bold text-xl">{job.title}</h1>
                        <div className="flex items-center space-x-1">
                            <a
                                href="#"
                                className="text-[#0A66C2] font-semibold text-sm hover:underline"
                            >
                                {job.company?.name || job.company}
                            </a>
                            <p className="text-gray-500 text-xs">{job.location} | posted {job.postedDate}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className={`px-5 py-1 text-sm rounded border ${clickedSave ? 'bg-green-500 text-white' : 'border-[#0A66C2] text-[#0A66C2] bg-white'} transition`}
                            onClick={handleJobSave}
                        >
                            {clickedSave ? 'Saved' : 'Save'}
                        </button>
                        <button
                            onClick={handleApplyClick}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                applicationStatus === 'submitted'
                                    ? 'bg-yellow-500 text-white cursor-not-allowed'
                                    : hasApplied
                                    ? 'bg-green-500 text-white cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-blue-400'
                            }`}
                            disabled={hasApplied}
                        >
                            {applicationStatus === 'submitted' ? 'Submitted' : hasApplied ? 'Applied' : 'Apply for Job'}
                        </button>

                        {showModal && (
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
                    </div>
                </div>
            </div>
        </>
    );
}