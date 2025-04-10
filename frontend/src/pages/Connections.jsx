import React from "react";
import Case from "../components/Case";


export default function ConnectionSuggestions() {
  return (
    <Case>
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left side - People suggestions */}
        <div className="md:col-span-3 space-y-4 bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold border-b pb-4">More suggestions for you</h2>
          <div className="border-b border-gray-300">
            <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">People</button>
            <button className="px-4 py-2 text-gray-500">Invitations</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center space-x-3 border-b pb-4">
                  <div className="bg-gray-300 w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold">
                    <img src="#" alt="Profile" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium capitalize">Name User</div>
                    <div className="text-gray-500 text-sm">No information yet.</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-blue-600 text-sm cursor-pointer border-b pb-4">4 mutual connections</div>
                </div>

                <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-1.5 rounded">
                  Connect
                </button>
              </div>
          </div>
        </div>

        {/* Right side - Manage network */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-medium mb-2 border-b pb-4">Manage my network</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex justify-between border-b pb-4">
                <span>Connections</span> <span>0</span>
              </li>
              <li className="flex justify-between border-b pb-4">
                <span>Contacts</span> <span>869</span>
              </li>
              <li className="flex justify-between border-b pb-4">
                <span>Groups</span> <span>0</span>
              </li>
              <li className="flex justify-between ">
                <span>Hashtag</span> <span>8</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-4 text-center">
            <img src="/mnt/data/image.png" alt="Profile" className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" />
            <p className="text-sm font-medium mb-1">
              Gurdeep, grow your career by following <span className="text-blue-600">Askbootsrap</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">Stay up-to industry trends!</p>
            <button className="border border-blue-500 text-blue-500 rounded px-4 py-1 text-sm font-medium">
              FOLLOW
            </button>
          </div>
        </div>
      </div>
    </div>
    </Case>
  );
}