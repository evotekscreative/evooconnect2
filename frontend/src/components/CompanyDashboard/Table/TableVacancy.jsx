import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FileText, Trash2 } from "lucide-react";
import SimpleApply from "../../../components/CompanyDashboard/PostVacancy/SimpleApply.jsx";  

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

export default function TableVacancy({ color }) {
  const [showModal, setShowModal] = useState(false);
  const isLight = color === "light";

  const headerClass =
    "px-6 py-3 text-xs uppercase font-semibold text-left border-b";
  const lightHeader =
    "bg-gray-100 text-gray-500 border-gray-200";
  const darkHeader =
    "bg-sky-800 text-sky-200 border-sky-700";

  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";
  const badgeColors = {
    pending: "text-orange-500",
    completed: "text-green-500",
    delayed: "text-red-500",
    progress: "text-sky-500",
  };

  const handleSubmitVacancy = (formData) => {
    console.log("Form submitted:", formData);
  };

  return (
    <div className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}>
      {/* Modal Component */}
      <SimpleApply 
        showModal={showModal}
        setShowModal={setShowModal}
        onSubmit={handleSubmitVacancy}
      />

      <div className="rounded-t mb-0 px-4 py-3 border-b border-sky-700 bg-sky-800">
        <div className="flex flex-wrap items-center">
          <div className="w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-white">
              Card Tables
            </h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-sky-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-sky-100 transition duration-200"
          >
            Post Vacancy
          </button>
        </div>
      </div>

      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              {["Project", "Budget", "Status", "Users", "Action", ""].map((title, idx) => (
                <th
                  key={idx}
                  className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                img: bootstrapImg,
                name: "Argon Design System",
                budget: "$2,500 USD",
                status: "pending",
              },
              {
                img: angularImg,
                name: "Angular Now UI Kit PRO",
                budget: "$1,800 USD",
                status: "completed",
              },
              {
                img: sketchImg,
                name: "Black Dashboard Sketch",
                budget: "$3,150 USD",
                status: "delayed",
              },
              {
                img: reactImg,
                name: "React Material Dashboard",
                budget: "$4,400 USD",
                status: "completed",
              },
              {
                img: vueImg,
                name: "Vue Paper UI Kit PRO",
                budget: "$2,200 USD",
                status: "progress",
              },
            ].map((row, idx) => (
              <tr key={idx}>
                <th className={`border-t ${borderColor} px-6 py-4 text-xs text-left flex items-center`}>
                  <img
                    src={row.img}
                    className="h-12 w-12 bg-white rounded-full border"
                    alt={row.name}
                  />
                  <span className={`ml-3 font-bold ${textColor}`}>{row.name}</span>
                </th>
                <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>{row.budget}</td>
                <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                  <i className={`fas fa-circle mr-2 ${badgeColors[row.status]}`}></i> {row.status}
                </td>
                <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                  <div className="flex">
                    {[team1, team2, team3, team4].map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Team member"
                        className={`w-10 h-10 rounded-full border-2 border-white shadow ${i !== 0 ? "-ml-4" : ""}`}
                      />
                    ))}
                  </div>
                </td>
                <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                  <div className="flex items-center gap-2">
                    <Link to={"/company-dashboard/list-applicants"}>
                      <button className="p-1 rounded hover:bg-gray-100 text-primary">
                        <FileText size={18} />
                      </button>
                    </Link>
                    <button className="p-1 rounded hover:bg-gray-100 text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}