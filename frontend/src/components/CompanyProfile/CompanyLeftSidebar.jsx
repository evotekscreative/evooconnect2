import React from 'react';
import job1 from "../../assets/img/job1.png";

export default function CompanyLeftSidebar({ company }) {
  return (
    <div className="lg:col-span-3 space-y-6">
      <div className="flex flex-col items-center bg-white p-6 rounded-md shadow">
        <img src={job1} alt="Company Logo" className="w-40 h-40" />
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