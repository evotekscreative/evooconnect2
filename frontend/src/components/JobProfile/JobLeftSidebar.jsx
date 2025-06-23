import React from 'react';
import job1 from '../../assets/img/job1.png';

export default function JobLeftSidebar({ job }) {
    return (
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center shadow-lg">
                <img
                    src={'baseUrl' in job.company && job.company.logo.startsWith('http') ? job.company.logo : `${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${job.company.logo}`}
                    alt="logo"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <button className="bg-blue-50 text-blue-500 hover:bg-blue-100 text-sm font-medium py-1.5 px-5 rounded-md border border-blue-100 transition mb-4 mt-1">
                    + Follow
                </button>

                <p className="font-semibold text-lg truncate">{job.title}</p>
                <p className="text-xs text-gray-500 mb-4 line-clamp-3">{job.description}</p>
                <hr className="my-4" />
                <div className="text-xs text-gray-500 space-y-1 text-left">
                    <div className="flex justify-between mb-2">
                        <span>Posted</span>
                        <span className="font-semibold text-black truncate">{Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24)) || 0} days ago</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Job Type</span>
                        <span className="font-semibold text-black truncate">{job.job_type}</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">Photos</p>
                    <a href="#" className="text-[#0A66C2] text-xs hover:underline">
                        See All &gt;
                    </a>
                </div>
            </div>
        </div>
    );
}