import React from 'react';

export default function JobHeader({ job, clickedSave, clickedApply, handleSaveClick, handleApplyClick }) {
    return (
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-icon lucide-map-pin">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
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
                        className={`bg-blue-500 text-white text-sm py-2 px-4 rounded-md ${clickedApply ? 'bg-green-500' : ''}`}
                        onClick={handleApplyClick}
                        disabled={clickedApply}
                    >
                        {clickedApply ? 'Applied' : 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
}