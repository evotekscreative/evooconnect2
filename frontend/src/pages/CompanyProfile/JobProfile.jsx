import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import JobHeader from "../../components/JobProfile/JobHeader.jsx";
import JobLeftSidebar from "../../components/JobProfile/JobLeftSidebar.jsx";
import JobMainContent from "../../components/JobProfile/JobMainContent.jsx";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function JobProfile() {
  const params = useParams();
  const jobId = params.jobId;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/job-details/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.code === 200) {
          setJob(data.data);
          setSelectedJob(data.data);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
      }
      setLoading(false);
    }

    fetchJob();
  }, [jobId]);

  const handleSaveClick = async () => {
    if (!selectedJob) return;

    try {
      const currentSaveStatus = selectedJob.is_saved;

      if (!currentSaveStatus) {
        // Save job via API
        const response = await fetch(
          `${BASE_URL}/api/saved-jobs/${selectedJob.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Update the job object to reflect the saved status immediately
          const updatedJob = { ...selectedJob, is_saved: true };
          setJob(updatedJob);
          setSelectedJob(updatedJob);
        }
      } else {
        // Unsave job via API
        const response = await fetch(
          `${BASE_URL}/api/saved-jobs/${selectedJob.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Update the job object to reflect the unsaved status immediately
          const updatedJob = { ...selectedJob, is_saved: false };
          setJob(updatedJob);
          setSelectedJob(updatedJob);
        }
      }
    } catch (error) {
      console.error("Error handling save/unsave:", error);
    }
  };

  const handleApplyClick = () => {
    if (selectedJob && !selectedJob.has_applied) {
      const updatedAppliedJobs = [...appliedJobs, selectedJob];
      setAppliedJobs(updatedAppliedJobs);

      // Update job status to applied
      setJob((prev) => ({ ...prev, has_applied: true }));
      setSelectedJob((prev) => ({ ...prev, has_applied: true }));

      // Auto-save when applying (if not already saved)
      if (!selectedJob.is_saved) {
        handleSaveClick();
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen py-8 bg-gray-100">
          <div>Loading job details...</div>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen py-8 bg-gray-100">
          <div>Job not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 bg-gray-100">
        <div className="container px-4 mx-auto md:px-6 lg:px-24 xl:px-38">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-6">
            {/* Sidebar kiri diperbesar */}
            <div className="hidden lg:col-span-2 lg:block">
              <JobLeftSidebar
                onSelectJob={setSelectedJob}
                selectedJobId={selectedJob?.id}
              />
            </div>
            {/* Main content diperkecil */}
            <div className="lg:col-span-4">
              <JobMainContent
                job={selectedJob}
                handleSaveClick={handleSaveClick}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
