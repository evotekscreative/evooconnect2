import React, { useState } from 'react';
import { Briefcase, Search, BookmarkPlus, Clock, CheckCircle, } from 'lucide-react';

const JobDashboard = () => {
  const [activeTab, setActiveTab] = useState('In Progress');

  const tabs = [
    { name: 'Saved', icon: <BookmarkPlus size={16} /> },
    { name: 'In Progress', icon: <Clock size={16} /> },
    { name: 'Applied', icon: <CheckCircle size={16} /> },
  ];

  return (
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
            <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">1</span>
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
            </button>
          ))}
        </div>

        {/* Empty State */}
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors">
            Explore Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDashboard;