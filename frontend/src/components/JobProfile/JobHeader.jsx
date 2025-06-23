import React from 'react';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const applyToJob = async (jobVacancyId, applicationData) => {
    try {
        const response = await fetch(`${BASE_URL}/api/job-applications/${jobVacancyId}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: applicationData
        });
        
        const data = await response.json();
        
        if (data.code === 201) {
            return { success: true, data: data.data };
        } else {
            return { success: false, error: data.message || 'Application failed' };
        }
    } catch (error) {
        return { success: false, error: 'Network error occurred' };
    }
};

export default function JobHeader({ job, clickedSave, clickedApply, handleSaveClick, handleApplyClick }) {
    const handleJobApplication = async () => {
        const applicationData = {
            contact_info: {
                phone: "+6281234567890",
                email: "john.doe@email.com",
                address: "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190",
                linkedin: "https://linkedin.com/in/johndoe"
            },
            motivation_letter: "I am writing to express my strong interest in this position. With my experience and passion for the field, I believe I would be a valuable addition to your team.",
            cover_letter: "Dear Hiring Manager,\n\nI am excited to apply for this position. I would welcome the opportunity to discuss how my skills and experience can contribute to your team's success.\n\nThank you for considering my application.\n\nBest regards",
            expected_salary: 20000000
        };
        
        const result = await applyToJob(job.id, applicationData);
        
        if (result.success) {
            toast.success('Application submitted successfully!');
            handleApplyClick();
        } else {
            toast.error(result.error || 'Failed to submit application');
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-xl truncate">{job.title}</h1>
                    <div className="flex items-center space-x-1 flex-wrap">
                        <a
                            href="#"
                            className="text-[#0A66C2] font-semibold text-sm hover:underline truncate"
                        >
                            {job.company?.name || job.company}
                        </a>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-icon lucide-map-pin flex-shrink-0">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p className="text-gray-500 text-xs truncate">{job.location} | posted {Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24)) || 0} days ago</p>
                    </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                    <button
                        className={`px-5 py-1 text-sm rounded border ${clickedSave ? 'bg-green-500 text-white' : 'border-[#0A66C2] text-[#0A66C2] bg-white'} transition`}
                        onClick={handleSaveClick}
                    >
                        {clickedSave ? 'Saved' : 'Save'}
                    </button>
                    <button
                        className={`bg-blue-500 text-white text-sm py-2 px-4 rounded-md ${clickedApply ? 'bg-green-500' : ''}`}
                        onClick={handleJobApplication}
                        disabled={clickedApply}
                    >
                        {clickedApply ? 'Applied' : 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
}