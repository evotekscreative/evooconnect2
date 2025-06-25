import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import JobHeader from "../../components/JobProfile/JobHeader.jsx";
import JobLeftSidebar from "../../components/JobProfile/JobLeftSidebar.jsx";
import JobMainContent from "../../components/JobProfile/JobMainContent.jsx";

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function JobProfile() {
    const params = useParams();
    const jobId = params.jobId;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clickedSave, setClickedSave] = useState(false);
    const [clickedApply, setClickedApply] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        async function fetchJob() {
            setLoading(true);
            try {
                const res = await fetch(
                    `${BASE_URL}/api/job-details/${jobId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                const data = await res.json();
                if (data.code === 200) {
                    setJob(data.data);
                    setSelectedJob(data.data); // set default selected job
                }
            } catch (err) {
                console.error('Error fetching job:', err);
            }
            setLoading(false);
        }

        const saved = localStorage.getItem('savedJobs');
        const applied = localStorage.getItem('appliedJobs');
        
        if (saved) {
            const parsedSavedJobs = JSON.parse(saved);
            setSavedJobs(parsedSavedJobs);
            if (parsedSavedJobs.some(job => job.id === jobId)) {
                setClickedSave(true);
            }
        } else {
            setClickedSave(job?.is_saved || false);
        }
        
        if (applied) {
            const parsedAppliedJobs = JSON.parse(applied);
            setAppliedJobs(parsedAppliedJobs);
            if (parsedAppliedJobs.some(job => job.id === jobId)) {
                setClickedApply(true);
            }
        } else {
            setClickedApply(job?.has_applied || false);
        }

        fetchJob();
    }, [jobId]);

    const handleSaveClick = () => {
        let updatedSavedJobs;
        if (!clickedSave) {
            updatedSavedJobs = [...savedJobs, selectedJob];
            setClickedSave(true);
        } else {
            updatedSavedJobs = savedJobs.filter(j => j.id !== selectedJob.id);
            setClickedSave(false);
        }
        setSavedJobs(updatedSavedJobs);
        localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    };

    const handleApplyClick = () => {
        if (!clickedApply) {
            const updatedAppliedJobs = [...appliedJobs, selectedJob];
            setAppliedJobs(updatedAppliedJobs);
            setClickedApply(true);
            localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
            
            if (!clickedSave) {
                const updatedSavedJobs = [...savedJobs, selectedJob];
                setSavedJobs(updatedSavedJobs);
                setClickedSave(true);
                localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
            }
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="bg-gray-100 min-h-screen py-8 flex items-center justify-center">
                    <div>Loading job details...</div>
                </div>
            </>
        );
    }

    if (!job) {
        return (
            <>
                <Navbar />
                <div className="bg-gray-100 min-h-screen py-8 flex items-center justify-center">
                    <div>Job not found</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen py-8">
                <div className="container mx-auto px-4 md:px-6 lg:px-24 xl:px-38">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
                        {/* Sidebar kiri diperbesar */}
                        <div className="lg:col-span-2 hidden lg:block">
                            <JobLeftSidebar
                                onSelectJob={setSelectedJob}
                                selectedJobId={selectedJob?.id}
                            />
                        </div>
                        {/* Main content diperkecil */}
                        <div className="lg:col-span-4">
                            <JobMainContent
                                job={selectedJob}
                                clickedSave={clickedSave}
                                handleSaveClick={handleSaveClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}