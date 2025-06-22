import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import JobHeader from "../../components/JobProfile/JobHeader.jsx";
import JobLeftSidebar from "../../components/JobProfile/JobLeftSidebar.jsx";
import JobMainContent from "../../components/JobProfile/JobMainContent.jsx";
import JobRightSidebar from "../../components/JobProfile/JobRightSidebar.jsx";

export default function NewPage() {
    const params = useParams();
    const jobId = params.jobId;
    const [clickedSave, setClickedSave] = useState(false);
    const [clickedApply, setClickedApply] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);

    // Load saved and applied jobs from localStorage when component mounts
    useEffect(() => {
        const saved = localStorage.getItem('savedJobs');
        const applied = localStorage.getItem('appliedJobs');
        
        if (saved) {
            const parsedSavedJobs = JSON.parse(saved);
            setSavedJobs(parsedSavedJobs);
            if (parsedSavedJobs.some(job => job.id === parseInt(jobId))) {
                setClickedSave(true);
            }
        }
        
        if (applied) {
            const parsedAppliedJobs = JSON.parse(applied);
            setAppliedJobs(parsedAppliedJobs);
            if (parsedAppliedJobs.some(job => job.id === parseInt(jobId))) {
                setClickedApply(true);
            }
        }
    }, [jobId]);

    const handleSaveClick = () => {
        let updatedSavedJobs;
        if (!clickedSave) {
            updatedSavedJobs = [...savedJobs, job];
            setClickedSave(true);
        } else {
            updatedSavedJobs = savedJobs.filter(j => j.id !== job.id);
            setClickedSave(false);
        }
        setSavedJobs(updatedSavedJobs);
        localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    };

    const handleApplyClick = () => {
        if (!clickedApply) {
            const updatedAppliedJobs = [...appliedJobs, job];
            setAppliedJobs(updatedAppliedJobs);
            setClickedApply(true);
            localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
            
            if (!clickedSave) {
                const updatedSavedJobs = [...savedJobs, job];
                setSavedJobs(updatedSavedJobs);
                setClickedSave(true);
                localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
            }
        }
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
                    <JobHeader 
                        job={job} 
                        clickedSave={clickedSave} 
                        clickedApply={clickedApply} 
                        handleSaveClick={handleSaveClick} 
                        handleApplyClick={handleApplyClick} 
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <JobLeftSidebar job={job} />
                        <JobMainContent job={job} />
                        <JobRightSidebar />
                    </div>
                </div>
            </div>
        </>
    );
}