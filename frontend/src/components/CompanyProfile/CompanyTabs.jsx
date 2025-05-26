import React from 'react';

export default function CompanyTabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="bg-white rounded-md shadow px-6 py-4 max-w-screen-xl mx-auto mt-4">
      <div className="flex space-x-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-lg font-medium transition ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}