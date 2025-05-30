import React, { useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  FaUserAlt, FaCommentDots, FaFileAlt, FaBriefcase,
  FaBars, FaRegCommentDots, FaStickyNote,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import Sidebar from "../../../components/Admin/Sidebar/Sidebar.jsx";

const data = [
  { name: 'Report Blog', value: 2000 },
  { name: 'Report Comment', value: 1200 },
  { name: 'Report User', value: 900 }
];

const COLORS = ['#A78B71', '#9A9B7C', '#3B3C36'];

const ReportPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for large screens */}
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      {/* Sidebar toggle button (visible on small screens) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="text-gray-700 bg-white p-2 rounded shadow"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Report</h1>

        {/* Scroll Buttons and Cards */}
        <div className="relative mb-8">

          {/* Cards */}
          <div
            ref={scrollRef}
          >
            <div className="flex gap-4 sm:gap-6 w-max min-w-full px-8">
              <Link to="/admin/report-user">
                <ReportCard icon={<FaUserAlt />} title="Report User" count="20.000" />
              </Link>
              <ReportCard icon={<FaCommentDots />} title="Report Comment" count="12.000" />
              <ReportCard icon={<FaFileAlt />} title="Report Blog" count="8.000" />
              <ReportCard icon={<FaBriefcase />} title="Report Job" count="7.000" />
              <ReportCard icon={<FaRegCommentDots />} title="Report Comment Blog" count="6.000" />
              <Link to="/admin/report-post">
              <ReportCard icon={<FaStickyNote />} title="Report Post" count="10.000" />
              </Link>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-black rounded-xl p-4 sm:p-6 w-full max-w-full lg:max-w-xl mx-auto">
          <h2 className="text-white text-lg font-semibold mb-4">Report Overview</h2>
          <div className="w-full h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-white mt-4 space-y-1">
            {data.map((item, idx) => (
              <p key={idx} className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }}></span>
                {item.name}: <strong>{item.value}</strong>
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const ReportCard = ({ icon, title, count }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 flex flex-col items-start min-w-[220px]">
      <div className="text-gray-600 text-sm mb-1">Total Report</div>
      <div className="text-xl sm:text-2xl font-bold mb-2">{count}</div>
      <div className="flex items-center gap-2 text-base sm:text-lg font-medium">
        {icon} {title}
      </div>
    </div>
  );
};

export default ReportPage;
