import React, { useState } from "react";
import {
  Search,
  Import,
  Download,
  Filter,
  ChevronDown,
  Menu,
} from "lucide-react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";

const actions = ["Takedown", "Suspend", "Permanently Banned"];

const ReportUser = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedActions, setSelectedActions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dummyData = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: "Yasir wal asri",
    username: "sirgobang_gosir",
    phone: "0867564357897",
    email: "sir@gmail.com",
    reportType: "Harassment",
    photo: "https://via.placeholder.com/50",
  }));

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
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      {/* Sidebar Toggle for Mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
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
        <h1 className="text-2xl font-bold mb-4">Report User</h1>

        {/* Top Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <input
            type="date"
            className="border px-3 py-1 rounded-md"
            defaultValue="2025-01-01"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border rounded-md px-2">
              <Search className="w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="search"
                className="outline-none py-1"
              />
            </div>
            <button className="flex items-center gap-1 border px-3 py-1 rounded-md">
              <Import className="w-4 h-4" /> Import
            </button>
            <button className="flex items-center gap-1 border px-3 py-1 rounded-md">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-1 border px-3 py-1 rounded-md">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">NO</th>
                <th className="border px-4 py-2">Photo</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Username</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Type of Report</th>
                <th className="border px-4 py-2">Select Option</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((user) => (
                <tr key={user.id}>
                  <td className="border px-4 py-2 text-center">{user.id}</td>
                  <td className="border px-4 py-2 text-center">
                    <img
                      src={user.photo}
                      alt="user"
                      className="w-12 h-12 object-cover rounded-full mx-auto"
                    />
                  </td>
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.phone}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">
                    <span className="bg-gray-200 text-xs px-2 py-1 rounded-md">
                      {user.reportType}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="relative inline-block text-left">
                      <button
                        className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 px-3 py-1 text-sm font-medium bg-white hover:bg-gray-50"
                        onClick={() => handleDropdown(user.id)}
                      >
                        {selectedActions[user.id] || "Select Option"}{" "}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      {openDropdown === user.id && (
                        <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white border shadow-lg z-10">
                          <div className="py-1">
                            {actions.map((action) => (
                              <div
                                key={action}
                                className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelectAction(user.id, action)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportUser;
