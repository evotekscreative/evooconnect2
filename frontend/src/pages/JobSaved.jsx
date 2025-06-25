import React, { useState, useEffect } from 'react';
import { Briefcase, Search, BookmarkPlus, Clock, CheckCircle, Trash2, MapPin, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Case from '../components/Case';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const JobDashboard = () => {
  const [activeTab, setActiveTab] = useState('In Progress');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [reviewedJobs, setReviewedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyApplications();
    fetchSavedJobs();
  }, []);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/my-applications?limit=50&offset=0`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.code === 200) {
        const applications = data.data.applications || [];
        const inProgress = applications.filter(app => app.status === 'submitted');
        const reviewed = applications.filter(app => ['under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'].includes(app.status));
        
        setAppliedJobs(inProgress);
        setReviewedJobs(reviewed);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/saved-jobs?page=1&pageSize=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.code === 200) {
        setSavedJobs(data.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const handleRemoveJob = async (jobVacancyId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/saved-jobs/${jobVacancyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.job_vacancy.id !== jobVacancyId));
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const tabs = [
    { name: 'Saved', icon: <BookmarkPlus size={16} /> },
    { name: 'In Progress', icon: <Clock size={16} /> },
    { name: 'Applied', icon: <CheckCircle size={16} /> },
  ];

  return (
    <>
      <Case />
      <div className="min-h-screen bg-gray-100 p-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-xl shadow-md p-5">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">JobTracker</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full bg-gray-50 rounded-lg py-2 pl-9 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <h3 className="text-gray-500 font-medium mb-3 text-sm uppercase tracking-wider">My Items</h3>
          <div className="space-y-2">
            <div className="flex items-center px-3 py-2.5 rounded-lg bg-blue-50 border-l-4 border-blue-600">
              <Briefcase size={18} className="text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">My Jobs</span>
              <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {savedJobs.length + appliedJobs.length + reviewedJobs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6">
          {/* Header & Tabs */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Jobs</h2>
          </div>

          <div className="flex space-x-3 mb-8 border-b border-gray-200 pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-4 py-2.5 flex items-center gap-2 transition-colors text-sm font-medium ${activeTab === tab.name
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab.icon}
                {tab.name}
                {tab.name === 'Saved' && savedJobs.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {savedJobs.length}
                  </span>
                )}
                {tab.name === 'In Progress' && appliedJobs.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {appliedJobs.length}
                  </span>
                )}
                {tab.name === 'Applied' && reviewedJobs.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {reviewedJobs.length}
                  </span>
                )}

              </button>
            ))}
          </div>

          {/* Saved Jobs List */}
          {activeTab === 'Saved' && savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((savedJob) => (
                <div key={savedJob.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/jobs/${savedJob.job_vacancy.id}`)}>
                        {savedJob.job_vacancy.title}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {savedJob.job_vacancy.company.name}
                      </p>
                      <div className="flex items-center text-gray-500 text-xs mt-2 space-x-4">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {savedJob.job_vacancy.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {savedJob.job_vacancy.currency} {savedJob.job_vacancy.min_salary?.toLocaleString()} - {savedJob.job_vacancy.max_salary?.toLocaleString()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {savedJob.job_vacancy.job_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveJob(savedJob.job_vacancy.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Remove job"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Saved on {new Date(savedJob.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'Saved' ? (
            <div className="flex flex-col items-center text-center mt-16 max-w-md mx-auto">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <BookmarkPlus size={48} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No saved jobs yet
              </h3>
              <p className="text-base text-gray-500 mb-6">
                When you save jobs, they'll appear here for easy access.
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : activeTab === 'In Progress' && !loading && appliedJobs.length > 0 ? (
            <div className="space-y-4">
              {appliedJobs.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/jobs/${application.job_vacancy.id}`)}>
                        {application.job_vacancy.title}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {application.job_vacancy.company.name}
                      </p>
                      <div className="flex items-center text-gray-500 text-xs mt-2 space-x-4">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {application.job_vacancy.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {application.expected_salary?.toLocaleString()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {application.job_vacancy.job_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        application.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Applied on {new Date(application.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          ) : activeTab === 'In Progress' && loading ? (
            <div className="flex justify-center items-center mt-16">
              <div className="text-gray-500">Loading applications...</div>
            </div>
          ) : activeTab === 'Applied' && reviewedJobs.length > 0 ? (
            <div className="space-y-4">
              {reviewedJobs.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/jobs/${application.job_vacancy.id}`)}>
                        {application.job_vacancy.title}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {application.job_vacancy.company.name}
                      </p>
                      <div className="flex items-center text-gray-500 text-xs mt-2 space-x-4">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {application.job_vacancy.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {application.expected_salary?.toLocaleString()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {application.job_vacancy.job_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        application.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                        application.status === 'interview_scheduled' ? 'bg-indigo-100 text-indigo-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Applied on {new Date(application.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'Applied' ? (
            <div className="flex flex-col items-center text-center mt-16 max-w-md mx-auto">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <CheckCircle size={48} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No reviewed applications yet
              </h3>
              <p className="text-base text-gray-500 mb-6">
                Applications that have been reviewed by companies will appear here.
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center mt-16 max-w-md mx-auto">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Clock size={48} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No jobs in progress
              </h3>
              <p className="text-base text-gray-500 mb-6">
                Your applied jobs will appear here as "In Progress" while you're waiting for responses.
              </p>
              <button
                onClick={() => navigate('/jobs')}
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