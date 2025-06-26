import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function JobListSidebar({ onSelectJob, selectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/jobs/active?page=1&limit=10`)
      .then(res => res.json())
      .then(data => {
        // Adjust for API response: jobs are in data.data.jobs
        let jobsArr = [];
        if (Array.isArray(data?.data?.jobs)) {
          jobsArr = data.data.jobs;
        }
        setJobs(jobsArr);
      })
      .catch(err => {
        setJobs([]);
        console.error("Error fetching jobs:", err);
      });
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch
  });



  const handleJobClick = (job) => {
    // Ganti URL ke /company-profile/:companyId/:jobId
    navigate(`/jobs/${job.id}`);
    if (onSelectJob) onSelectJob(job);
  };

return (
    <div className="bg-white rounded-xl shadow-md p-4 h-screen min-h-screen w-full flex flex-col">
        {/* Search Bar */}
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
                type="text"
                placeholder="Search jobs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

        {/* Job List */}
        <div className="flex-1 overflow-y-auto space-y-3">
            {filteredJobs.map((job) => (
                <div
                    key={job.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedJobId === job.id
                            ? "bg-blue-50 border-blue-200 shadow-sm"
                            : "hover:bg-gray-50 border-transparent"
                    }`}
                    onClick={() => handleJobClick(job)}
                >
                    <div className="flex items-start gap-3">
                        {/* Company Logo */}
                        {job.company.logo ? (
                            <img
                                src={
                                    'baseUrl' in job.company && job.company.logo.startsWith('http')
                                        ? job.company.logo
                                        : `${BASE_URL}/${job.company.logo}`
                                }
                                alt={job.company.name}
                                className="w-10 h-10 rounded-full object-cover bg-gray-100"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {job.company.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">
                                {job.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-1">{job.company.name}</p>
                            <p className="text-xs text-gray-500 mb-2">{job.location}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>{job.created_at ? dayjs(job.created_at).fromNow() : 'Recently posted'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
}
