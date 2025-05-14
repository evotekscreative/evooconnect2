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
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
=======
  const [activeTab, setActiveTab] = useState('myGroups');
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
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

  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  useEffect(() => {
    fetchGroupsData();
    fetchInvitations();
  }, []);

<<<<<<< HEAD
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
    setIsLoading(true);
=======
  const fetchGroupsData = async () => {
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
    try {
      const token = localStorage.getItem("token");
      setIsLoading(true);
      
      const [adminResponse, joinedResponse] = await Promise.all([
        axios.get(`${base_url}/api/my-groups`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${base_url}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const adminGroupsData = Array.isArray(adminResponse.data) 
        ? adminResponse.data.map(group => ({
            ...group,
            isAdmin: true,
            createdDate: group.created_at ? group.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          }))
        : [];

      const joinedGroupsData = Array.isArray(joinedResponse.data.data)
        ? joinedResponse.data.data
            .filter(group => !adminGroupsData.some(adminGroup => adminGroup.id === group.id))
            .map(group => ({
              ...group,
              isAdmin: false,
              joinedDate: group.joined_at ? group.joined_at.split('T')[0] : new Date().toISOString().split('T')[0]
            }))
        : [];

<<<<<<< HEAD
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
      toast.error(err.response?.data?.message || 'Failed to create group');
=======
      setAdminGroups(adminGroupsData);
      setJoinedGroups(joinedGroupsData);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to load groups");
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
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
        toast.error(err.response?.data?.message || 'Failed to delete group');
      }
=======
  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map API response to our invitation format
      const formattedInvitations = response.data.map(invite => ({
        id: invite.id,
        group: {
          id: invite.group.id,
          name: invite.group.name,
          members: invite.group.members_count || 0,
          image: invite.group.image
        },
        inviter: {
          id: invite.inviter.id,
          name: invite.inviter.name
        },
        status: "pending"
      }));
      
      setInvitations(formattedInvitations);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoadingInvitations(false);
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
    }
  };

  const showcaseAdminGroups = showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3);
  const showcaseJoinedGroups = showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3);

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group? You'll need to be invited to join again.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${base_url}/api/groups/${groupId}/leave`, {
          headers: { Authorization: `Bearer ${token}` }
        });
<<<<<<< HEAD
        setGroups(groups.filter(group => group.id !== groupId));
        setSuccessMessage('You have left the group');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to leave group');
=======
        setJoinedGroups(joinedGroups.filter(group => group.id !== groupId));
        toast.success("You have left the group");
      } catch (error) {
        console.error("Failed to leave group:", error);
        toast.error(error.response?.data?.message || "Failed to leave group");
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${base_url}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminGroups(adminGroups.filter(group => group.id !== groupId));
        toast.success("Group deleted successfully");
      } catch (error) {
        console.error("Failed to delete group:", error);
        toast.error(error.response?.data?.message || "Failed to delete group");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setGroupForm(prev => ({ ...prev, image: file }));
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

      setAdminGroups(prev => [newGroup, ...prev]);
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
      console.error("Failed to create group:", error);
      setError(error.response?.data?.message || "Failed to create group");
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${base_url}/api/invitations/${invitationId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the invitation status
      const updatedInvitations = invitations.map(inv =>
        inv.id === invitationId ? { ...inv, status: "accepted" } : inv
      );
      setInvitations(updatedInvitations);

      // Add the group to joined groups
      const acceptedInvitation = invitations.find(inv => inv.id === invitationId);
      const newGroup = {
        id: acceptedInvitation.group.id,
        name: acceptedInvitation.group.name,
        members_count: acceptedInvitation.group.members,
        isAdmin: false,
        joinedDate: new Date().toISOString().split('T')[0],
        image: acceptedInvitation.group.image || ""
      };
      setJoinedGroups(prev => [...prev, newGroup]);

<<<<<<< HEAD
      setSuccessMessage('Invitation accepted!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
=======
      toast.success("Invitation accepted successfully!");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error(error.response?.data?.message || "Failed to accept invitation");
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${base_url}/api/invitations/${invitationId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the invitation status
      const updatedInvitations = invitations.map(inv =>
        inv.id === invitationId ? { ...inv, status: "rejected" } : inv
      );
      setInvitations(updatedInvitations);

<<<<<<< HEAD
      setSuccessMessage('Invitation declined');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject invitation');
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
      <Case>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Case>
    );
  }
=======
      toast.success("Invitation rejected successfully!");
    } catch (error) {
      console.error("Failed to reject invitation:", error);
      toast.error(error.response?.data?.message || "Failed to reject invitation");
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === "pending");
  const processedInvitations = invitations.filter(inv => inv.status !== "pending");
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd

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
                        <div key={`admin-${group.id}`} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <img 
<<<<<<< HEAD
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" 
                              src={group.image ? `${base_url}/${group.image}` : "https://via.placeholder.com/150"} 
                              alt={group.name} 
=======
                              className="w-10 h-10 rounded-full" 
                              src={group.image ? `${base_url}/${group.image}` : "/default-group.png"} 
                              alt="Group" 
                              onError={(e) => {
                                e.target.src = "/default-group.png";
                              }}
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">{group.name}</div>
                              <div className="text-gray-500 text-xs sm:text-sm">{group.member_count || 0} Members</div>
                              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Created on {new Date(group.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3">
<<<<<<< HEAD
                            <Link 
=======
                            <Link
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
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
                        <div key={`joined-${group.id}`} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <img 
<<<<<<< HEAD
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" 
                              src={group.image ? `${base_url}/${group.image}` : "https://via.placeholder.com/150"} 
                              alt={group.name} 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">{group.name}</div>
                              <div className="text-gray-500 text-xs sm:text-sm">{group.member_count || 0} Members</div>
=======
                              className="w-10 h-10 rounded-full" 
                              src={group.image ? `${base_url}/${group.image}` : "/default-group.png"} 
                              alt="Group"
                              onError={(e) => {
                                e.target.src = "/default-group.png";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize text-blue-500 truncate">{group.name}</div>
                              <div className="text-gray-500 text-xs sm:text-sm">{group.members_count} Members</div>
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
                              <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Joined on {new Date(group.joined_at).toLocaleDateString()}
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

                {loadingInvitations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : pendingInvitations.length > 0 ? (
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div key={`invite-${invitation.id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <img 
                              className="w-10 h-10 rounded-full" 
                              src={invitation.group.image ? `${base_url}/${invitation.group.image}` : "/default-group.png"} 
                              alt="Group"
                              onError={(e) => {
                                e.target.src = "/default-group.png";
                              }}
                            />
                          </div>
                          <div className="flex-1">
<<<<<<< HEAD
                            <div className="font-medium text-gray-900">{invitation.inviter?.name || 'Unknown user'}</div>
                            <p className="text-sm text-gray-600">
                              Invited you to join <span className="font-medium">{invitation.group?.name || 'Unknown group'}</span>
=======
                            <div className="font-medium text-gray-900">{invitation.group.name}</div>
                            <p className="text-sm text-gray-600">
                              Invited by <span className="font-medium">{invitation.inviter.name}</span>
>>>>>>> faab8b12d402bdb372b5729ced9806eaf54539fd
                            </p>
                            <div className="mt-1 text-xs text-gray-500">
                              {invitation.group?.members || 0} members
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
                    {processedInvitations.length > 0 ? (
                      processedInvitations
                        .map((invitation) => (
                          <div key={`history-${invitation.id}`} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0">
                                <img 
                                  className="w-8 h-8 rounded-full" 
                                  src={invitation.group.image ? `${base_url}/${invitation.group.image}` : "/default-group.png"} 
                                  alt="Group"
                                  onError={(e) => {
                                    e.target.src = "/default-group.png";
                                  }}
                                />
                              </div>
                              <div>
                                <p className="text-sm">
                                  {invitation.inviter?.name || 'Unknown user'}'s invitation to {invitation.group?.name || 'Unknown group'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(invitation.created_at).toLocaleDateString()}
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
                <li key="total-groups" className="flex justify-between border-b pb-4">
                  <span>Total Groups</span>
                  <span>{adminGroups.length + joinedGroups.length}</span>
                </li>
                <li key="created-groups" className="flex justify-between border-b pb-4">
                  <span>Groups Created</span>
                  <span>{adminGroups.length}</span>
                </li>
                <li key="joined-groups" className="flex justify-between">
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
                    <div key="suggested-1" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm truncate">JavaScript Developers</span>
                      <button className="text-blue-600 text-xs hover:underline whitespace-nowrap ml-2">
                        Join
                      </button>
                    </div>
                    <div key="suggested-2" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
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

                <div className="flex justify-end space-x-3 mt-4">
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
}