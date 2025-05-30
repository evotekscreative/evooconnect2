import React from 'react';
import companyProfile from "../../assets/img/company-profile.jpg";

export default function CompanyHeader({ company, isFollowingMain, setIsFollowingMain }) {
  return (
    <div className="relative">
      <img src={companyProfile} alt="Company Header" className="w-full h-60 object-cover" />
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 bg-white rounded-md shadow -mt-8 relative z-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
            {company.name}
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React Icon" className="w-5 h-5" />
          </h1>
          <p className="text-gray-500">
            {company.industry} | {company.location} | {company.followers} followers
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
            Visit Website
          </button>
          <button
            onClick={() => setIsFollowingMain(!isFollowingMain)}
            className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${isFollowingMain ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isFollowingMain ? " Followed" : "+ Follow"}
          </button>
        </div>
      </div>
    </div>
  );
}