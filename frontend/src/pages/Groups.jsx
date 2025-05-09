import React, { useState } from "react";
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
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule: '',
    privacy_level: 'public',
    invite_policy: 'admin',
    image: null
  });

  // State for groups data - initialize as empty array
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for invitations
  const [invitations, setInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState('myGroups');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user's groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/my-groups', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Validate and normalize the groups data
        const groupsData = Array.isArray(response.data)
          ? response.data.map(group => ({
            id: group.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            name: group.name || 'Unnamed Group',
            description: group.description || '',
            rule: group.rule || '',
            privacy_level: group.privacy_level || 'public',
            invite_policy: group.invite_policy || 'admin',
            image: group.image || null,
            member_count: group.member_count || 0,
            is_admin: group.is_admin || false,
            created_at: group.created_at || new Date().toISOString(),
            joined_at: group.joined_at || new Date().toISOString()
          }))
          : [];

        setGroups(groupsData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch groups');
        setLoading(false);
        setGroups([]);
      }
    };

    // Fetch invitations
    const fetchInvitations = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/my-invitations', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setInvitations(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch invitations:", err);
        setInvitations([]);
      }
    };

    fetchGroups();
    fetchInvitations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  // Handle group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('rule', formData.rule);
      formDataToSend.append('privacy_level', formData.privacy_level);
      formDataToSend.append('invite_policy', formData.invite_policy);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('http://localhost:3000/api/groups', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Add the new group to the state
      const newGroup = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        rule: response.data.rule,
        privacy_level: response.data.privacy_level,
        invite_policy: response.data.invite_policy,
        image: response.data.image,
        member_count: 1,
        is_admin: true,
        created_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      };

      setGroups(prev => [newGroup, ...prev]);
      setShowModal(false);
      setSuccessMessage('Group created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form
      setFormData({
        name: '',
        description: '',
        rule: '',
        privacy_level: 'public',
        invite_policy: 'admin',
        image: null
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group');
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3000/api/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setGroups(groups.filter(group => group.id !== groupId));
        setSuccessMessage('Group deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  // Handle leaving a group
  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group? You'll need to be invited to join again.")) {
      try {
        await axios.post(`http://localhost:3000/api/groups/${groupId}/leave`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setGroups(groups.filter(group => group.id !== groupId));
        setSuccessMessage('You have left the group');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to leave group');
      }
    }
  };

  // Handle accepting an invitation
  const handleAcceptInvitation = async (invitationId) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/invitations/${invitationId}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update invitations list
      const updatedInvitations = invitations.map(inv =>
        inv.id === invitationId ? { ...inv, status: "accepted" } : inv
      );
      setInvitations(updatedInvitations);

      // Add the group to the user's groups
      if (response.data && response.data.group) {
        const groupData = response.data.group;
        setGroups(prev => [...prev, {
          id: groupData.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          name: groupData.name || 'Unnamed Group',
          description: groupData.description || '',
          rule: groupData.rule || '',
          privacy_level: groupData.privacy_level || 'public',
          invite_policy: groupData.invite_policy || 'admin',
          image: groupData.image || null,
          member_count: groupData.member_count || 0,
          is_admin: false,
          joined_at: new Date().toISOString()
        }]);
      }

      setSuccessMessage('Invitation accepted!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  // Handle rejecting an invitation
  const handleRejectInvitation = async (invitationId) => {
    try {
      await axios.post(`http://localhost:3000/api/invitations/${invitationId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const updatedInvitations = invitations.map(inv =>
        inv.id === invitationId ? { ...inv, status: "rejected" } : inv
      );
      setInvitations(updatedInvitations);

      setSuccessMessage('Invitation declined');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject invitation');
    }
  };

  // Separate admin groups and joined groups
  const adminGroups = Array.isArray(groups) ? groups.filter(group => group.is_admin) : [];
  const joinedGroups = Array.isArray(groups) ? groups.filter(group => !group.is_admin) : [];
  const pendingInvitations = Array.isArray(invitations) ? invitations.filter(inv => inv.status === "pending") : [];

  // Get first 3 groups for showcase
  const showcaseAdminGroups = showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3);
  const showcaseJoinedGroups = showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3);

  if (loading) {
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
                              to={`/group-page`}
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
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Group Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
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
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      placeholder="Enter group description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Group Rules</label>
                    <textarea
                      name="rule"
                      value={formData.rule}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      placeholder="Enter group rules"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Privacy Level *</label>
                    <select
                      name="privacy_level"
                      value={formData.privacy_level}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      required
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Invite Policy *</label>
                    <select
                      name="invite_policy"
                      value={formData.invite_policy}
                      onChange={handleInputChange}
                      className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                      required
                    >
                      <option value="admin">Admin Only</option>
                      <option value="member">All Members</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Group Photo</label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      className="mt-1 text-sm"
                      accept="image/*"
                    />
                  </div>
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