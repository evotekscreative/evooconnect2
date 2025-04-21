import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import job1 from '../../assets/img/job1.png';
import { Card, CardContent } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Search } from 'lucide-react';

export default function Jobs() {
    const [showPostAJobModal, setShowPostAJobModal] = useState(false);
    const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [activeTab, setActiveTab] = useState("job");
    const [activeFilter, setActiveFilter] = useState("All");
    
    // Form state for job posting
    const [jobForm, setJobForm] = useState({
        jobTitle: "",
        position: "",
        location: "",
        salary: "",
        description: "",
        rating: 4.5,
        seniorityLevel: "",
        industry: "",
        employmentType: "Full-time",
        jobFunction: "",
        company: "EvoConnect",
        photo: null,
        photoPreview: null
    });
    
    // Jobs state
    const [jobs, setJobs] = useState([
        {
            id: 1,
            jobTitle: "UI/UX Designer",
            company: "EvoConnect",
            location: "Yogyakarta, Indonesia",
            description: "Design user-friendly interfaces and collaborate with product managers to improve user experience.",
            rating: 4.5,
            employmentType: "Full-time",
            postedDays: 2,
            logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
            photoUrl: null
        }
    ]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle job photo upload
    const handlePhotoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            
            fileReader.onload = (event) => {
                setJobForm(prev => ({
                    ...prev,
                    photo: file,
                    photoPreview: event.target.result
                }));
            };
            
            fileReader.readAsDataURL(file);
        }
    };

    // Handle job submission
    const handleJobSubmit = (e) => {
        e.preventDefault();
        
        const newJob = {
            id: jobs.length + 1,
            jobTitle: jobForm.jobTitle,
            company: jobForm.company,
            location: jobForm.location,
            description: jobForm.description,
            rating: parseFloat(jobForm.rating),
            employmentType: jobForm.employmentType,
            postedDays: 0,
            logo: jobForm.photoPreview || "https://cdn-icons-png.flaticon.com/512/174/174857.png",
            photoUrl: jobForm.photoPreview
        };
        
        // Add new job to the list
        setJobs(prev => [newJob, ...prev]);
        
        // Reset form
        setJobForm({
            jobTitle: "",
            position: "",
            location: "",
            salary: "",
            description: "",
            rating: 4.5,
            seniorityLevel: "",
            industry: "",
            employmentType: "Full-time",
            jobFunction: "",
            company: "EvoConnect",
            photo: null,
            photoPreview: null
        });
        
        // Close modal
        setShowPostAJobModal(false);
    };

    return (
        <>
            <Navbar />
            <div className="bg-[#eef3f8] min-h-screen px-4 lg:px-32 py-6 grid grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <Card className="shadow-md rounded-xl bg-white">
                        <CardContent className="p-4 text-center">
                            <img
                                src={job1}
                                alt="EVOCONNECT"
                                className="rounded-xl w-full object-cover mb-4"
                            />
                            <h2 className="font-bold text-md mb-1">EVOConnect Solutions</h2>
                            <p className="text-sm text-gray-600 mb-4">Looking for talent?</p>
                            <Button
                                className="bg-[#0A66C2] hover:bg-blue-700 text-white px-4 py-1 text-sm rounded"
                                onClick={() => setShowPostAJobModal(true)}
                            >
                                Post a Job
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md rounded-xl bg-white">
                        <CardContent className="p-4 text-center">
                            <h2 className="font-bold text-md mb-1">Grow Your Business with EVOConnect</h2>
                            <p className="text-sm text-gray-600 mb-4">Expand your team with top talent today!</p>
                            <Button className="bg-[#0A66C2] hover:bg-blue-700 text-white px-4 py-1 text-sm rounded" onClick={() => setShowCreateCompanyModal(true)}>
                                Create Company
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Content */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        {/* Search bar */}
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <Input
                                placeholder="Search jobs..."
                                className="flex-grow border-none focus:outline-none px-4 py-2 text-sm"
                            />
                            <Search size={20} className="ml-2 mr-2" />
                        </div>

                        {/* Tabs */}
                        <div className="mt-4 flex space-x-6 text-sm font-medium border-b border-gray-200 pb-2">
                            <button onClick={() => setActiveTab("job")} className={`${activeTab === "job" ? "text-[#0A66C2] border-b-2 border-[#0A66C2]" : "text-gray-500 hover:text-[#0A66C2]"} pb-1`}>Job</button>
                            <button onClick={() => setActiveTab("company")} className={`${activeTab === "company" ? "text-[#0A66C2] border-b-2 border-[#0A66C2]" : "text-gray-500 hover:text-[#0A66C2]"} pb-1`}>Company</button>
                        </div>

                        {/* Filters */}
                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                            {"All,Engineering,Marketing,Design".split(",").map((label, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveFilter(label)}
                                    className={`px-3 py-1 border rounded-full ${activeFilter === label
                                        ? "bg-gray-200 text-gray-800 border-gray-400"
                                        : "border-[#0A66C2] text-[#0A66C2] hover:bg-[#e6f0fa]"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Job Posts */}
                        <div className="mt-6 space-y-4">
                            {jobs.map((job) => (
                                <div key={job.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-md font-semibold">{job.jobTitle}</h4>
                                            <p className="text-sm text-[#0A66C2]">{job.company}</p>
                                            {/* rating */}
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                {[...Array(Math.floor(job.rating))].map((_, i) => (
                                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 .587l3.668 7.568L24 9.423l-6 5.85 1.416 8.241L12 18.897l-7.416 4.617L6 15.273 0 9.423l8.332-1.268z" />
                                                    </svg>
                                                ))}
                                                {job.rating % 1 > 0 && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 .587l3.668 7.568L24 9.423l-6 5.85 1.416 8.241L12 18.897l-7.416 4.617L6 15.273 0 9.423l8.332-1.268z" />
                                                    </svg>
                                                )}
                                                <span className="ml-1 text-xs text-gray-600">({job.rating})</span>
                                            </div>
                                            <p className="text-sm text-gray-500">{job.location}</p>
                                        </div>
                                        {job.logo ? (
                                            <img 
                                                src={job.logo} 
                                                alt="logo" 
                                                className="w-10 h-10 rounded-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-xs text-gray-500">{job.company.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 text-sm text-gray-600">{job.description}</div>
                                    <div className="mt-3 flex justify-between text-xs text-gray-400">
                                        <span>{job.employmentType}</span>
                                        <span>Posted {job.postedDays} days ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h3 className="font-semibold mb-1">Because you viewed</h3>
                        <p className="text-sm text-gray-500 mb-4">Designer at Google?</p>

                        {[{
                            title: "Product Director",
                            company: "Spotify Inc.",
                            location: "India, Punjab",
                            logo: "https://cdn-icons-png.flaticon.com/512/174/174872.png"
                        }, {
                            title: ".NET Developer",
                            company: "Invision",
                            location: "London, UK",
                            logo: "https://cdn-icons-png.flaticon.com/512/174/174881.png"
                        }].map((job, i) => (
                            <div key={i} className="border border-gray-100 rounded-lg p-3 mb-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{job.title}</p>
                                        <p className="text-sm text-[#0A66C2]">{job.company}</p>
                                        <p className="text-sm text-gray-500">{job.location}</p>
                                    </div>
                                    <img src={job.logo} alt="logo" className="w-6 h-6" />
                                </div>
                                <div className="flex items-center mt-2 space-x-2">
                                    <div className="flex -space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <img key={i} src="https://via.placeholder.com/20" className="rounded-full border" alt="profile" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">18 connections</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Posted 3 Days ago</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-md">
                        <h3 className="font-semibold mb-2">People you might know</h3>
                        <div className="flex items-center space-x-3">
                            <img src="https://via.placeholder.com/40" alt="Profile" className="rounded-full" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Nama</p>
                                <p className="text-xs text-gray-500">Student at Harvard</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Post a Job */}
            {showPostAJobModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => setShowPostAJobModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Post a Job</h2>

                        <form onSubmit={handleJobSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="job-photo" className="block text-sm font-medium text-gray-700 mb-1">Job Photo</label>
                                {jobForm.photoPreview && (
                                    <div className="mb-2">
                                        <img 
                                            src={jobForm.photoPreview}
                                            alt="Job photo preview"
                                            className="w-full h-40 object-cover rounded-lg border border-gray-300"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="job-photo"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#0A66C2] file:text-white hover:file:bg-blue-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <Input 
                                    className="w-full" 
                                    placeholder="Enter Job Title" 
                                    name="jobTitle"
                                    value={jobForm.jobTitle}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <Input 
                                    className="w-full" 
                                    placeholder="Enter Position" 
                                    name="position"
                                    value={jobForm.position}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <Input 
                                    className="w-full" 
                                    placeholder="Enter Location" 
                                    name="location"
                                    value={jobForm.location}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                                <Input 
                                    className="w-full" 
                                    placeholder="Enter Salary" 
                                    name="salary"
                                    value={jobForm.salary}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" 
                                    rows={4} 
                                    placeholder="Enter Job Description"
                                    name="description"
                                    value={jobForm.description}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating 1-5</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    placeholder="Your Rating"
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                    name="rating"
                                    value={jobForm.rating}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <hr className="my-4 border-gray-200" />
                            <h3 className="text-base font-semibold">Job Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                        name="seniorityLevel"
                                        value={jobForm.seniorityLevel}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Seniority Level</option>
                                        <option value="mid-senior-level">Mid-Senior Level</option>
                                        <option value="entry-level">Entry Level</option>
                                        <option value="director">Director</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                        name="industry"
                                        value={jobForm.industry}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Industry</option>
                                        <option value="internet-information">Internet Information Technology & Services</option>
                                        <option value="finance">Finance</option>
                                        <option value="healthcare">Healthcare</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                        name="employmentType"
                                        value={jobForm.employmentType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Employment Type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Functions</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                        name="jobFunction"
                                        value={jobForm.jobFunction}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Job Functions</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Design">Design</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    type="text"
                                    placeholder="Enter Company"
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                    name="company"
                                    value={jobForm.company}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button 
                                    type="button"
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded text-sm" 
                                    onClick={() => setShowPostAJobModal(false)}
                                >
                                    Cancel
                                </button>
                                <Button 
                                    type="submit"
                                    className="bg-[#0A66C2] text-white hover:bg-blue-700"
                                >
                                    Post Job
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Create Company */}
            {showCreateCompanyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => setShowCreateCompanyModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Create Company</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Company Name"
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                                <input
                                    type="file"
                                    id="logo"
                                    name="logo"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#0A66C2] file:text-white hover:file:bg-blue-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                <textarea className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" rows={4} placeholder="Enter Job Description"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                <input
                                    type="text"
                                    placeholder="Enter Industry"
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <textarea className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" rows={2} placeholder="Enter Location"></textarea>
                            </div>

                            {["Website", "Company Size", "Headquarters", "Company Type"].map((label, a) => (
                                <div key={a}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <Input className="w-full" placeholder={"Enter " + label} />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                                <textarea className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" rows={4} placeholder="Enter Company Specialties"></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded text-sm"
                                    onClick={() => setShowCreateCompanyModal(false)}
                                >
                                    Cancel
                                </button>
                                <Button className="bg-[#0A66C2] text-white hover:bg-blue-700">Create</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}