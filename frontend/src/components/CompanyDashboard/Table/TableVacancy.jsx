import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Trash2,
  Edit,
  Eye,
  X,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle,
  Star,
  Home,
  Calendar,
  CheckSquare,
  Code,
  Gift,
} from "lucide-react";
import SimpleApply from "../../../components/CompanyDashboard/PostVacancy/SimpleApply.jsx";
import axios from "axios";

// import gambar
import bootstrapImg from "../../../assets/img/imgAdmin/bootstrap.jpg";
import angularImg from "../../../assets/img/imgAdmin/angular.jpg";
import sketchImg from "../../../assets/img/imgAdmin/sketch.jpg";
import reactImg from "../../../assets/img/imgAdmin/react.jpg";
import vueImg from "../../../assets/img/imgAdmin/vue.jpg";

import team1 from "../../../assets/img/imgAdmin/team-1-800x800.jpg";
import team2 from "../../../assets/img/imgAdmin/team-2-800x800.jpg";
import team3 from "../../../assets/img/imgAdmin/team-3-800x800.jpg";
import team4 from "../../../assets/img/imgAdmin/team-4-470x470.png";

export default function TableVacancy({ color }) {
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const isLight = color === "light";
  const { company_id } = useParams();
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/companies/${company_id}/jobs?limit=10&offset=0&status=active`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.data?.data?.jobs) {
        setJobs(response.data.data.jobs);
      }

      console.log("Fetched company jobs:", response.data.data.jobs);
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const headerClass =
    "px-6 py-3 text-xs uppercase font-semibold text-left border-b";
  const lightHeader = "bg-gray-100 text-gray-500 border-gray-200";
  const darkHeader = "bg-sky-800 text-sky-200 border-sky-700";

  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";
  const badgeColors = {
    active: "text-green-500",
    pending: "text-orange-500",
    closed: "text-red-500",
    draft: "text-sky-500",
  };

  const handleSubmitVacancy = async (jobData) => {
    try {
      // If we have a successful job submission with data from the API
      if (jobData && jobData.id) {
        // Add the new job to the jobs list without needing to refetch
        setJobs((prevJobs) => [jobData, ...prevJobs]);
      } else {
        // If no job data returned, refresh the job list from API
        await fetchCompanyJobs();
      }
    } catch (error) {
      console.error("Error handling job vacancy submission:", error);
      await fetchCompanyJobs();
    }
  };

  // Format salary range for display
  const formatSalary = (min, max, currency) => {
    if (!min && !max) return "Negotiable";
    if (min && !max) return `${currency} ${min.toLocaleString()}+`;
    if (!min && max) return `Up to ${currency} ${max.toLocaleString()}`;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  // Add this function after the fetchCompanyJobs function
  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job vacancy?")) {
      return;
    }

    try {
      const userToken = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/job-vacancies/${jobId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      // Remove the job from the state
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job vacancy:", error);
      alert("Failed to delete job vacancy. Please try again.");
    }
  };

  const handleViewJobDetails = async (jobId) => {
    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/api/job-vacancies/${jobId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data?.data) {
        setSelectedJob(response.data.data);
        setShowJobDetailsModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    }
  };

  // Add this JobDetailsModal component
  // Add this JobDetailsModal component
const JobDetailsModal = ({ job, onClose }) => {
  if (!job) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b">
          <h3 className="text-2xl font-bold">Job Details</h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black rounded-full p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Job Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <Briefcase size={18} className="mr-2" />
                  <h4 className="font-semibold">Job Title</h4>
                </div>
                <p className="font-medium">{job.title}</p>
              </div>

              <div className="rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <MapPin size={18} className="mr-2" />
                  <h4 className="font-semibold">Location</h4>
                </div>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>

            {/* Salary Highlight */}
            <div className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Salary Range</h4>
                  <p className="text-2xl font-bold">
                    {formatSalary(job.min_salary, job.max_salary, job.currency)}
                  </p>
                </div>
                <div className="rounded-full p-3 border">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            {/* Experience Level & Job Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <Briefcase size={18} className="mr-2" />
                  <h4 className="font-semibold">Experience Level</h4>
                </div>
                <p className="font-medium">{job.experience_level}</p>
              </div>

              <div className="rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <Clock size={18} className="mr-2" />
                  <h4 className="font-semibold">Job Type</h4>
                </div>
                <p className="font-medium">{job.job_type}</p>
              </div>
            </div>

            {/* Work Type & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <Home size={18} className="mr-2" />
                  <h4 className="font-semibold">Work Type</h4>
                </div>
                <p className="font-medium">{job.work_type || "Not specified"}</p>
              </div>

              <div className="rounded-xl p-4 border">
                <div className="flex items-center mb-2">
                  <Calendar size={18} className="mr-2" />
                  <h4 className="font-semibold">Application Deadline</h4>
                </div>
                <p className="font-medium">{formatDate(job.application_deadline)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="border rounded-xl p-5">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <FileText size={20} className="mr-2" />
                Job Description
              </h4>
              <p className="leading-relaxed break-words whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="border rounded-xl p-5">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <CheckSquare size={20} className="mr-2" />
                Requirements
              </h4>
              <p className="leading-relaxed break-words whitespace-pre-line">
                {job.requirements}
              </p>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="border rounded-xl p-5">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Code size={20} className="mr-2" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="border px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="border rounded-xl p-5">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Gift size={20} className="mr-2" />
                  Benefits
                </h4>
                <p className="leading-relaxed break-words whitespace-pre-line">
                  {job.benefits}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


  return (
    <div className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}>
      {/* Modal Component */}
      <SimpleApply
        showModal={showModal}
        setShowModal={setShowModal}
        onSubmit={handleSubmitVacancy}
      />

      <div className="rounded-t mb-0 px-4 py-3 border-b border-sky-700 bg-sky-800">
        <div className="flex flex-wrap items-center">
          <div className="w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-white">Job Vacancies</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-sky-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-sky-100 transition duration-200"
          >
            Post Vacancy
          </button>
        </div>
      </div>

      <div className="block w-full overflow-x-auto">
        {loading ? (
          <div className="text-center py-4">Loading job vacancies...</div>
        ) : (
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                {["Job Title", "Salary", "Status", "Skills", "Action", ""].map(
                  (title, idx) => (
                    <th
                      key={idx}
                      className={`${headerClass} ${
                        isLight ? lightHeader : darkHeader
                      }`}
                    >
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <th
                      className={`border-t ${borderColor} px-6 py-4 text-xs text-left flex items-center`}
                    >
                      <img
                        src={`${apiUrl}/${job.company?.logo}`}
                        className="h-12 w-12 bg-white rounded-full border object-cover"
                        alt={job.company?.name || job.title}
                        onError={(e) => {}}
                      />

                      <div className="ml-3">
                        <span className={`font-bold ${textColor} block`}>
                          {job.title}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {job.location}
                        </span>
                      </div>
                    </th>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      {formatSalary(
                        job.min_salary,
                        job.max_salary,
                        job.currency
                      )}
                    </td>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      <i
                        className={`fas fa-circle mr-2 ${
                          badgeColors[job.status]
                        }`}
                      ></i>{" "}
                      {job.status}
                    </td>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      <div className="flex flex-wrap gap-1">
                        {job.skills &&
                          job.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewJobDetails(job.id)}
                          className="p-1 rounded hover:bg-gray-100 text-primary"
                        >
                          <FileText size={18} />
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1 rounded hover:bg-gray-100 text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    <td className={`border-t ${borderColor} text-xs`}>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/company-dashboard/list-applicants/${job.id}`}
                        >
                          <button className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 font-medium text-sm">
                            View applicants
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 border-t">
                    No job vacancies found. Click "Post Vacancy" to create one.
                  </td>
                </tr>
              )}
            </tbody>
            {showJobDetailsModal && (
              <JobDetailsModal
                job={selectedJob}
                onClose={() => setShowJobDetailsModal(false)}
              />
            )}
          </table>
        )}
      </div>
    </div>
  );
}

TableVacancy.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};

TableVacancy.defaultProps = {
  color: "light",
};
