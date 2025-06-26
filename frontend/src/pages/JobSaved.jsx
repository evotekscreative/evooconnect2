import React, { useState, useEffect } from "react";
import {
  Briefcase,
  BookmarkPlus,
  Clock,
  CheckCircle,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Case from "../components/Case";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const JobDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Saved"
  );
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [reviewedJobs, setReviewedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyApplications();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["Saved", "In Progress", "Applied"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/my-applications?limit=50&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.code === 200) {
        const applications = data.data.applications || [];
        const inProgress = applications.filter(
          (app) => app.status === "submitted"
        );
        const reviewed = applications.filter((app) =>
          [
            "under_review",
            "shortlisted",
            "interview_scheduled",
            "accepted",
            "rejected",
          ].includes(app.status)
        );

        setAppliedJobs(inProgress);
        setReviewedJobs(reviewed);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/saved-jobs?page=1&pageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.code === 200) {
        setSavedJobs(data.data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to fetch saved jobs");
    }
    setLoading(false);
  };

  const handleRemoveJob = async (jobVacancyId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/saved-jobs/${jobVacancyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setSavedJobs((prev) =>
          prev.filter((job) => job.job_vacancy.id !== jobVacancyId)
        );
        toast.success("Job removed from saved list");
      } else {
        toast.error("Failed to remove job from saved list");
      }
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("Failed to remove job from saved list");
    }
  };

  const tabs = [
    { name: "Saved", icon: <BookmarkPlus size={16} /> },
    { name: "In Progress", icon: <Clock size={16} /> },
    { name: "Applied", icon: <CheckCircle size={16} /> },
  ];

  return (
    <>
      <Case />
      <div className="flex min-h-screen gap-6 p-6 bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 p-5 bg-white shadow-md rounded-xl">
          <div className="mb-8">
            <h2 className="mb-6 text-xl font-bold text-gray-800">JobTracker</h2>
          </div>

          <h3 className="mb-3 text-sm font-medium tracking-wider text-gray-500 uppercase">
            My Items
          </h3>
          <div className="space-y-2">
            <div className="flex items-center px-3 py-2.5 rounded-lg bg-blue-50 border-l-4 border-blue-600">
              <Briefcase size={18} className="mr-3 text-blue-600" />
              <span className="font-medium text-blue-700">My Jobs</span>
              <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {savedJobs.length + appliedJobs.length + reviewedJobs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 bg-white shadow-md rounded-xl">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Jobs</h2>
          </div>

          <div className="flex pb-1 mb-8 space-x-3 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(tab.name)}
                className={`px-4 py-2.5 flex items-center gap-2 transition-colors text-sm font-medium ${
                  activeTab === tab.name
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.icon}
                {tab.name}
                {tab.name === "Saved" && savedJobs.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {savedJobs.length}
                  </span>
                )}
                {tab.name === "In Progress" && appliedJobs.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {appliedJobs.length}
                  </span>
                )}
                {tab.name === "Applied" && reviewedJobs.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {reviewedJobs.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Saved Jobs List */}
          {activeTab === "Saved" && loading ? (
            <div className="flex items-center justify-center mt-16">
              <div className="text-gray-500">Loading saved jobs...</div>
            </div>
          ) : activeTab === "Saved" && savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((savedJob) => (
                <div
                  key={savedJob.id}
                  className="p-4 transition border border-gray-200 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() =>
                          navigate(`/jobs/${savedJob.job_vacancy.id}`)
                        }
                      >
                        {savedJob.job_vacancy.title}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {savedJob.job_vacancy.company.name}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {savedJob.job_vacancy.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {savedJob.job_vacancy.currency}{" "}
                          {savedJob.job_vacancy.min_salary?.toLocaleString()} -{" "}
                          {savedJob.job_vacancy.max_salary?.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                          {savedJob.job_vacancy.job_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveJob(savedJob.job_vacancy.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Remove job"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      Saved on{" "}
                      {new Date(savedJob.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "Saved" ? (
            <div className="flex flex-col items-center max-w-md mx-auto mt-16 text-center">
              <div className="p-6 mb-6 rounded-full bg-blue-50">
                <BookmarkPlus size={48} className="text-blue-500" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                No saved jobs yet
              </h3>
              <p className="mb-6 text-base text-gray-500">
                When you save jobs, they'll appear here for easy access.
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : activeTab === "In Progress" &&
            !loading &&
            appliedJobs.length > 0 ? (
            <div className="space-y-4">
              {appliedJobs.map((application) => (
                <div
                  key={application.id}
                  className="p-4 transition border border-gray-200 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() =>
                          navigate(`/jobs/${application.job_vacancy.id}`)
                        }
                      >
                        {application.job_vacancy.title}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {application.job_vacancy.company.name}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {application.job_vacancy.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {application.expected_salary?.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                          {application.job_vacancy.job_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          application.status === "submitted"
                            ? "bg-blue-100 text-blue-800"
                            : application.status === "reviewed"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : application.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      Applied on{" "}
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "In Progress" && loading ? (
            <div className="flex items-center justify-center mt-16">
              <div className="text-gray-500">Loading applications...</div>
            </div>
          ) : activeTab === "Applied" && reviewedJobs.length > 0 ? (
            <div className="space-y-4">
              {reviewedJobs.map((application) => (
                <div
                  key={application.id}
                  className="p-4 transition border border-gray-200 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() =>
                          navigate(`/jobs/${application.job_vacancy.id}`)
                        }
                      >
                        {application.job_vacancy.title}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {application.job_vacancy.company.name}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {application.job_vacancy.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {application.expected_salary?.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                          {application.job_vacancy.job_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          application.status === "under_review"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "shortlisted"
                            ? "bg-purple-100 text-purple-800"
                            : application.status === "interview_scheduled"
                            ? "bg-indigo-100 text-indigo-800"
                            : application.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : application.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {application.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      Applied on{" "}
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "Applied" ? (
            <div className="flex flex-col items-center max-w-md mx-auto mt-16 text-center">
              <div className="p-6 mb-6 rounded-full bg-blue-50">
                <CheckCircle size={48} className="text-blue-500" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                No reviewed applications yet
              </h3>
              <p className="mb-6 text-base text-gray-500">
                Applications that have been reviewed by companies will appear
                here.
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-md mx-auto mt-16 text-center">
              <div className="p-6 mb-6 rounded-full bg-blue-50">
                <Clock size={48} className="text-blue-500" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                No jobs in progress
              </h3>
              <p className="mb-6 text-base text-gray-500">
                Your applied jobs will appear here as "In Progress" while you're
                waiting for responses.
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <Link to="/jobs">Browse Jobs</Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDashboard;
