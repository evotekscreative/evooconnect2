import React from 'react';

export default function JobsTab({ jobs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-md shadow p-6 hover:shadow-lg transition-shadow flex flex-col">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
          <p className="text-gray-500 mb-2">{job.company} - {job.location}</p>
          <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">{job.employmentType}</span>
          <p className="text-gray-600 text-sm flex-grow">{job.description}</p>
          <div className="mt-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md w-full">
              Apply Now
            </button>
          </div>
        </div>
      ))}
      {jobs.length === 0 && (
        <div className="col-span-full bg-white p-6 rounded-md shadow text-center text-gray-500">
          No jobs available.
        </div>
      )}
    </div>
  );
}