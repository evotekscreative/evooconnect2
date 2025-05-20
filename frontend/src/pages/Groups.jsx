import React, { useState, useEffect } from "react";
import Case from "../components/Case";
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft, ChevronDown, ChevronUp, User, Check, X } from "lucide-react";
import axios from 'axios';
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const base_url = "http://localhost:3000";

export default function Groups() {
  const { groupId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [showAllAdminGroups, setShowAllAdminGroups] = useState(false);
  const [showAllJoinedGroups, setShowAllJoinedGroups] = useState(false);
  const [showcaseJoinedGroups, setShowcaseJoinedGroups] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('myGroups');
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
    fetchMyInvitations();
  }, []);

  useEffect(() => {
    fetchSuggestedGroups();
  }, [adminGroups, joinedGroups]);

  const fetchGroupsData = async () => {
    try {
      const token = localStorage.getItem("token");
      setIsLoading(true);

      // Ambil grup yang dibuat user dan semua grup
      const [adminResponse, allGroupsResponse] = await Promise.all([
        axios.get(`${base_url}/api/my-groups`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${base_url}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log("Admin response:", adminResponse.data);
      console.log("All groups response:", allGroupsResponse.data);

      // Grup yang dibuat user
      const adminGroupsData = Array.isArray(adminResponse.data.data)
        ? adminResponse.data.data.map(group => ({
          ...group,
          isAdmin: true,
          createdDate: group.created_at ? group.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        }))
        : [];

      // ID grup yang dibuat user
      const adminGroupIds = adminGroupsData.map(group => group.id);
      console.log("Admin group IDs:", adminGroupIds);

      // Grup yang di-join user (bukan yang dibuat)
      const joinedGroupsData = Array.isArray(allGroupsResponse.data.data)
        ? allGroupsResponse.data.data
          .filter(group => {
            // Log untuk debugging
            if (group.joined_at) {
              console.log(`Group ${group.id} has joined_at:`, group.joined_at);
            }

            // Pastikan grup ini bukan grup yang dibuat sendiri dan sudah di-join
            return group.joined_at && !adminGroupIds.includes(group.id);
          })
          .map(group => ({
            ...group,
            isAdmin: false,
            joinedDate: group.joined_at ? group.joined_at.split('T')[0] : new Date().toISOString().split('T')[0]
          }))
        : [];

      console.log("Admin groups data:", adminGroupsData);
      console.log("Joined groups data:", joinedGroupsData);

      setAdminGroups(adminGroupsData);
      setJoinedGroups(joinedGroupsData);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedGroups = async () => {
    try {
      setLoadingSuggestions(true);
      const token = localStorage.getItem("token");

      // Ambil semua grup
      const allGroupsResponse = await axios.get(`${base_url}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ambil grup yang dibuat user
      const adminResponse = await axios.get(`${base_url}/api/my-groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Dapatkan ID semua grup yang sudah dibuat user
      const adminGroupIds = Array.isArray(adminResponse.data.data)
        ? adminResponse.data.data.map(g => g.id)
        : [];

      // Filter saran grup: hanya tampilkan grup publik yang belum dibuat/diikuti user
      const filteredSuggestions = allGroupsResponse.data.data
        .filter(group =>
          // Hanya tampilkan grup publik
          group.privacy_level === "public" &&
          // Jangan tampilkan grup yang sudah dibuat user
          !adminGroupIds.includes(group.id) &&
          // Jangan tampilkan grup yang sudah di-join
          !group.joined_at
        );

      let randomSuggestions = [];

      if (filteredSuggestions.length <= 3) {
        randomSuggestions = filteredSuggestions;
      } else {
        const availableGroups = [...filteredSuggestions];
        const count = Math.min(3, availableGroups.length);

        for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * availableGroups.length);
          randomSuggestions.push(availableGroups[randomIndex]);
          availableGroups.splice(randomIndex, 1);
        }
      }

      setSuggestedGroups(randomSuggestions);
    } catch (error) {
      console.error("Failed to fetch suggested groups:", error);
      setSuggestedGroups([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchMyInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoadingInvitations(true);

      const response = await axios.get(`${base_url}/api/my-invitations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvitations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load invitations.");
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Setting ${name} to ${value}`);  // Add this debug line
    setGroupForm(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setGroupForm(prev => ({ ...prev, image: file }));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!groupForm.image) {
      setError("Group photo is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append form data with proper field names
      formData.append("name", groupForm.name);
      formData.append("description", groupForm.description);
      formData.append("rule", groupForm.rule);
      formData.append("privacy_level", groupForm.privacy_level);
      formData.append("invite_policy", groupForm.invite_policy);

      // Make sure we're using the correct field name for the image
      // Check if the API expects "photo" or "image"
      formData.append("photo", groupForm.image);

      // Log FormData entries for debugging (won't show in console directly)
      console.log("Form values being sent:", {
        name: groupForm.name,
        description: groupForm.description,
        rule: groupForm.rule,
        privacy_level: groupForm.privacy_level,
        invite_policy: groupForm.invite_policy,
        hasImage: !!groupForm.image
      });

      // Make the API request
      const response = await axios.post(`${base_url}/api/groups`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const newGroup = {
        ...response.data.data,
        isAdmin: true,
        createdDate: new Date().toISOString().split('T')[0],
        members_count: 1
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
      setFormSubmitted(false);
    } catch (error) {
      console.error("Failed to create group:", error);

      // Enhanced error logging
      if (error.response) {
        console.error("Server response data:", error.response.data);
        console.error("Server response status:", error.response.status);
        console.error("Server response headers:", error.response.headers);

        // Show detailed error message from server if available
        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
          toast.error(error.response.data.message);
        } else if (error.response.data && typeof error.response.data === 'object') {
          // If there's a validation error object, stringify it
          const errorMessage = JSON.stringify(error.response.data);
          setError(errorMessage);
          toast.error(`Validation error: ${errorMessage}`);
        } else {
          setError(`Server error: ${error.response.status}`);
          toast.error(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response from server. Please check your connection.");
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Error details:", error.message);
        setError(`Error: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${base_url}/api/invitations/${invitationId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the invitation status locally
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "accepted" } : inv
        )
      );

      // Refresh the groups data
      fetchGroupsData();

      toast.success("Invitation accepted successfully!");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error(error.response?.data?.message || "Failed to accept invitation.");
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${base_url}/api/invitations/${invitationId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the invitation status locally
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === invitationId
            ? { ...inv, status: "rejected" }
            : inv
        )
      );

      toast.success("Invitation rejected successfully!");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error(error.response?.data?.message || "Failed to reject invitation.");
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

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        const token = localStorage.getItem("token");

        // Try with PUT method (commonly used for this type of action)
        await axios.put(`${base_url}/api/groups/${groupId}/leave`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update the UI by removing the group from joined groups
        setJoinedGroups(joinedGroups.filter(group => group.id !== groupId));

        toast.success("You have left the group successfully!");
      } catch (error) {
        console.error("Error leaving group:", error);
        toast.error(error.response?.data?.message || "Failed to leave group");
      }
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");

      // Make the API request to join the group
      const joinResponse = await axios.post(`${base_url}/api/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Join response:", joinResponse.data);

      // Ambil data grup yang baru di-join dari server
      const groupResponse = await axios.get(`${base_url}/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Group data after join:", groupResponse.data);

      // Gunakan data dari server untuk memastikan data yang benar
      const joinedGroupData = groupResponse.data.data;

      if (joinedGroupData) {
        // Tambahkan ke joined groups dengan data yang benar dari server
        const groupWithJoinedDate = {
          ...joinedGroupData,
          isAdmin: false, // Pastikan isAdmin false untuk grup yang di-join
          joined_at: new Date().toISOString(),
          joinedDate: new Date().toISOString().split('T')[0]
        };

        // Update state
        setJoinedGroups(prev => [groupWithJoinedDate, ...prev]);
        setSuggestedGroups(prev => prev.filter(group => group.id !== groupId));

        toast.success("Successfully joined the group!");
      } else {
        // Fallback ke cara lama jika tidak bisa mendapatkan data dari server
        const joinedGroup = suggestedGroups.find(group => group.id === groupId);

        if (joinedGroup) {
          const groupWithJoinedDate = {
            ...joinedGroup,
            isAdmin: false,
            joined_at: new Date().toISOString(),
            joinedDate: new Date().toISOString().split('T')[0]
          };

          setJoinedGroups(prev => [groupWithJoinedDate, ...prev]);
          setSuggestedGroups(prev => prev.filter(group => group.id !== groupId));
        }
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error(error.response?.data?.message || "Failed to join group");
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === "pending");
  const processedInvitations = invitations.filter(inv => inv.status !== "pending");

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
                      {(showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3)).map((group) => (
                        <div key={`admin-${group.id}`} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={group.image ? `${base_url}/${group.image}` : "/default-group.png"}
                              alt="Group"
                              onError={(e) => {
                                e.target.src = "/default-group.png";
                              }}
                            />
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
                      {(showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3)).map((group) => (
                        <div key={`joined-${group.id}`} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-36 sm:h-40 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                            <img
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
              activeTab === 'invitations' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pending Invitations</h3>

                  {loadingInvitations ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : invitations.filter(inv => inv.status === "pending").length > 0 ? (
                    <div className="space-y-3">
                      {invitations
                        .filter(inv => inv.status === "pending")
                        .map((invitation) => (
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
                                <div className="font-medium text-gray-900">{invitation.group.name}</div>
                                <p className="text-sm text-gray-600">
                                  Invited by <span className="font-medium">{invitation.inviter.name}</span>
                                </p>
                                <div className="mt-1 text-xs text-gray-500">
                                  {invitation.group.members_count} members
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {invitation.group.description}
                                </p>
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
                            <div key={`history-${invitation.id}`} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
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
                                    {invitation.inviter.name}'s invitation to {invitation.group.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(invitation.updated_at).toLocaleDateString()}
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
              ) : null)}
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
              {loadingSuggestions ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : suggestedGroups.length > 0 ? (
                <div className="space-y-3">
                  {suggestedGroups.map((group) => (
                    <div key={`suggested-${group.id}`} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-shrink-0">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={group.image ? `${base_url}/${group.image}` : "/default-group.png"}
                          alt="Group"
                          onError={(e) => {
                            e.target.src = "/default-group.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{group.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{group.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{group.members_count} members</p>
                        <p className="text-xs text-blue-500 mt-1">
                          {group.privacy_level === "public" ? "Public Group" : "Private Group"}
                        </p>
                      </div>
                      {group.privacy_level === "public" && (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded whitespace-nowrap"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No group suggestions available.</p>
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
                    <option value="public">Public (Anyone can see and request to join)</option>
                    <option value="private">Private (Only visible to members)</option>
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
                    <option value="admin">Admin Only (Only admins can invite new members)</option>
                    <option value="member">All Members (Any member can invite new members)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Photo *
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {formSubmitted && !groupForm.image && (
                    <p className="mt-1 text-sm text-red-600">Group photo is required</p>
                  )}
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
}
