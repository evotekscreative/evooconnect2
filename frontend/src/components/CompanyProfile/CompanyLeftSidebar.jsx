import React, { useState } from "react";
import job1 from "../../assets/img/job1.png";
import { Card, CardContent } from "../../components/Card";
import { Button } from "../../components/Button";
import PostJobModal from "../../components/Jobs/PostJobModal.jsx";

export default function CompanyLeftSidebar({ company }) {
          const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [showPostAJobModal, setShowPostAJobModal] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({
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
  return (
    <div className="lg:col-span-3 space-y-6 mt-1">

      <PostJobModal
        showModal={showPostAJobModal}
        setShowModal={setShowPostAJobModal}
        jobForm={jobForm}
        handleInputChange={handleInputChange}
        handlePhotoUpload={handlePhotoUpload}
        handleJobSubmit={handleJobSubmit}
      />

      <div className="flex flex-col items-center bg-white p-6 !m-0 rounded-md shadow">
        <img src={apiUrl+'/' + company.logo}
        alt="Company Logo" 
        className="w-40 h-40" />
        <h2 className="text-lg font-bold mt-4">{company.name}</h2>
        <p className="text-gray-600 text-center p-4">{company.caption}</p>
        <hr className="border-t-2 border-gray-300 my-4 w-full" />
        <div className="text-sm text-gray-800 mt-4 space-y-2 px-4 w-full">
          <div className="flex justify-between">
            <span className="font-semibold">Common Connections:</span>
            <span className="text-blue-600 font-semibold">{company.connections}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">All Employees:</span>
            <span className="text-blue-600 font-semibold">{company.Employees}</span>
          </div>
        </div>
      </div>
    </div>
  );
}