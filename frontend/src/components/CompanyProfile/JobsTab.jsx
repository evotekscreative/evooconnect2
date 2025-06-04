import React, { useState } from 'react';
import PostJobModal from './PostJobModal';

export default function JobsTab({ jobs, onJobPost }) {
  const [showModal, setShowModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    jobTitle: '',
    position: '',
    location: '',
    salary: '',
    description: '',
    rating: '',
    seniorityLevel: '',
    industry: '',
    employmentType: '',
    jobFunction: '',
    company: '',
    photo: null,
    photoPreview: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setJobForm(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    console.log('Job submitted:', jobForm);
    onJobPost(jobForm);
    setShowModal(false);
    setJobForm({
      jobTitle: '',
      position: '',
      location: '',
      salary: '',
      description: '',
      rating: '',
      seniorityLevel: '',
      industry: '',
      employmentType: '',
      jobFunction: '',
      company: '',
      photo: null,
      photoPreview: null
    });
  };

  return (
    <div className="space-y-6">

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.length === 0 ? (
          <div className="col-span-full bg-white p-6 rounded-md shadow text-center text-gray-500">
            No jobs available.
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-md shadow p-6 hover:shadow-lg transition-shadow flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
              <p className="text-gray-500 mb-2">{job.company} - {job.location}</p>
              <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {job.employmentType}
              </span>
              <p className="text-gray-600 text-sm flex-grow">{job.description}</p>
              <div className="mt-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md w-full">
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Job Modal */}
      <PostJobModal
        showModal={showModal}
        setShowModal={setShowModal}
        jobForm={jobForm}
        handleInputChange={handleInputChange}
        handlePhotoUpload={handlePhotoUpload}
        handleJobSubmit={handleJobSubmit}
      />
    </div>
  );
}