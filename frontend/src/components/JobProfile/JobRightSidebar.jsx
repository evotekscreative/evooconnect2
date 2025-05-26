import React from 'react';

export default function JobRightSidebar() {
    return (
        <div className="lg:col-span-1 space-y-6">
            <button className="w-full bg-red-500 text-white py-2 rounded font-medium text-sm hover:bg-red-600 transition flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell">
                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                Set alert for jobs
            </button>

            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                <p className="font-semibold text-sm mb-2">Similar Jobs</p>
                <div className="space-y-2">
                    <div className="border border-gray-200 p-3 rounded-lg hover:shadow-md transition">
                        <div className="flex items-start space-x-3 mb-1">
                            <img
                                src="https://via.placeholder.com/32"
                                alt="Company Logo"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-semibold text-sm">Product Director</p>
                                <p className="text-xs text-[#0A66C2]">Spotify Inc.</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs mt-2 space-x-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                            >
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <p>India, Punjab</p>
                        </div>

                        <hr className="my-4" />
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <img
                                        key={i}
                                        src="https://via.placeholder.com/20"
                                        className="w-6 h-6 rounded-full border"
                                        alt={`User ${i + 1}`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-600">18 connections</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Posted 3 days ago</p>
                    </div>
                </div>
            </div>
        </div>
    );
}