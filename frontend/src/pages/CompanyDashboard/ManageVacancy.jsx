import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import Case from "../../components/Case";
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
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/Sidebar";
import AdminNavbar from "../../components/Admin/Navbars/AdminNavbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import Alert from "../../components/Auth/alert.jsx";
import axios from "axios";

export default function ManageVacancy() {
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { company_id } = useParams();
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState({});
  const [applyMethod, setApplyMethod] = useState("simple");
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    minSalary: "",
    maxSalary: "",
    currency: "USD",
    skills: "",
    benefits: "",
    workType: "",
    applicationDeadline: "",
    externalLink: "",
    companyId: "",
  });

  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    fetchCompanyJobs();
    if (showModal) {
      fetchUserCompanies();
    }
  }, [showModal]);

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/companies/${company_id}/jobs?limit=10&offset=0`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.data?.data?.jobs) {
        setJobs(response.data.data.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/api/my-companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        setCompanies(
          Array.isArray(response.data.data) ? response.data.data : []
        );

        const savedCompanyId = localStorage.getItem("companyId");
        if (
          savedCompanyId &&
          response.data.data.some((company) => company.id === savedCompanyId)
        ) {
          setFormData((prev) => ({ ...prev, companyId: savedCompanyId }));
        } else if (response.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            companyId: response.data.data[0].id,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    setAlert({
      show: true,
      type: "success",
      message: "Job vacancy deleted successfully!",
    });
  };

  const handleDeleteError = () => {
    setAlert({
      show: true,
      type: "error",
      message: "Failed to delete job vacancy. Please try again.",
    });
  };

  const handleAddNewJob = (newJob) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
    setShowModal(false);
    setAlert({
      show: true,
      type: "success",
      message: "Job vacancy posted successfully!",
    });
  };

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return "Negotiable";
    if (min && !max) return `${currency} ${min.toLocaleString()}+`;
    if (!min && max) return `Up to ${currency} ${max.toLocaleString()}`;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const userToken = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/job-vacancies/${jobToDelete}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobToDelete));
      setShowDeleteModal(false);
      setJobToDelete(null);
      handleDeleteSuccess();
    } catch (error) {
      console.error("Failed to delete job vacancy:", error);
      handleDeleteError();
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

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const userToken = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/job-vacancies/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );

      setStatusDropdown((prev) => ({ ...prev, [jobId]: false }));
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const toggleStatusDropdown = (jobId) => {
    setStatusDropdown((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setStatusDropdown({});
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const formatCurrency = (value, currency) => {
    if (value === "" || isNaN(value)) return "";

    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^0-9]/g, ""))
        : value;

    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(numericValue);
    }

    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(numericValue)
      .replace(/[^\d,.]/g, "");
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "companyId") {
      localStorage.setItem("companyId", value);
    }
  }, []);

  const handleSalaryChange = useCallback((e, fieldName) => {
    // Simpan sebagai string, bukan number
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      [fieldName]: rawValue, // string, bukan Number(rawValue)
    }));
  }, []);

  const handleSalaryBlur = useCallback((fieldName) => {
    setFormData((prev) => {
      if (prev[fieldName] !== "") {
        return {
          ...prev,
          [fieldName]: Number(prev[fieldName]),
        };
      }
      return prev;
    });
  }, []);

  // ...existing code...
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyId) {
      alert("Please select a company first");
      return;
    }

    setLoading(true);

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((skill) => skill.trim())
        : [];

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        job_type: formData.jobType,
        experience_level: formData.experienceLevel,
        min_salary:
          formData.minSalary === "" ? null : Number(formData.minSalary),
        max_salary:
          formData.maxSalary === "" ? null : Number(formData.maxSalary),
        currency: formData.currency,
        skills: skillsArray,
        benefits: formData.benefits,
        work_type: formData.workType,
        application_deadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline).toISOString()
          : null,
        type_apply:
          applyMethod === "external" ? "external_apply" : "simple_apply",
        external_link:
          applyMethod === "external" ? formData.externalLink : null,
        status: "active",
      };

      const userToken = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/companies/${formData.companyId}/jobs`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        // Add new job to list
        const newJob = {
          ...response.data.data,
          company: {
            id: formData.companyId,
            name:
              companies.find((c) => c.id === formData.companyId)?.name || "",
            logo:
              companies.find((c) => c.id === formData.companyId)?.logo || "",
          },
        };

        setJobs((prevJobs) => [newJob, ...prevJobs]);

        // Show success alert
        setAlert({
          show: true,
          type: "success",
          message: "Job vacancy posted successfully!",
        });

        // Auto-hide alert after 3 seconds
        setTimeout(() => {
          setAlert((prev) => ({ ...prev, show: false }));
        }, 3000);

        // Reset form
        setFormData({
          title: "",
          description: "",
          requirements: "",
          location: "",
          jobType: "",
          experienceLevel: "",
          minSalary: "",
          maxSalary: "",
          currency: "USD",
          skills: "",
          benefits: "",
          workType: "",
          applicationDeadline: "",
          externalLink: "",
          companyId: "",
        });
      }
    } catch (error) {
      console.error("Error posting job vacancy:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Failed to post job vacancy. Please try again.",
      });
    } finally {
      setLoading(false);
      setShowModal(false); // Pastikan modal selalu tertutup setelah submit
    }
  };

  const DeleteConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-center">
              Delete Job Vacancy
            </h3>
            <p className="mb-6 text-center text-gray-600">
              Are you sure you want to delete this job vacancy? This action
              cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="relative p-6 border-b">
            <h3 className="text-2xl font-bold">Job Details</h3>
            <button
              onClick={onClose}
              className="absolute p-2 text-gray-500 rounded-full top-4 right-4 hover:text-black"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center mb-2">
                    <Briefcase size={18} className="mr-2" />
                    <h4 className="font-semibold">Job Title</h4>
                  </div>
                  <p className="font-medium">{job.title}</p>
                </div>

                <div className="p-4 border rounded-xl">
                  <div className="flex items-center mb-2">
                    <MapPin size={18} className="mr-2" />
                    <h4 className="font-semibold">Location</h4>
                  </div>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>

              <div className="p-4 border rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold">Salary Range</h4>
                    <p className="text-2xl font-bold">
                      {formatSalary(
                        job.min_salary,
                        job.max_salary,
                        job.currency
                      )}
                    </p>
                  </div>
                  <div className="p-3 border rounded-full">
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center mb-2">
                    <Briefcase size={18} className="mr-2" />
                    <h4 className="font-semibold">Experience Level</h4>
                  </div>
                  <p className="font-medium">{job.experience_level}</p>
                </div>

                <div className="p-4 border rounded-xl">
                  <div className="flex items-center mb-2">
                    <Clock size={18} className="mr-2" />
                    <h4 className="font-semibold">Job Type</h4>
                  </div>
                  <p className="font-medium">{job.job_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-xl">
                  <div className="flex items-center mb-2">
                    <Home size={18} className="mr-2" />
                    <h4 className="font-semibold">Work Type</h4>
                  </div>
                  <p className="font-medium">
                    {job.work_type || "Not specified"}
                  </p>
                </div>

                <div className="p-4 border rounded-xl">
                  <div className="flex items-center mb-2">
                    <Calendar size={18} className="mr-2" />
                    <h4 className="font-semibold">Application Deadline</h4>
                  </div>
                  <p className="font-medium">
                    {formatDate(job.application_deadline)}
                  </p>
                </div>
              </div>

              <div className="p-5 border rounded-xl">
                <h4 className="flex items-center mb-3 text-lg font-semibold">
                  <FileText size={20} className="mr-2" />
                  Job Description
                </h4>
                <p className="leading-relaxed break-words whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              <div className="p-5 border rounded-xl">
                <h4 className="flex items-center mb-3 text-lg font-semibold">
                  <CheckSquare size={20} className="mr-2" />
                  Requirements
                </h4>
                <p className="leading-relaxed break-words whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="p-5 border rounded-xl">
                  <h4 className="flex items-center mb-3 text-lg font-semibold">
                    <Code size={20} className="mr-2" />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium border rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.benefits && (
                <div className="p-5 border rounded-xl">
                  <h4 className="flex items-center mb-3 text-lg font-semibold">
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

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Post New Job</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="p-4 mb-6 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span
                    className={`mr-3 font-medium ${
                      applyMethod === "simple"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Simple Apply
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyMethod === "external"}
                      onChange={() =>
                        setApplyMethod(
                          applyMethod === "simple" ? "external" : "simple"
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span
                    className={`ml-3 font-medium ${
                      applyMethod === "external"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    External Link
                  </span>
                </div>
              </div>

              {applyMethod === "external" && (
                <div className="mt-4">
                  <label className="flex items-center mb-2 text-sm font-bold text-gray-700">
                    <ExternalLink className="mr-2" size={16} />
                    Application URL
                  </label>
                  <input
                    type="url"
                    name="externalLink"
                    value={formData.externalLink}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/apply"
                    required={applyMethod === "external"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Candidates will be directed to this URL to apply
                  </p>
                </div>
              )}
            </div>
            <div className="hidden">
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Job Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Location*
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Job Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Requirements*
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Job Type*
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select job type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Experience Level*
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Min Salary
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 text-gray-500 border border-r-0 rounded-l-lg bg-gray-50">
                      {formData.currency}
                    </span>
                    <input
                      type="text"
                      name="minSalary"
                      value={formatCurrency(
                        formData.minSalary,
                        formData.currency
                      )}
                      onChange={(e) => handleSalaryChange(e, "minSalary")}
                      onBlur={() => handleSalaryBlur("minSalary")}
                      className="w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Max Salary
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 text-gray-500 border border-r-0 rounded-l-lg bg-gray-50">
                      {formData.currency}
                    </span>
                    <input
                      type="text"
                      name="maxSalary"
                      value={formatCurrency(
                        formData.maxSalary,
                        formData.currency
                      )}
                      onChange={(e) => handleSalaryChange(e, "maxSalary")}
                      onBlur={() => handleSalaryBlur("maxSalary")}
                      className="w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="IDR">IDR (Rp)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="JavaScript, React, Node.js"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Benefits
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Health insurance, Remote work, Stock options"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Work Type
                  </label>
                  <select
                    name="workType"
                    value={formData.workType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select work type</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="in-office">In-office</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const color = "light";
  const isLight = color === "light";
  const headerClass =
    "px-6 py-3 text-xs uppercase font-semibold text-left border-b";
  const lightHeader = "bg-gray-100 text-gray-500 border-gray-200";
  const darkHeader = "bg-sky-800 text-sky-200 border-sky-700";
  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";
  const badgeColors = {
    active: "text-green-600 bg-green-100",
    pending: "text-orange-600 bg-orange-100",
    closed: "text-red-600 bg-red-100",
    draft: "text-sky-600 bg-sky-100",
  };

  return (
    <>
      <div className="relative md:ml-64 bg-blueGray-100">
        <Case className="py-6" />
        <HeaderStats />
        <Sidebar />
        {alert.show && (
          <div className="fixed z-50 w-full max-w-sm top-4 right-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          </div>
        )}
        <div className="w-full px-4 pt-20 mx-auto -m-32 md:px-10">
          <div className="flex flex-wrap mt-4">
            <div className="w-full px-4 mb-12">
              <div
                className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}
              >
                {showDeleteModal && (
                  <DeleteConfirmationModal
                    onConfirm={handleDeleteJob}
                    onCancel={() => {
                      setShowDeleteModal(false);
                      setJobToDelete(null);
                    }}
                  />
                )}

                <div className="px-4 py-3 mb-0 border-b rounded-t border-sky-700 bg-sky-800">
                  <div className="flex flex-wrap items-center">
                    <div className="flex-1 flex-grow w-full max-w-full px-4">
                      <h3 className="text-lg font-semibold text-white">
                        Job Vacancies
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-4 py-2 font-semibold transition duration-200 bg-white rounded-lg shadow text-sky-800 hover:bg-sky-100"
                    >
                      Post Vacancy
                    </button>
                  </div>
                </div>

                <div className="block w-full overflow-x-auto">
                  {loading ? (
                    <div className="py-4 text-center">
                      Loading job vacancies...
                    </div>
                  ) : (
                    <table className="items-center w-full bg-transparent border-collapse">
                      <thead>
                        <tr>
                          {[
                            "Job Title",
                            "Salary",
                            "Status",
                            "Type Apply",
                            "Action",
                            "",
                          ].map((title, idx) => (
                            <th
                              key={idx}
                              className={`${headerClass} ${
                                isLight ? lightHeader : darkHeader
                              }`}
                            >
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr
                              key={job.id}
                              className="transition duration-200 bg-white hover:bg-gray-50"
                            >
                              <td
                                className={`border-t ${borderColor} align-top`}
                              >
                                <div className="flex items-start px-6 py-4">
                                  <img
                                    src={`${apiUrl}/${job.company?.logo}`}
                                    className="flex-shrink-0 object-cover w-12 h-12 bg-white border rounded-full"
                                    alt={job.company?.name || job.title}
                                    onError={(e) => {}}
                                  />
                                  <div className="min-w-0 ml-3">
                                    <p
                                      className={`font-bold ${textColor} truncate`}
                                    >
                                      {job.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {job.location}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs whitespace-nowrap`}
                              >
                                {formatSalary(
                                  job.min_salary,
                                  job.max_salary,
                                  job.currency
                                )}
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs`}
                              >
                                <div className="relative flex items-center">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                      badgeColors[job.status]
                                    }`}
                                  >
                                    {job.status}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleStatusDropdown(job.id);
                                    }}
                                    className="flex-shrink-0 p-1 ml-2 rounded hover:bg-gray-100"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  {statusDropdown[job.id] && (
                                    <div
                                      className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50 min-w-[120px]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(job.id, "active");
                                        }}
                                        className="block w-full px-3 py-2 text-xs text-left hover:bg-gray-100"
                                      >
                                        Active
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(job.id, "closed");
                                        }}
                                        className="block w-full px-3 py-2 text-xs text-left hover:bg-gray-100"
                                      >
                                        Closed
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs`}
                              >
                                <span className="capitalize">
                                  {job.type_apply || "simple"}
                                </span>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs whitespace-nowrap`}
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewJobDetails(job.id)}
                                    className="p-1 rounded hover:bg-gray-100 text-primary"
                                  >
                                    <FileText size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(job.id)}
                                    className="p-1 text-red-600 rounded hover:bg-gray-100"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                              <td
                                className={`border-t ${borderColor} px-6 py-4 align-top text-xs whitespace-nowrap`}
                              >
                                <Link
                                  to={`/company-dashboard/list-applicants/${job.id}`}
                                  className="px-3 py-2 text-sm font-medium text-blue-600 rounded hover:bg-gray-100"
                                >
                                  View applicants
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="py-4 text-center border-t"
                            >
                              No job vacancies found. Click "Post Vacancy" to
                              create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {showJobDetailsModal && (
                <JobDetailsModal
                  job={selectedJob}
                  onClose={() => setShowJobDetailsModal(false)}
                />
              )}

              {renderModal()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
