import React, { useState, useEffect } from "react";
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

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function Jobs() {
    const [showPostAJobModal, setShowPostAJobModal] = useState(false);
    const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [activeTab, setActiveTab] = useState("job");
    const [activeFilter, setActiveFilter] = useState("All");
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [showAllCompanies, setShowAllCompanies] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [jobsPagination, setJobsPagination] = useState({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0
    });

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

    useEffect(() => {
        async function fetchCompanies() {
            setLoadingCompanies(true);
            try {
                const res = await fetch(
                    `${BASE_URL}/api/companies?limit=10&offset=0&search=&industry=&size=&type=&location=&is_verified=`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                const data = await res.json();
                setCompanies(data?.data?.companies || []);
            } catch (err) {
                setCompanies([]);
            }
            setLoadingCompanies(false);
        }

        async function fetchJobs() {
            setLoadingJobs(true);
            try {
                const res = await fetch(
                    `${BASE_URL}/api/jobs/active?page=${jobsPagination.page}&limit=${jobsPagination.limit}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                const data = await res.json();
                if (data.code === 200) {
                    setJobs(data.data.jobs || []);
                    setJobsPagination(prev => ({
                        ...prev,
                        totalCount: data.data.total_count,
                        totalPages: data.data.total_pages,
                        page: data.data.page
                    }));
                }
            } catch (err) {
                setJobs([]);
            }
            setLoadingJobs(false);
        }

        fetchCompanies();
        fetchJobs();
    }, [jobsPagination.page, jobsPagination.limit]);

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
                            <Link to="/create-company">
                                <Button className="bg-[#0A66C2] hover:bg-blue-700 text-white px-4 py-1 text-sm rounded w-full">
                                    Create Company
                                </Button>
                            </Link>
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

                        {activeTab === "job" ? (
                            <div className="mt-6 space-y-4">
                                {loadingJobs ? (
                                    <div>Loading jobs...</div>
                                ) : !jobs.length ? (
                                    <div>No jobs found.</div>
                                ) : (
                                    jobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {loadingCompanies ? (
                                    <div>Loading companies...</div>
                                ) : !companies.length ? (
                                    <div>No companies found.</div>
                                ) : (
                                    <>
                                        {(showAllCompanies ? companies : companies.slice(0, 3)).map((company) => (
                                            <CompanyCard key={company.id} company={company} />
                                        ))}
                                        {companies.length > 3 && !showAllCompanies && (
                                            <button
                                                className="mt-2 px-4 py-2 bg-[#0A66C2] text-white rounded hover:bg-blue-700 w-full"
                                                onClick={() => setShowAllCompanies(true)}
                                            >
                                                View All
                                            </button>
                                        )}
                                        {showAllCompanies && (
                                            <button
                                                className="mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 w-full"
                                                onClick={() => setShowAllCompanies(false)}
                                            >
                                                Close
                                            </button>
                                        )}
                                    </>
                                )}
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