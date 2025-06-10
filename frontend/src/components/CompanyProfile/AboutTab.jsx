import React from 'react';
import { MapPin } from 'lucide-react';

export default function AboutTab({ company }) {
  return (
    <>
      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-2xl font-semibold mb-4">About</h2>
        <hr className="py-2" />
        <p className="text-gray-700">{company.description}</p>
      </div>

      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <hr className="py-2" />
        <ul className="space-y-2 text-gray-700">
          <li><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{company.website}</a></li>
          <hr className="py-2" />
          <li><strong>Industry:</strong> {company.industry}</li>
          <hr className="py-2" />
          <li><strong>Company Size:</strong> {company.size}</li>
          <hr className="py-2" />
          <li><strong>Headquarters:</strong> {company.headquarters}</li>
          <hr className="py-2" />
          <li><strong>Type:</strong> {company.type}</li>
          <hr className="py-2" />
          <li><strong>Founded:</strong> {company.founded}</li>
          <hr className="py-2" />
          <li><strong>Linkedin Url:</strong> {company.linkedin_url || 'N/A'}</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-2xl font-semibold mb-4">Location</h2>
        <hr className="py-2" />
        <div className="space-y-4">
          <iframe
            src="https://www.google.com/maps/embed?..."
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Location Map"
          ></iframe>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <MapPin size={20} strokeWidth={0.75} />
              Postal Address
            </h3>
            <p className="text-gray-700">{company.location}</p>
          </div>
        </div>
      </div>
    </>
  );
}