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

export default function TablePost({ color }) {
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

  return (
    <div className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}>
      <div className="rounded-t mb-0 px-4 py-3 border-b border-sky-700 bg-sky-800">
        <div className="flex flex-wrap items-center">
          <div className="w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-white">
              Card Tables
            </h3>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              {["Project", "Budget", "Status", "Users", "Completion", ""].map((title, idx) => (
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
                progress: 60,
                barColor: "bg-red-500",
                barBg: "bg-red-200",
              },
              {
                img: angularImg,
                name: "Angular Now UI Kit PRO",
                budget: "$1,800 USD",
                status: "completed",
                progress: 100,
                barColor: "bg-green-500",
                barBg: "bg-green-200",
              },
              {
                img: sketchImg,
                name: "Black Dashboard Sketch",
                budget: "$3,150 USD",
                status: "delayed",
                progress: 73,
                barColor: "bg-red-500",
                barBg: "bg-red-200",
              },
              {
                img: reactImg,
                name: "React Material Dashboard",
                budget: "$4,400 USD",
                status: "completed",
                progress: 80,
                barColor: "bg-green-500",
                barBg: "bg-green-200",
              },
              {
                img: vueImg,
                name: "Vue Paper UI Kit PRO",
                budget: "$2,200 USD",
                status: "progress",
                progress: 40,
                barColor: "bg-sky-500",
                barBg: "bg-sky-200",
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
                  <div className="flex items-center">
                    <span className="mr-2">{row.progress}%</span>
                    <div className="relative w-full">
                      <div className={`overflow-hidden h-2 text-xs flex rounded ${row.barBg}`}>
                        <div
                          style={{ width: `${row.progress}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${row.barColor}`}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                {/* <td className={`border-t ${borderColor} px-6 py-4 text-xs text-right`}>
                  <TableDropdown />
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// CardTable.defaultProps = {
//   color: "light",
// };

// CardTable.propTypes = {
//   color: PropTypes.oneOf(["light", "dark"]),
// };
