import React from 'react';
import job1 from '../../assets/img/job1.png';

export default function JobLeftSidebar({ job }) {
    return (
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center shadow-lg">
                <img
                    src={job1}
                    alt="Company Logo"
                    className="w-40 h-40 rounded-full mx-auto mb-3 object-cover"
                />
                <button className="bg-blue-50 text-blue-500 hover:bg-blue-100 text-sm font-medium py-1.5 px-5 rounded-md border border-blue-100 transition mb-4 mt-1">
                    + Follow
                </button>

                <p className="font-semibold text-lg">{job.title}</p>
                <p className="text-xs text-gray-500 mb-4">{job.overview}</p>
                <hr className="my-4" />
                <div className="text-xs text-gray-500 space-y-1 text-left">
                    <div className="flex justify-between mb-2">
                        <span>Posted</span>
                        <span className="font-semibold text-black">{job.postedDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Applicant Rank</span>
                        <span className="font-semibold text-black">{job.aplicantRank}</span>
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