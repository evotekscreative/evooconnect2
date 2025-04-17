import React from "react";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/Button";
import job1 from '../../assets/img/job1.png';
// import { MapPin } from 'lucide-react';

export default function NewPage() {
    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen py-8">
                <div className="container mx-auto px-4 md:px-6 lg:px-24 xl:px-40">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        {/* Header */}
                        <div className="flex justify-between items-start ">
                            <div>
                                <h1 className="font-bold text-xl">Hallo</h1>
                                <div class="flex items-center space-x-1">
                                    <a
                                        href="#"
                                        class="text-[#0A66C2] font-semibold text-sm hover:underline"
                                    >
                                        React Company
                                    </a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#383838" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>                                    <p class="text-gray-500 text-xs">mm · 11 hours ago</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-5 py-1 text-sm rounded border border-[#0A66C2] text-[#0A66C2] bg-white hover:bg-blue-50 transition">
                                    Save
                                </button>
                                <Button className="px-5 py-1 text-sm rounded bg-[#0A66C2] text-white hover:bg-blue-700 transition">
                                    Apply
                                </Button>
                            </div>

                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                                <img
                                    src={job1}
                                    alt="Company Logo"
                                    className="w-40 h-40 rounded-full mx-auto mb-3 object-cover"
                                />

                                <button className="bg-blue-50 text-blue-500 hover:bg-blue-100 text-sm font-medium py-1.5 px-5 rounded-md border border-blue-100 transition mb-4 mt-1">
                                    + Follow
                                </button>

                                <p className="font-semibold text-lg">React Company</p>
                                <p className="text-xs text-gray-500 mb-4">mm</p>
                                <hr className="my-4" />
                                <div className="text-xs text-gray-500 space-y-1 text-left">
                                    <div className="flex justify-between mb-2">
                                        <span>Posted</span>
                                        <span className="font-semibold text-black">11 hours ago</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Applicant Rank</span>
                                        <span className="font-semibold text-black">25</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-sm">Photos</p>
                                    <a href="#" className="text-[#0A66C2] text-xs hover:underline">
                                        See All &gt;
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Overview */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                                <hr></hr>
                                <p className="text-sm text-gray-600 mt-3">mmm</p>
                            </div>

                            {/* Job Details */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold mb-5">Job Details</h2>

                                <div className="grid grid-cols-1 gap-y-2 text-sm text-gray-600 mt-2">
                                    <p>
                                        <span className="font-semibold text-gray-800">Seniority Level:</span> Entry level
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        <span className="font-semibold text-gray-800">Industry:</span> Internet Information Technology & Services
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        <span className="font-semibold text-gray-800">Employment Type:</span> Part-time
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        <span className="font-semibold text-gray-800">Job Functions:</span> Marketing
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        <span className="font-semibold text-gray-800">Salary:</span> Rp 9.999
                                    </p>
                                </div>
                            </div>

                            <hr className="my-4 border-gray-200" />

                            {/* About Us */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center mb-3">
                                    <img
                                        src={job1}
                                        alt="React Company"
                                        className="w-14 h-14 rounded-full mr-2 object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm">React Company</p>
                                        <p className="text-xs text-gray-400">Informatika | 24,044 followers</p>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold mb-2">About us</h2>
                                <p className="text-sm text-gray-600 mb-3">
                                    Welcome! We’re so happy you found us. Since you’ve come this far, we’d love to take
                                    the opportunity to introduce ourselves.
                                    <br /><br />
                                    Our story starts in 2006 with three founders in a Sydney garage (no, we’re not kidding).
                                    Born from a desire to earn a living doing what they loved, with the flexibility to
                                    do it from anywhere, Envato set out to create an online community for buying and
                                    selling creative digital assets. Nearly 13 years later, we’re profitable and still totally
                                    bootstrapped...
                                </p>
                                <hr className="my-4" />
                                <div className="text-center">
                                    <a href="#" className="text-[#0A66C2] text-sm font-normal hover:underline">
                                        READ MORE
                                    </a>
                                </div>

                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <button className="w-full bg-red-500 text-white py-2 rounded font-medium text-sm hover:bg-red-600 transition flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell">
                                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                                </svg>
                                Set alert for jobs
                            </button>


                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
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
                                        <div className="flex items-center text-gray-500 text-xs mt-2">
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
                    </div>
                </div>
            </div>
        </>
    );
}
