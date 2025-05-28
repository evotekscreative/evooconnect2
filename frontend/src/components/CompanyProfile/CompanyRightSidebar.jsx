import React from 'react';
import job1 from "../../assets/img/job1.png";

export default function CompanyRightSidebar({
  isFollowingAmazon,
  setIsFollowingAmazon,
  isConnectedSophia,
  setIsConnectedSophia
}) {
  return (
    <div className="lg:col-span-3 space-y-3">
      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-4">Similar Pages</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={job1} alt="Amazon" className="w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <p className="font-medium">Amazon</p>
              <p className="text-sm text-gray-400">Internet</p>
            </div>
          </div>
          <button
            onClick={() => setIsFollowingAmazon(!isFollowingAmazon)}
            className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${isFollowingAmazon ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isFollowingAmazon ? " Followed" : "+ Follow"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-4">People Also Viewed</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={job1} alt="Profile" className="w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <p className="font-medium">Sophia Lee</p>
              <p className="text-sm text-gray-400">@Harvard</p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectedSophia(!isConnectedSophia)}
            className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${isConnectedSophia ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isConnectedSophia ? " Connected" : "Connect"}
          </button>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-md text-center">
        <p className="font-bold text-lg mb-1">EVOConnect Premium</p>
        <p className="text-sm text-gray-700">Grow & nurture your network</p>
        <button className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-4 rounded">
          ACTIVATE
        </button>
      </div>
    </div>
  );
}