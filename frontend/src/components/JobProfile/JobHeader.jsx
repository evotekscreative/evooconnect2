import React, { useState } from 'react';
import JobApplicationModal from '../../components/ApplicantRequest/JobApplicationModal.jsx';

export default function JobHeader({ job, clickedSave, handleSaveClick }) {
    const [showModal, setShowModal] = useState(false);

    const handleApplyClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
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
                                {job.company}
                            </a>
                            <p className="text-gray-500 text-xs">{job.location} | posted {job.postedDate}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className={`px-5 py-1 text-sm rounded border ${clickedSave ? 'bg-green-500 text-white' : 'border-[#0A66C2] text-[#0A66C2] bg-white'} transition`}
                            onClick={handleSaveClick}
                        >
                            {clickedSave ? 'Saved' : 'Save'}
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-400 transition-colors"
                        >
                            Apply for Job
                        </button>

                        {showModal && (
                            <JobApplicationModal onClose={() => setShowModal(false)} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {/* {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Apply for {job.title}</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                            </button>
                        </div>
                        <ContactInfo job={job} onClose={handleCloseModal} />
                    </div>
                </div>
            )} */}
        </>
    );
}