import React from 'react';
import job1 from '../../assets/img/job1.png';

export default function JobMainContent({ job }) {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <hr />
                <p className="text-sm text-gray-600 mt-3">{job.overview}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-5">Job Details</h2>

                <div className="grid grid-cols-1 gap-y-2 text-sm text-gray-600 mt-2">
                    <p>
                        <span className="font-semibold text-gray-800">Seniority Level:</span> {job.seniorityLevel}
                    </p>
                    <hr className="my-2" />
                    <p>
                        <span className="font-semibold text-gray-800">Industry:</span> {job.Industry}
                    </p>
                    <hr className="my-2" />
                    <p>
                        <span className="font-semibold text-gray-800">Employment Type:</span> {job.type}
                    </p>
                    <hr className="my-2" />
                    <p>
                        <span className="font-semibold text-gray-800">Job Functions:</span> {job.jobFunction}
                    </p>
                    <hr className="my-2" />
                    <p>
                        <span className="font-semibold text-gray-800">Salary:</span> {job.salary}
                    </p>
                </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <div className="flex items-center mb-3">
                    <img
                        src={job1}
                        alt="React Company"
                        className="w-14 h-14 rounded-full mr-2 object-cover"
                    />
                    <div>
                        <p className="font-semibold text-sm">{job.company}</p>
                        <p className="text-xs text-gray-400">{job.Industry} | {job.companySize}</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-2">About us</h2>
                <p className="text-sm text-gray-600 mb-3">
                   {job.companyDescription}
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