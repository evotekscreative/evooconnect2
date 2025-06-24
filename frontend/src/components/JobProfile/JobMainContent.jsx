import React from 'react';
import JobHeader from './JobHeader.jsx';

export default function JobMainContent({ job, clickedSave, handleSaveClick }) {
    if (!job) return null;

    return (
        <div className="lg:col-span-2 space-y-4 w-full max-w-3xl mx-auto">
            {/* Header */}
            <JobHeader job={job} clickedSave={clickedSave} handleSaveClick={handleSaveClick} />

            {/* Kotak besar: Overview/Detail Lowongan */}
            <div className="bg-white p-6 rounded-lg shadow mt-2">
                <h2 className="text-xl font-semibold mb-2">Detail Lowongan</h2>
                <hr />
                <div className="text-sm text-gray-600 mt-3 break-words whitespace-pre-line">
                    {job.description}
                </div>
                {/* Requirements */}
                {job.requirements && (
                    <>
                        <h3 className="text-lg font-semibold mt-6 mb-2">Requirements</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-line break-words mb-2">
                            {job.requirements}
                        </div>
                    </>
                )}
                {/* What We Offer */}
                {job.benefits && (
                    <>
                        <h3 className="text-lg font-semibold mt-6 mb-2">What We Offer</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-line break-words">
                            {job.benefits}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}