import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import job1 from '../../assets/img/job1.png';
import { Card, CardContent } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Search } from 'lucide-react';
import { Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import JobCard from "../../components/Jobs/JobCard.jsx";
import CompanyCard from "../../components/Jobs/CompanyCard.jsx";
import RightSidebar from "../../components/Jobs/RightSidebar.jsx";
import PostJobModal from "../../components/Jobs/PostJobModal.jsx";
import CreateCompanyModal from "../../components/Jobs/CreateCompanyModal.jsx";

export default function Jobs() {
    const [showPostAJobModal, setShowPostAJobModal] = useState(false);
    const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [activeTab, setActiveTab] = useState("job");
    const [activeFilter, setActiveFilter] = useState("All");

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

    const [companyForm, setCompanyForm] = useState({
        name: "",
        description: "",
        industry: "",
        location: "",
        employees: "",
        logo: null,
        logoPreview: null,
        website: "",
        companyType: "",
        foundedYear: "",
        specialties: "",
        rating: 4.5
    });

    const [jobs, setJobs] = useState([
        {
            id: 1,
            title: "Software Engineer",
            company: "React Company",
            location: "Remote",
            employmentType: "Full-time",
            description: "We are looking for a Software Engineer to join our team.",
            rating: 4.5,
            postedDate: "2023-09-30",
            seniorityLevel: "Director",
            Industry: "Information Technology",
            type: "Full-time",
            jobFunction: "Engineering",
            salary: "$60,000 - $80,000", 
            companyDescription: "Angular Company is a leading tech company specializing in web development.",
            companySize: "100-500 employees",
            companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
        },
        {
            id: 2,
            title: "Software Engineer",
            company: "React Company",
            location: "Remote",
            employmentType: "Full-time",
            description: "We are looking for a Software Engineer to join our team.",
            rating: 4.5,
            postedDate: "2023-09-30",
            seniorityLevel: "Director",
            Industry: "Information Technology",
            type: "Full-time",
            jobFunction: "Engineering",
            salary: "$60,000 - $80,000",
            companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
            companyDescription: "Angular Company is a leading tech company specializing in web development.",
            companySize: "100-500 employees",
        }
    ]);

    const [companies, setCompanies] = useState([
        {
            id: 1,
            name: "EvoConnect",
            description: "A leading tech company specializing in innovative solutions",
            industry: "Information Technology",
            location: "Yogyakarta, Indonesia",
            employees: "100-500",
            logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
            rating: 4.5,
            jobs: 15
        },
        {
            id: 2,
            name: "Tech Innovators",
            description: "Pioneering the future of technology",
            industry: "Software Development",
            location: "Jakarta, Indonesia",
            employees: "50-200",
            logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
            rating: 4.2,
            jobs: 8
        }
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCompanyInputChange = (e) => {
        const { name, value } = e.target;
        setCompanyForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const handleLogoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileReader = new FileReader();

            fileReader.onload = (event) => {
                setCompanyForm(prev => ({
                    ...prev,
                    logo: file,
                    logoPreview: event.target.result
                }));
            };

            fileReader.readAsDataURL(file);
        }
    };

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

        setJobs(prev => [newJob, ...prev]);

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

        setShowPostAJobModal(false);
        toast.success("Job posted successfully!");
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();

        const newCompany = {
            id: companies.length + 1,
            name: companyForm.name,
            description: companyForm.description,
            industry: companyForm.industry,
            location: companyForm.location,
            employees: companyForm.employees,
            logo: companyForm.logoPreview || "https://cdn-icons-png.flaticon.com/512/174/174857.png",
            rating: parseFloat(companyForm.rating),
            jobs: 0,
            website: companyForm.website,
            companyType: companyForm.companyType,
            foundedYear: companyForm.foundedYear,
            specialties: companyForm.specialties
        };

        setCompanies(prev => [newCompany, ...prev]);

        setCompanyForm({
            name: "",
            description: "",
            industry: "",
            location: "",
            employees: "",
            logo: null,
            logoPreview: null,
            website: "",
            companyType: "",
            foundedYear: "",
            specialties: "",
            rating: 4.5
        });

        setShowCreateCompanyModal(false);
        toast.success("Company created successfully!");
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <Navbar />
            <div className="bg-[#eef3f8] min-h-screen px-4 lg:px-32 py-6 grid grid-cols-12 gap-6">
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

                <div className="col-span-12 lg:col-span-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <Input
                                placeholder={activeTab === "job" ? "Search jobs" : "Search companies"}
                                className="flex-grow border-none focus:outline-none focus:ring-0 focus:border-transparent px-4 py-2 text-sm"
                            />
                            <Search size={20} className="ml-2 mr-2" />
                        </div>

                        <div className="mt-4 flex space-x-6 text-sm font-medium border-b border-gray-200 pb-2">
                            <button
                                onClick={() => setActiveTab("job")}
                                className={`${activeTab === "job" ? "text-[#0A66C2] border-b-2 border-[#0A66C2]" : "text-gray-500 hover:text-[#0A66C2]"} pb-1`}
                            >
                                Job
                            </button>
                            <button
                                onClick={() => setActiveTab("company")}
                                className={`${activeTab === "company" ? "text-[#0A66C2] border-b-2 border-[#0A66C2]" : "text-gray-500 hover:text-[#0A66C2]"} pb-1`}
                            >
                                Company
                            </button>
                        </div>

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

                        {activeTab === "job" ? (
                            <div className="mt-6 space-y-4">
                                {jobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {companies.map((company) => (
                                    <CompanyCard key={company.id} company={company} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <RightSidebar activeTab={activeTab} />
            </div>

            <PostJobModal 
                showModal={showPostAJobModal}
                setShowModal={setShowPostAJobModal}
                jobForm={jobForm}
                handleInputChange={handleInputChange}
                handlePhotoUpload={handlePhotoUpload}
                handleJobSubmit={handleJobSubmit}
            />

            <CreateCompanyModal 
                showModal={showCreateCompanyModal}
                setShowModal={setShowCreateCompanyModal}
                companyForm={companyForm}
                handleCompanyInputChange={handleCompanyInputChange}
                handleLogoUpload={handleLogoUpload}
                handleCompanySubmit={handleCompanySubmit}
            />
        </>
    );
}