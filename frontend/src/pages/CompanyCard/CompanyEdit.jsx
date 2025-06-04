import React from 'react';
import Case from "../../components/Case.jsx";
import { Link } from 'react-router-dom';
import CompanySidebar from "../../components/CompanyCard/CompanySidebar.jsx";
import CompanyCard from "../../components/CompanyCard/CompanyCard.jsx";

export default function CompanyEdit() {
  return (
    <Case>
      <div className="px-36 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start"> 
            <div className="md:sticky md:top-8 h-auto"> 
              <CompanySidebar />
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 min-h-[500px] w-full">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pb-4 border-b border-gray-200">
                  Company Management
                </h2>
                <div className="overflow-x-auto">
                  <CompanyCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Case>
  );
}