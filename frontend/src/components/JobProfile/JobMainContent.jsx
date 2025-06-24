import React from 'react';
import job1 from '../../assets/img/job1.png';

export default function JobMainContent({ job }) {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <hr />
                <p className="text-sm text-gray-600 mt-3 break-words">{job.description}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-5">Job Details</h2>

                <div className="grid grid-cols-1 gap-y-2 text-sm text-gray-600 mt-2">
                    <p className="break-words">
                        <span className="font-semibold text-gray-800">Experience Level:</span> {job.experience_level}
                    </p>
                    <hr className="my-2" />
                    <p className="break-words">
                        <span className="font-semibold text-gray-800">Work Type:</span> {job.work_type}
                    </p>
                    <hr className="my-2" />
                    <p className="break-words">
                        <span className="font-semibold text-gray-800">Employment Type:</span> {job.job_type}
                    </p>
                    <hr className="my-2" />
                    <p className="break-words">
                        <span className="font-semibold text-gray-800">Skills:</span> {job.skills?.join(', ') || 'N/A'}
                    </p>
                    <hr className="my-2" />
                    <p className="break-words">
                        <span className="font-semibold text-gray-800">Salary:</span> {job.currency} {job.min_salary?.toLocaleString()} - {job.max_salary?.toLocaleString()}
                    </p>
                </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className="flex items-center mb-3">
                    <img
                        src={'baseUrl' in job.company && job.company.logo.startsWith('http') ? job.company.logo : `${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${job.company.logo}`}
                        alt="logo"
                        className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{job.company?.name || job.company}</p>
                        <p className="text-xs text-gray-400 truncate">{job.company?.industry || 'N/A'} | {job.company?.location || 'N/A'}</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-2">About us</h2>
                <p className="text-sm text-gray-600 mb-3 break-words">
                    {job.requirements || 'No additional information available.'}
                </p>
                <hr className="my-4" />
                <div className="text-center">
                    <a href="#" className="text-[#0A66C2] text-sm font-normal hover:underline">
                        READ MORE
                    </a>
                </div>
            </div>
        </div>
    );
}