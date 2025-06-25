import React, { useState, useEffect } from "react";
import {
  Search,
  Import,
  Download,
  Filter,
  ChevronDown,
  Menu,
} from "lucide-react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"; // Replace with your actual API base URL

const actions = ["Takedown", "Suspend", "Permanently Banned"];

const ReportUser = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedActions, setSelectedActions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(
        `${BASE_URL}/api/admin/reports?page=${page}&limit=10&target_type=user`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.code === 200) {
        setReports(data.data.reports);
        setCurrentPage(data.data.current_page);
        // setTotalPages(data.data.total_pages);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleSelectAction = (userId, action) => {
    setSelectedActions((prev) => ({
      ...prev,
      [userId]: action,
    }));
    setOpenDropdown(null);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (hidden on mobile) */}
      <div className="hidden w-64 lg:block">
        <Sidebar />
      </div>

      {/* Sidebar Toggle for Mobile */}
      <div className="fixed z-50 lg:hidden top-4 left-4">
        <button
          className="p-2 bg-white rounded shadow"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>
      </div>

      {/* Sidebar Drawer for Small Screens */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-white shadow-lg">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        <h1 className="mb-4 text-2xl font-bold">Report User</h1>

        {/* Top Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <input
            type="date"
            className="px-3 py-1 border rounded-md"
            defaultValue="2025-01-01"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center px-2 border rounded-md">
              <Search className="w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="search"
                className="py-1 outline-none"
              />
            </div>
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md">
              <Import className="w-4 h-4" /> Import
            </button>
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">NO</th>
                <th className="px-4 py-2 border">Photo</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Type of Report</th>
                <th className="px-4 py-2 border">Select Option</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center border">
                    Loading...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center border">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report.id}>
                    <td className="px-4 py-2 text-center border">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      <img
                        src="https://via.placeholder.com/50"
                        alt="user"
                        className="object-cover w-12 h-12 mx-auto rounded-full"
                      />
                    </td>
                    <td className="px-4 py-2 border">-</td>
                    <td className="px-4 py-2 border">-</td>
                    <td className="px-4 py-2 border">-</td>
                    <td className="px-4 py-2 border">-</td>
                    <td className="px-4 py-2 border">
                      <span className="px-2 py-1 text-xs bg-gray-200 rounded-md">
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="relative inline-block text-left">
                        <button
                          className="inline-flex items-center justify-center w-full px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          onClick={() => handleDropdown(report.id)}
                        >
                          {selectedActions[report.id] || "Select Option"}{" "}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                        {openDropdown === report.id && (
                          <div className="absolute right-0 z-10 w-40 mt-2 origin-top-right bg-white border rounded-md shadow-lg">
                            <div className="py-1">
                              {actions.map((action) => (
                                <div
                                  key={action}
                                  className="block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                  onClick={() =>
                                    handleSelectAction(report.id, action)
                                  }
                                >
                                  {action}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportUser;
