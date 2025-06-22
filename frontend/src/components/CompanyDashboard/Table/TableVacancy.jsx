import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { FileText, Trash2, Edit } from "lucide-react";
import SimpleApply from "../../../components/CompanyDashboard/PostVacancy/SimpleApply.jsx";  
import axios from "axios";

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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const isLight = color === "light";
  const {company_id } = useParams();

  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/companies/${company_id}/jobs?limit=10&offset=0&status=active`,
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      if (response.data?.data?.jobs) {
        setJobs(response.data.data.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const headerClass =
    "px-6 py-3 text-xs uppercase font-semibold text-left border-b";
  const lightHeader =
    "bg-gray-100 text-gray-500 border-gray-200";
  const darkHeader =
    "bg-sky-800 text-sky-200 border-sky-700";

  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";
  const badgeColors = {
    active: "text-green-500",
    pending: "text-orange-500",
    closed: "text-red-500",
    draft: "text-sky-500",
  };

const handleSubmitVacancy = async (jobData) => {
  try {
    // If we have a successful job submission with data from the API
    if (jobData && jobData.id) {
      // Add the new job to the jobs list without needing to refetch
      setJobs(prevJobs => [jobData, ...prevJobs]);
    } else {
      // If no job data returned, refresh the job list from API
      await fetchCompanyJobs();
    }
  } catch (error) {
    console.error("Error handling job vacancy submission:", error);
    await fetchCompanyJobs();
  }
};

  // Map job type to image for display
  const getJobImage = (jobType) => {
    const images = {
      "full-time": reactImg,
      "part-time": angularImg,
      "contract": bootstrapImg,
      "internship": sketchImg,
      "freelance": vueImg
    };
    return images[jobType] || bootstrapImg;
  };

  // Format salary range for display
  const formatSalary = (min, max, currency) => {
    if (!min && !max) return "Negotiable";
    if (min && !max) return `${currency} ${min.toLocaleString()}+`;
    if (!min && max) return `Up to ${currency} ${max.toLocaleString()}`;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
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
              Job Vacancies
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
        {loading ? (
          <div className="text-center py-4">Loading job vacancies...</div>
        ) : (
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                {["Job Title", "Salary", "Status", "Skills", "Action"].map((title, idx) => (
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
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <th className={`border-t ${borderColor} px-6 py-4 text-xs text-left flex items-center`}>
                      <img
                        src={getJobImage(job.job_type)}
                        className="h-12 w-12 bg-white rounded-full border"
                        alt={job.title}
                      />
                      <div className="ml-3">
                        <span className={`font-bold ${textColor} block`}>{job.title}</span>
                        <span className="text-gray-500 text-xs">{job.location}</span>
                      </div>
                    </th>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      {formatSalary(job.min_salary, job.max_salary, job.currency)}
                    </td>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      <i className={`fas fa-circle mr-2 ${badgeColors[job.status]}`}></i> {job.status}
                    </td>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      <div className="flex flex-wrap gap-1">
                        {job.skills && job.skills.map((skill, i) => (
                          <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`border-t ${borderColor} px-6 py-4 text-xs`}>
                      <div className="flex items-center gap-2">
                        <Link to={`/company-dashboard/list-applicants/${job.id}`}>
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 border-t">
                    No job vacancies found. Click "Post Vacancy" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

TableVacancy.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};

TableVacancy.defaultProps = {
  color: "light",
};
