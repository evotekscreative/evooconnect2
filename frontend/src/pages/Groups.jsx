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
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    rule: "",
    privacy_level: "public",
    invite_policy: "admin",
    image: null,
  });

  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([
    {
      id: 1,
      group: {
        id: 101,
        name: "Web Development Group",
        members: 25,
      },
      inviter: {
        id: 2,
        name: "Mike Johnson",
      },
      status: "pending"
    },
    {
      id: 2,
      group: {
        id: 102,
        name: "React Enthusiasts",
        members: 8,
      },
      inviter: {
        id: 3,
        name: "Sarah Williams",
      },
      status: "pending"
    },
    {
      id: 3,
      group: {
        id: 103,
        name: "UI/UX Designers",
        members: 15,
      },
      inviter: {
        id: 4,
        name: "Alex Chen",
      },
      status: "pending"
    }
  ]);

  useEffect(() => {
    fetchMyGroups();
    fetchJoinedGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/my-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const adminGroups = response.data.data.map(group => ({
        ...group,
        isAdmin: true,
        createdDate: new Date(group.created_at).toLocaleDateString()
      }));
      setGroups(prev => [...adminGroups, ...prev.filter(g => !g.isAdmin)]);
    } catch (error) {
      console.error("Failed to fetch my groups:", error);
      toast.error("Failed to load your groups");
    }
  };

  const fetchJoinedGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter out groups that user is admin of
      const joinedGroups = response.data.data
        .filter(group => !group.is_admin) // Ensure we don't include admin groups
        .map(group => ({
          ...group,
          isAdmin: false,
          joinedDate: new Date().toISOString().split('T')[0] // Mock joined date
        }));
      
      setGroups(prev => [...prev.filter(g => g.isAdmin), ...joinedGroups]);
    } catch (error) {
      console.error("Failed to fetch joined groups:", error);
      toast.error("Failed to load joined groups");
    }
  };

  // Memisahkan grup admin dan grup yang diikuti
  const adminGroups = groups.filter(group => group.isAdmin);
  const joinedGroups = groups.filter(group => !group.isAdmin);

  // Get first 3 groups for showcase
  const showcaseAdminGroups = showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3);
  const showcaseJoinedGroups = showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3);

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group? You'll need to be invited to join again.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${base_url}/api/groups/${groupId}/leave`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroups(groups.filter(group => group.id !== groupId));
        toast.success("You have left the group");
      } catch (error) {
        console.error("Failed to leave group:", error);
        toast.error(error.response?.data?.message || "Failed to leave group");
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${base_url}/api/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroups(groups.filter(group => group.id !== groupId));
        toast.success("Group deleted successfully");
      } catch (error) {
        console.error("Failed to delete group:", error);
        toast.error(error.response?.data?.message || "Failed to delete group");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setGroupForm((prev) => ({ ...prev, photo: file }));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", groupForm.name);
      formData.append("description", groupForm.description);
      formData.append("rule", groupForm.rule);
      formData.append("privacy_level", groupForm.privacy_level);
      formData.append("invite_policy", groupForm.invite_policy);
      if (groupForm.image) {
        formData.append("photo", groupForm.image);
      }

      const response = await axios.post(`${base_url}/api/groups`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const newGroup = {
        ...response.data.data,
        isAdmin: true,
        createdDate: new Date().toISOString().split('T')[0]
      };

      // Add to the beginning of the groups array and ensure it's marked as admin group
      setGroups(prev => [newGroup, ...prev.filter(g => g.id !== newGroup.id)]);
      toast.success("Group created successfully!");

      setGroupForm({
        name: "",
        description: "",
        rule: "",
        privacy_level: "public",
        invite_policy: "admin",
        image: null,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create group:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to create group");
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = (invitationId) => {
    const updatedInvitations = invitations.map(inv =>
      inv.id === invitationId ? { ...inv, status: "accepted" } : inv
    );
    setInvitations(updatedInvitations);

    const acceptedInvitation = invitations.find(inv => inv.id === invitationId);
    const newGroup = {
      id: acceptedInvitation.group.id,
      name: acceptedInvitation.group.name,
      members: acceptedInvitation.group.members,
      isAdmin: false,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setGroups([...groups.filter(g => g.id !== newGroup.id), newGroup]);
  };

  const handleRejectInvitation = (invitationId) => {
    const updatedInvitations = invitations.map(inv =>
      inv.id === invitationId ? { ...inv, status: "rejected" } : inv
    );
    setInvitations(updatedInvitations);
  };

  const pendingInvitations = invitations.filter(inv => inv.status === "pending");

    return (
      <div className={`${group.isAdmin ? 'bg-blue-100' : 'bg-gray-200'} w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center`}>
        <span className={`${group.isAdmin ? 'text-blue-600' : 'text-gray-600'} text-lg sm:text-xl font-bold`}>
          {group.name.charAt(0)}
        </span>
      </div>
    );
  };

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
                        <div key={group.id} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" 
                            src={"http://localhost:3000/" + group.image || "https://via.placeholder.com/150"} 
                            alt={group.name} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">{group.name}</div>
                              <div className="text-gray-500 text-xs sm:text-sm">{group.members_count || 0} Members</div>
                              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Created on {group.createdDate}
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
                              className="flex items-center text-red-600 hover:text-red-800 text-xs sm:text-sm"
                              title="Delete Group"
                            >
                              <Trash2 size={14} className="mr-1" /> Delete
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
                        <div key={group.id} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" 
                            src={"http://localhost:3000/" + group.image || "https://via.placeholder.com/150"} 
                            alt={group.name} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">{group.name}</div>
                              <div className="text-gray-500 text-xs sm:text-sm">{group.members_count || 0} Members</div>
                              <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Joined on {group.joinedDate}
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
                {groups.length === 0 && (
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
                      <div key={invitation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{invitation.inviter.name}</div>
                            <p className="text-sm text-gray-600">
                              Invited you to join <span className="font-medium">{invitation.group.name}</span>
                            </p>
                            <div className="mt-1 text-xs text-gray-500">
                              {invitation.group.members} members
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
                          <div key={invitation.id} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center space-x-2">
                              <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                                <User size={14} className="text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm">
                                  {invitation.inviter.name}'s invitation to {invitation.group.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date().toLocaleDateString()}
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
                  <span>{groups.length}</span>
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
              {groups.length < 3 ? (
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
                  You've joined all available groups.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Create Group */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Create New Group</h3>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={groupForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={groupForm.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rules</label>
                  <textarea
                    name="rule"
                    value={groupForm.rule}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Level *</label>
                  <select
                    name="privacy_level"
                    value={groupForm.privacy_level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invite Policy *</label>
                  <select
                    name="invite_policy"
                    value={groupForm.invite_policy}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin Only</option>
                    <option value="member">All Members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Photo</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Case>
);