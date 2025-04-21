import React, { useState, useEffect } from 'react';
import { Briefcase, Search, BookmarkPlus, Clock, CheckCircle, Trash2, MapPin, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Case from '../components/Case';
import { Link } from 'react-router-dom';

const JobDashboard = () => {
  const [activeTab, setActiveTab] = useState('Saved');
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved jobs from localStorage when component mounts
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  const handleRemoveJob = (jobId) => {
    const updatedSavedJobs = savedJobs.filter(job => job.id !== jobId);
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
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
                {savedJobs.length}
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
                className={`px-4 py-2.5 flex items-center gap-2 transition-colors text-sm font-medium ${
                  activeTab === tab.name
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
              </button>
            ))}
          </div>

          {/* Saved Jobs List */}
          {activeTab === 'Saved' && savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                        {job.title}
                      </h3>
                      <p className="text-blue-600 text-sm">{job.company}</p>
                      <div className="flex items-center text-gray-500 text-xs mt-2 space-x-4">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          {job.salary}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Posted {job.postedDate}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveJob(job.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Remove job"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Saved on {new Date().toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded"
                    >
                      View Job
                    </button>
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
          ) : (
            <div className="flex flex-col items-center text-center mt-16 max-w-md mx-auto">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Briefcase size={48} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No {activeTab.toLowerCase()} job applications
              </h3>
              <p className="text-base text-gray-500 mb-6">
                Track your job search journey from bookmarking to applications. We'll organize everything here for you.
              </p>
              <button 
                onClick={() => navigate('/jobs')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <Link to="/jobs" className="text-white">Browse Jobs</Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDashboard;