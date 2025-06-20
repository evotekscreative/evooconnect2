import { useState, useEffect } from "react";
import axios from "axios";

const base_url = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function GroupsTabs({ activeTab, setActiveTab }) {
  const [invitationCount, setInvitationCount] = useState(0);
  const [joinRequestCount, setJoinRequestCount] = useState(0);
  
  // Fetch counts for invitations and join requests
// Fetch counts for invitations and join requests
useEffect(() => {
  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axios.get(
        `${base_url}/api/count-request-invitation`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.data) {
        setInvitationCount(response.data.data.group_invitations || 0);
        setJoinRequestCount(response.data.data.connection_requests || 0);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };
  
  fetchCounts();
  
  // Refresh counts every minute
  const interval = setInterval(fetchCounts, 60000);
  return () => clearInterval(interval);
}, []);

  
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("myGroups")}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === "myGroups"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Groups
        </button>
        <button
          onClick={() => setActiveTab("allGroups")}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === "allGroups"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Groups
        </button>
        <button
          onClick={() => setActiveTab("joinRequests")}
          className={`px-3 py-2 text-sm font-medium relative ${
            activeTab === "joinRequests"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Join Requests
          {joinRequestCount > 0 && (
            <span className="absolute top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {joinRequestCount > 99 ? "99+" : joinRequestCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`px-3 py-2 text-sm font-medium relative ${
            activeTab === "invitations"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Invitations
          {invitationCount > 0 && (
            <span className="absolute top-0 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {invitationCount > 99 ? "99+" : invitationCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
