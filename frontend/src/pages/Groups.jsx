import React, { useState, useEffect } from "react";
import Case from "../components/Case";
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft, ChevronDown, ChevronUp, User, Check, X } from "lucide-react";
import axios from 'axios';
import { toast } from "sonner";

const base_url = "http://localhost:3000";

export default function Groups() {
  const [showModal, setShowModal] = useState(false);
  const [showAllAdminGroups, setShowAllAdminGroups] = useState(false);
  const [showAllJoinedGroups, setShowAllJoinedGroups] = useState(false);
  const [activeTab, setActiveTab] = useState('myGroups');
  const [invitations, setInvitations] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    rule: "",
    privacy_level: "public",
    invite_policy: "admin",
    image: null,
    imagePreview: null
  });

  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch groups where user is admin
  const fetchAdminGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return [];
      }

      const response = await axios.get(`${base_url}/api/my-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Pastikan response.data memiliki struktur yang benar
      let groups = [];
      if (response.data && Array.isArray(response.data.data)) {
        groups = response.data.data;
      } else if (Array.isArray(response.data)) {
        groups = response.data;
      }

      setAdminGroups(groups);
      return groups;
    } catch (error) {
      console.error("Failed to fetch admin groups:", error);
      toast.error("Failed to load your groups");
      setAdminGroups([]);
      return [];
    }
  };

  // Fetch groups where user is member but not admin
  const fetchJoinedGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return [];
      }

      console.log("Fetching joined groups...");
      const response = await axios.get(`${base_url}/api/groups/joined`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Joined groups response:", response.data);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setJoinedGroups(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch joined groups:", error);
      toast.error("Failed to load joined groups");
      setJoinedGroups([]);
      return [];
    }
  };

  const fetchAllGroups = async () => {
    await Promise.all([fetchAdminGroups(), fetchJoinedGroups()]);
  };

  useEffect(() => {
    fetchAllGroups();
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.get(`${base_url}/api/groups/invitations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const invitationsData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setInvitations(invitationsData);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      toast.error("Failed to load invitations");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupForm((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Improved create group function with better error handling
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!groupForm.name.trim()) {
      setError("Group name is required");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", groupForm.name.trim());
      formData.append("description", groupForm.description.trim());
      formData.append("rule", groupForm.rule.trim());
      formData.append("privacy_level", groupForm.privacy_level);
      formData.append("invite_policy", groupForm.invite_policy);
      if (groupForm.image) {
        formData.append("image", groupForm.image);
      }

      const response = await axios.post(`${base_url}/api/groups`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Check for successful response (status code 2xx)
      if (response.status >= 200 && response.status < 300) {
        toast.success("Group created successfully!");
        setShowModal(false);
        setGroupForm({
          name: "",
          description: "",
          rule: "",
          privacy_level: "public",
          invite_policy: "admin",
          image: null,
          imagePreview: null
        });
        await fetchAdminGroups();
      } else {
        throw new Error(response.data?.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create group";
      setError(errorMessage);
      toast.error(`Failed to create group: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await axios.delete(`${base_url}/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the deleted group from adminGroups
      setAdminGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success("Group deleted successfully!");
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this group? You'll need to be invited to join again.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await axios.delete(`${base_url}/api/groups/${groupId}/leave`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the left group from joinedGroups
      setJoinedGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success("You have left the group");
    } catch (error) {
      console.error("Failed to leave group:", error);
      toast.error("Failed to leave group");
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.post(`${base_url}/api/groups/invitations/${invitationId}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      // Add the accepted group to joinedGroups
      if (response.data?.group) {
        setJoinedGroups(prev => [response.data.group, ...prev]);
      }

      toast.success("Invitation accepted!");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation");
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await axios.post(`${base_url}/api/groups/invitations/${invitationId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      toast.success("Invitation rejected");
    } catch (error) {
      console.error("Failed to reject invitation:", error);
      toast.error("Failed to reject invitation");
    }
  };

  const showcaseAdminGroups = showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3);
  const showcaseJoinedGroups = showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3);
  const pendingInvitations = invitations.filter(inv => inv.status === "pending");

  return (
    <Case>
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Section */}
          <div className="lg:col-span-3 space-y-4 bg-white rounded-xl shadow p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="mr-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold">Groups</h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Group
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-4">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('myGroups')}
                  className={`px-4 py-2 border-b-2 ${activeTab === 'myGroups' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} font-medium whitespace-nowrap`}
                >
                  My Groups
                </button>
                <button
                  onClick={() => setActiveTab('invitations')}
                  className={`px-4 py-2 border-b-2 ${activeTab === 'invitations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} font-medium whitespace-nowrap`}
                >
                  Group Invitations
                  {pendingInvitations.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {pendingInvitations.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'myGroups' ? (
              <>
                {/* Groups You Created */}
                {adminGroups.length > 0 && (
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="text-lg font-medium">Groups You Created</h3>
                      {adminGroups.length > 3 && (
                        <button
                          onClick={() => setShowAllAdminGroups(!showAllAdminGroups)}
                          className="text-blue-600 text-sm flex items-center"
                        >
                          {showAllAdminGroups ? (
                            <>
                              <ChevronUp size={16} className="mr-1" /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} className="mr-1" /> Show All ({adminGroups.length})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {showcaseAdminGroups.map((group) => (
                        <div
                          key={`admin-group-${group.id}`}
                          className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <div className="bg-gray-200 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center">
                              {group.image ? (
                                <img
                                  src={group.image}
                                  alt={group.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-medium text-gray-600">{group.name?.charAt(0) || "?"}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">
                                {group.name || "Unnamed Group"}
                              </div>
                              <div className="text-gray-500 text-xs sm:text-sm">
                                {group.members_count || 0} Members
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Created on {group.created_at?.split('T')[0] || "Unknown date"}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <Link
                              to={`/groups/${group.id}`}
                              className="text-xs sm:text-sm text-blue-600 hover:underline"
                            >
                              View Group
                            </Link>
                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-xs sm:text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Groups You've Joined */}
                {joinedGroups.length > 0 && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="text-lg font-medium">Groups You've Joined</h3>
                      {joinedGroups.length > 3 && (
                        <button
                          onClick={() => setShowAllJoinedGroups(!showAllJoinedGroups)}
                          className="text-blue-600 text-sm flex items-center"
                        >
                          {showAllJoinedGroups ? (
                            <>
                              <ChevronUp size={16} className="mr-1" /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} className="mr-1" /> Show All ({joinedGroups.length})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {showcaseJoinedGroups.map((group) => (
                        <div
                          key={`joined-group-${group.id}`}
                          className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <div className="bg-gray-200 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center">
                              {group.image ? (
                                <img
                                  src={group.image}
                                  alt={group.name || 'Group'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-medium text-gray-600">
                                  {group.name?.charAt(0)?.toUpperCase() || "G"}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">{group.name || 'Unnamed Group'}</div>
                              <div className="text-gray-500 text-xs sm:text-sm">{group.members_count || 0} Members</div>
                              <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Joined on {group.joined_at || group.created_at ? new Date(group.joined_at || group.created_at).toLocaleDateString() : 'Unknown date'}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <Link
                              to={`/groups/${group.id}`}
                              className="text-xs sm:text-sm text-blue-600 hover:underline"
                            >
                              View Group
                            </Link>
                            <button
                              onClick={() => handleLeaveGroup(group.id)}
                              className="flex items-center text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
                              title="Leave Group"
                            >
                              <LogOut size={14} className="mr-1" /> Leave
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {adminGroups.length === 0 && joinedGroups.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">You haven't joined any groups yet.</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Create your first group
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pending Invitations</h3>

                {pendingInvitations.length > 0 ? (
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={`pending-invite-${invitation.id}`}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
                            {invitation.inviter?.avatar ? (
                              <img
                                src={invitation.inviter.avatar}
                                alt={invitation.inviter?.name || 'User'}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <User size={20} className="text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{invitation.inviter?.name || 'Unknown User'}</div>
                            <p className="text-sm text-gray-600">
                              Invited you to join <span className="font-medium">{invitation.group?.name || 'Unknown Group'}</span>
                            </p>
                            <div className="mt-1 text-xs text-gray-500">
                              {invitation.group?.members_count || 0} members
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={() => handleRejectInvitation(invitation.id)}
                            className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
                          >
                            <X size={16} className="mr-1" /> Decline
                          </button>
                          <button
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                          >
                            <Check size={16} className="mr-1" /> Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any pending invitations.</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium">Invitation History</h3>
                  <div className="mt-2 space-y-2">
                    {invitations.filter(inv => inv.status !== "pending").length > 0 ? (
                      invitations
                        .filter(inv => inv.status !== "pending")
                        .map((invitation) => (
                          <div
                            key={`history-invite-${invitation.id}`}
                            className="flex items-center justify-between p-2 border-b"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                                {invitation.inviter?.avatar ? (
                                  <img
                                    src={invitation.inviter.avatar}
                                    alt={invitation.inviter?.name || 'User'}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <User size={14} className="text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm">
                                  {invitation.inviter?.name || 'Unknown User'}'s invitation to {invitation.group?.name || 'Unknown Group'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {invitation.updated_at ? new Date(invitation.updated_at).toLocaleDateString() : 'Unknown date'}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${invitation.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {invitation.status === "accepted" ? "Accepted" : "Declined"}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 py-2">No invitation history yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Group Statistics */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Group Statistics</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex justify-between border-b pb-4">
                  <span>Total Groups</span>
                  <span>{adminGroups.length + joinedGroups.length}</span>
                </li>
                <li className="flex justify-between border-b pb-4">
                  <span>Groups Created</span>
                  <span>{adminGroups.length}</span>
                </li>
                <li className="flex justify-between">
                  <span>Groups Joined</span>
                  <span>{joinedGroups.length}</span>
                </li>
              </ul>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-4">Groups You Might Like</h3>
              {(adminGroups.length + joinedGroups.length) < 3 ? (
                <>
                  <p className="text-sm text-gray-500 mb-2">
                    Here are some suggestions for you:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm truncate">JavaScript Developers</span>
                      <button className="text-blue-600 text-xs hover:underline whitespace-nowrap ml-2">
                        Join
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm truncate">UI/UX Designers</span>
                      <button className="text-blue-600 text-xs hover:underline whitespace-nowrap ml-2">
                        Join
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 mb-2">
                  You're active in many groups. Keep it up!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Create Group */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>

              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateGroup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Group Name</label>
                    <input
                      type="text"
                      name="name"
                      value={groupForm.name}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      value={groupForm.description}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      placeholder="Enter group description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Rules</label>
                    <textarea
                      name="rule"
                      value={groupForm.rule}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      placeholder="Enter group rules"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Privacy Level</label>
                    <select
                      name="privacy_level"
                      value={groupForm.privacy_level}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Invite Policy</label>
                    <select
                      name="invite_policy"
                      value={groupForm.invite_policy}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                    >
                      <option value="admin">Admin Only</option>
                      <option value="anyone">Anyone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Group Photo</label>
                    <input
                      type="file"
                      className="mt-1 text-sm"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {groupForm.imagePreview && (
                      <div className="mt-2">
                        <img
                          src={groupForm.imagePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Case>
  );
}