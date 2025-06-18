import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const LoadingSpinner = ({ size = 16 }) => (
  <div className="animate-spin">
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  </div>
);

const NetworkManager = () => {
  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const fetchGroups = async () => {
    setGroupsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [adminResponse, allGroupsResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/my-groups`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/groups`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const adminGroupsData = Array.isArray(adminResponse.data.data)
        ? adminResponse.data.data
        : [];

      const adminGroupIds = adminGroupsData.map(group => group.id);
      const joinedGroupsData = Array.isArray(allGroupsResponse.data.data)
        ? allGroupsResponse.data.data
          .filter(group => group.joined_at && !adminGroupIds.includes(group.id))
        : [];

      setAdminGroups(adminGroupsData);
      setJoinedGroups(joinedGroupsData);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${apiUrl}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data.data?.conversations || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setContactsLoading(false);
    }
  };

  const fetchConnections = async () => {
    setConnectionsLoading(true);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      console.error("User ID not found");
      setConnectionsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/users/${userId}/connections?limit=10&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnections(response.data.data?.connections || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setConnectionsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchContacts();
    fetchConnections();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold mb-4 border-b pb-3 text-base sm:text-lg">
        Manage my network
      </h3>
      <ul className="text-sm sm:text-base text-gray-800 space-y-2">
        <li className="border-b pb-3">
          <Link
            to="/list-connection"
            className="flex justify-between items-center hover:text-blue-600 transition"
          >
            <span className="font-medium">Connections</span>
            {connectionsLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
                {connections.length}
              </span>
            )}
          </Link>
        </li>
        <li className="border-b pb-3">
          <Link
            to="/messages"
            className="flex justify-between items-center hover:text-blue-600 transition"
          >
            <span className="font-medium">Contacts</span>
            {contactsLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
                {contacts.length}
              </span>
            )}
          </Link>
        </li>
        <li className="border-b pb-3">
          <Link
            to="/groups"
            className="flex justify-between items-center hover:text-blue-600 transition"
          >
            <span className="font-medium">Groups</span>
            {groupsLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
                {adminGroups.length + joinedGroups.length}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NetworkManager;