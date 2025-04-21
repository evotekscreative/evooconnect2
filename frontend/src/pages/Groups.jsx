import React, { useState } from "react";
import Case from "../components/Case";
import { Link } from "react-router-dom";

export default function Groups() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Case>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Main Section */}
          <div className="md:col-span-3 space-y-4 bg-white rounded-xl shadow p-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-semibold">Groups</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Group
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-4">
              <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                My Groups
              </button>
              <button className="px-4 py-2 text-gray-500">
                Group Invitations
              </button>
            </div>

            {/* Group List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Group Card */}
              <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-40">
                <div className="flex items-center space-x-3 border-b pb-4">
                  <div className="bg-gray-300 w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src="#"
                      alt="Group Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium capitalize text-blue-500">Name Group</div>
                    <div className="text-gray-500 text-sm">12 Members</div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                <Link to="/group-page">
                  <button className="bg-gradient-to-r bg-gray-100 hover:bg-gray-200 text-gray-800 text-white font-medium px-4 py-1.5 rounded">
                    View Group
                  </button>
                </Link>
                </div>
              </div>
            </div>
          </div>
          

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* Group Statistics */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Group Statistics</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex justify-between border-b pb-4">
                  <span>Total Groups</span>
                  <span>0</span>
                </li>
                <li className="flex justify-between border-b pb-4">
                  <span>My Groups</span>
                  <span>0</span>
                </li>
              </ul>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Groups You Might Like</h3>
              <p className="text-sm text-gray-500 mb-2">
                You've joined all available groups.
              </p>
              <button className="text-blue-600 text-sm hover:underline">
                Show all →
              </button>
            </div>
          </div>
        </div>

        {/* Modal Create Group */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Group Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter group description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Group Photo</label>
                  <input
                    type="file"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Simpan logic submit di sini
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Case>
  );
}
