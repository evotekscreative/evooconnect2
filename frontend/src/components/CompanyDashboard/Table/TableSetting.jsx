import React from "react";
import PropTypes from "prop-types";

// components
// import TableDropdown from "../../../components/Admin/Dropdowns/TableDropdown.jsx";

// import gambar
import bootstrapImg from "../../../assets/img/imgAdmin/bootstrap.jpg";
import angularImg from "../../../assets/img/imgAdmin/angular.jpg";
import sketchImg from "../../../assets/img/imgAdmin/sketch.jpg";
import reactImg from "../../../assets/img/imgAdmin/react.jpg";
import vueImg from "../../../assets/img/imgAdmin/vue.jpg";

import team1 from "../../../assets/img/imgAdmin/team-1-800x800.jpg";
import team2 from "../../../assets/img/imgAdmin/team-2-800x800.jpg";
import team3 from "../../../assets/img/imgAdmin/team-3-800x800.jpg";
import team4 from "../../../assets/img/imgAdmin/team-4-470x470.png";

export default function TableSetting({ color }) {
  const isLight = color === "light";

  const headerClass =
    "px-6 py-3 text-xs uppercase font-semibold text-left border-b";
  const lightHeader =
    "bg-gray-100 text-gray-500 border-gray-200";
  const darkHeader =
    "bg-sky-800 text-sky-200 border-sky-700";

  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  // const bgColor = isLight ? "bg-white" : "bg-sky-900 text-white";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";
  const badgeColors = {
    pending: "text-orange-500",
    completed: "text-green-500",
    delayed: "text-red-500",
    progress: "text-sky-500",
  };

  // Data response dari API
  const companyData = {
    id: "company-uuid-here",
    name: "Tech Innovators Inc",
    linkedin_url: "tech-innovators",
    website: "https://techinnovators.com",
    industry: "Information Technology",
    size: "51-200 employees",
    type: "Privately Held",
    logo: "company-logos/user-id/logo.jpg",
    tagline: "Innovating for a better tomorrow",
    is_verified: true,
    created_at: "2023-10-15T10:30:00Z",
    updated_at: "2023-10-16T09:00:00Z",
    has_pending_edit: true,
    pending_edit_id: "edit-request-uuid",
  };

  return (
    <div className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}>
     
    </div>
  );
}

