import React, { useState } from 'react';
import PostJobModal from './PostJobModal';
import { Link } from 'react-router-dom';

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
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-medium mb-2">No jobs available</h3>
            <p className="text-sm">This company hasn't posted any job openings yet.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link to={`/jobs/${job.id}`} className="text-blue-600 hover:underline">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  </Link>
                  <div className="flex items-center text-gray-600 mb-3">
                    <span className="font-medium">{job.company}</span>
                    <span className="mx-2">•</span>
                    <span>{job.location}</span>
                    {job.work_type && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{job.work_type}</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.employmentType}
                    </span>
                    {job.experience_level && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {job.experience_level}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {job.salary && (
                    <p className="text-lg font-semibold text-gray-900 mb-2">{job.salary}</p>
                  )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
              
              {job.skills && job.skills.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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