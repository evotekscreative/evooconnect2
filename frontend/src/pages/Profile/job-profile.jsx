import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import job1 from '../../assets/img/job1.png';
import { useParams } from "react-router-dom";

export default function NewPage() {
    const params = useParams();
    const jobId = params.jobId;
    const [clickedSave, setClickedSave] = useState(false);
    const [clickedApply, setClickedApply] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);

    // Load saved jobs from localStorage when component mounts
    useEffect(() => {
        const saved = localStorage.getItem('savedJobs');
        if (saved) {
            const parsedSavedJobs = JSON.parse(saved);
            setSavedJobs(parsedSavedJobs);
            // Check if current job is already saved
            if (parsedSavedJobs.some(job => job.id === parseInt(jobId))) {
                setClickedSave(true);
            }
        }
    }, [jobId]);

    const handleSaveClick = () => {
        let updatedSavedJobs;
        if (!clickedSave) {
            // Add job to saved jobs
            updatedSavedJobs = [...savedJobs, job];
            setClickedSave(true);
        } else {
            // Remove job from saved jobs
            updatedSavedJobs = savedJobs.filter(j => j.id !== job.id);
            setClickedSave(false);
        }
        setSavedJobs(updatedSavedJobs);
        localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    };

    const handleApplyClick = () => {
        setClickedApply(true);
    };

    const data = [
        {
            id: 1,
            title: "Software Engineer",
            company: "Angular Company",
            location: "Remote",
            description: "We are looking for a Frontend Developer to join our team.",
            overview: "We are looking for a skilled Software Engineer to develop and maintain our web applications. The ideal candidate will have experience with modern JavaScript frameworks and a passion for creating high-quality code.",
            aplicantRank: 30,
            postedDate: "2023-09-30",
            seniorityLevel: "Director",
            Industry: "Information Technology",
            type: "Full-time",
            jobFunction: "Engineering",
            salary: "$60,000 - $80,000",
            companyLogo: "https://via.placeholder.com/150",
            companyDescription: "Angular Company is a leading tech company specializing in web development.",
            companySize: "100-500 employees",
        },
        {
            id: 2,
            title: "Frontend Developer",
            company: "React Company",
            location: "Remote",
            description: "We are looking for a Frontend Developer to join our team.",
            overview: "Join our team as a Frontend Developer and help build amazing user experiences. You'll work with React, TypeScript, and modern CSS to create responsive and accessible web applications.",
            aplicantRank: 25,
            postedDate: "2023-10-15",
            seniorityLevel: "Mid Level",
            Industry: "Information Technology",
            type: "Full-time",
            jobFunction: "Engineering",
            salary: "$70,000 - $90,000",
            companyLogo: "https://via.placeholder.com/150",
            companyDescription: "React Company is a fast-growing startup focused on creating innovative web solutions.",
            companySize: "50-200 employees",
        }
    ];

    const job = data.find(job => job.id === parseInt(jobId));
    if (!job) {
        return <div>Job not found</div>;
    }

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen py-8">
                <div className="container mx-auto px-4 md:px-6 lg:px-24 xl:px-40">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        {/* Header */}
                        <div className="flex justify-between items-start ">
                            <div>
                                <h1 className="font-bold text-xl">{job.title}</h1>
                                <div className="flex items-center space-x-1">
                                    <a
                                        href="#"
                                        className="text-[#0A66C2] font-semibold text-sm hover:underline"
                                    >
                                        {job.company}
                                    </a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
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
                                >
                                    {clickedApply ? 'Applied' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar */}
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

                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Overview */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                                <hr />
                                <p className="text-sm text-gray-600 mt-3">{job.overview}</p>
                            </div>

                            {/* Job Details */}
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

                            {/* About Us */}
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

                        {/* Right Sidebar */}
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