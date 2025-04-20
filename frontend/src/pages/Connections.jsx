import React from "react";
import Case from "../components/Case";
import { Link } from "react-router-dom";
import Profile from "../assets/img/logo-evo-2.png";
import { Briefcase, MapPin, Mail } from "lucide-react";

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

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Card Content */}
                <div className="pt-6 pb-6 px-6 text-left">
                  {/* Avatar, Name, and Connect Button */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 shadow">
                        <img
                          src={Profile}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-500">Name User</h3>
                        <p className="text-gray-600 text-sm">Role</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mb-4">
  <button className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition">
    Connect
  </button>
</div>


                  {/* Detail Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} />
                      <span>Company</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span className="text-blue-600 hover:underline">Email</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-6">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Manage network */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Manage my network</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="border-b pb-4">
                  <Link to="/list-connection" className="flex justify-between">
                    <span>Connections</span> <span>0</span>
                  </Link>
                </li>
                <li className="border-b pb-4">
                  <Link to="/messages" className="flex justify-between">
                    <span>Contacts</span> <span>869</span>
                  </Link>
                </li>
                <li className="border-b pb-4">
                  <Link to="/groups" className="flex justify-between">
                    <span>Groups</span> <span>0</span>
                  </Link>
                </li>
                <li>
                  <Link to="/hashtags" className="flex justify-between">
                    <span>Hashtag</span> <span>8</span>
                  </Link>
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
