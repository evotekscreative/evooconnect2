import React from 'react';
import Case from "../components/Case.jsx";
import { Link } from 'react-router-dom';

const companies = [
  {
    id: 1,
    name: 'Company name',
    tagline: 'Tagline',
    industry: 'Industry',
    image: 'https://via.placeholder.com/100',
  },
];

export default function CompanyCards() {
  return (
    <Case>
      <div className="flex flex-wrap gap-8 mt-16 px-8 justify-start">
        {companies.map((company) => (
          <Link
            to={`/company-profile/${company.id}`}
            key={company.id}
            className="transition-transform transform hover:scale-95"
          >
            <div className="relative bg-gray-100 rounded-2xl p-6 pt-16 w-80 text-center shadow-md hover:shadow-lg cursor-pointer">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <img
                  src={company.image}
                  alt="Company"
                  className="w-24 h-24 rounded-full border-4 border-white shadow"
                />
              </div>
              <h2 className="text-xl font-semibold mt-2">{company.name}</h2>
              <p className="text-gray-600">{company.tagline}</p>
              <p className="text-gray-700 font-medium">{company.industry}</p>
            </div>
          </Link>
        ))}
      </div>
    </Case>
  );
}
