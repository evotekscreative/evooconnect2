import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const CompanySidebar = () => {
  // Nilai dummy
  const myCompaniesCount = 0;
  const pendingSubmissionsCount = 0;
  const pendingEditsCount = 0;
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-5 w-64 sticky top-20">
      <h3 className="font-semibold mb-4 border-b pb-3 text-base sm:text-lg">
        Company Management
      </h3>
      <button
        className="w-full mb-4 py-2 px-4 bg-primary text-white rounded hover:bg-primary-dark transition font-semibold text-sm sm:text-base"
        onClick={() => navigate("/create-company")}
      >
        Create Company
      </button>
      <ul className="text-sm sm:text-base text-gray-800 space-y-2">
        <li className="border-b pb-3">
          <NavLink
            to="/company-management/my-company"
            className={({ isActive }) => 
              `flex justify-between items-center hover:text-primary transition ${
                isActive ? "text-primary font-semibold" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>My Companies</span>
                <span className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  isActive ? "bg-blue-100 text-primary" : "bg-gray-100"
                }`}>
                  {myCompaniesCount}
                </span>
              </>
            )}
          </NavLink>
        </li>
        <li className="border-b pb-3">
          <NavLink
            to="/company-management/company-pending"
            className={({ isActive }) => 
              `flex justify-between items-center hover:text-primary transition ${
                isActive ? "text-primary font-semibold" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>Pending Submission</span>
                <span className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  isActive ? "bg-blue-100 text-primary" : "bg-gray-100"
                }`}>
                  {pendingSubmissionsCount}
                </span>
              </>
            )}
          </NavLink>
        </li>
        <li className="border-b pb-3">
          <NavLink
            to="/company-management/company-edit"
            className={({ isActive }) => 
              `flex justify-between items-center hover:text-primary transition ${
                isActive ? "text-primary font-semibold" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>Pending Edit</span>
                <span className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  isActive ? "bg-blue-100 text-primary" : "bg-gray-100"
                }`}>
                  {pendingEditsCount}
                </span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default CompanySidebar;