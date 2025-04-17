import React, { useState } from 'react';

const JobDashboard = () => {
  const [activeTab, setActiveTab] = useState('In Progress');

  const tabs = ['Saved', 'In Progress', 'Applied', 'Archived'];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-4">
      {/* Sidebar */}
      <div className="w-60 bg-white rounded-xl shadow p-4">
        <h3 className="text-gray-500 font-medium mb-4">My Items</h3>
        <div className="border-l-4 border-blue-600 pl-3 text-blue-600 font-semibold">
          My Jobs <span className="ml-1 text-sm text-gray-400">1</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl shadow p-6">
        {/* Header & Tabs */}
        <h2 className="text-xl font-semibold mb-4">My Jobs</h2>
        <div className="flex space-x-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full border text-sm transition ${
                activeTab === tab
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center text-center mt-10">
          <img
            src="/your-empty-illustration.png"
            alt="No Job Activity"
            className="w-56 mb-6"
          />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No recent job activity
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Discover new opportunities and track your job search progress here.
          </p>
          <button className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold px-4 py-2 rounded-md">
            Find jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDashboard;
