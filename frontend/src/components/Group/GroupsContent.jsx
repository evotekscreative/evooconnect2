import { Link } from "react-router-dom";
import { Trash2, LogOut, Check, X, ChevronDown, ChevronUp, UserPlus, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import GroupCard from "./GroupCard";
import InvitationCard from "./InvitationCard";
import Alert from "../Auth/alert"; // Import the Alert component

const base_url = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function GroupsContent({
  activeTab,
  adminGroups,
  joinedGroups,
  invitations,
  loadingInvitations,
  handleDeleteGroup,
  handleLeaveGroup,
  handleAcceptInvitation,
  handleRejectInvitation,
  allGroups,
}) {
  const [showAllAdminGroups, setShowAllAdminGroups] = useState(false);
  const [showAllJoinedGroups, setShowAllJoinedGroups] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingJoinRequests, setPendingJoinRequests] = useState({});
  const [pendingRequestIds, setPendingRequestIds] = useState({});
  const [isRequestingJoin, setIsRequestingJoin] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 6,
    total: allGroups?.length || 0,
  });

  const [loadingAllGroups, setLoadingAllGroups] = useState(false);

  // Show alert function
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 5000);
  };

  const fetchAllGroups = (limit, offset) => {
    setLoadingAllGroups(true);
    setTimeout(() => {
      setPagination((prev) => ({ ...prev, limit, offset }));
      setLoadingAllGroups(false);
    }, 500);
  };

  // Function to fetch join requests
  const fetchJoinRequests = async () => {
    try {
      setLoadingJoinRequests(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axios.get(
        `${base_url}/api/my-join-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.data) {
        // Process join requests
        const requests = response.data.data.filter(req => req.status === "pending");
        setJoinRequests(requests);
        
        // Create maps for pending requests
        const pendingMap = {};
        const requestIdsMap = {};
        
        requests.forEach(request => {
          pendingMap[request.group_id] = true;
          requestIdsMap[request.group_id] = request.id;
        });
        
        setPendingJoinRequests(pendingMap);
        setPendingRequestIds(requestIdsMap);
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
      showAlert("error", "Failed to load join requests");
    } finally {
      setLoadingJoinRequests(false);
    }
  };

  // Function to handle joining a group
  const handleJoinGroup = async (groupId, isPrivate) => {
    try {
      setIsRequestingJoin(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      if (isPrivate) {
        // For private groups, send a join request
        const response = await axios.post(
          `${base_url}/api/groups/${groupId}/join-requests`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.status === 201 || response.status === 200) {
          // Update UI to show pending status for this group
          setPendingJoinRequests(prev => ({
            ...prev,
            [groupId]: true
          }));
          
          // Store the request ID for potential cancellation
          setPendingRequestIds(prev => ({
            ...prev,
            [groupId]: response.data.data.id
          }));
          
          // Refresh join requests
          fetchJoinRequests();
          
          // Show success message
          showAlert("success", "Join request sent! Waiting for admin approval.");
        }
      } else {
        // For public groups, join directly
        const response = await axios.post(
          `${base_url}/api/groups/${groupId}/join`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.status === 200) {
          showAlert("success", "Successfully joined the group!");
        }
      }
    } catch (error) {
      console.error("Error requesting to join group:", error);
      showAlert("error", error.response?.data?.message || "Failed to request joining the group");
    } finally {
      setIsRequestingJoin(false);
    }
  };

  // Function to handle cancelling a join request
// Function to handle cancelling a join request
const handleCancelRequest = async (requestId) => {
  const reqId = requestId || selectedRequestId;
  if (!reqId) return;
  
  try {
    setIsCancelling(true);
    const token = localStorage.getItem("token");
    
    const response = await axios.delete(
      `${base_url}/api/join-requests/${reqId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 200) {
      // Immediately update UI by removing the cancelled request
      setJoinRequests(prevRequests => 
        prevRequests.filter(request => request.id !== reqId)
      );
      
      // Update UI to remove pending status
      if (selectedGroupId) {
        setPendingJoinRequests(prev => {
          const updated = { ...prev };
          delete updated[selectedGroupId];
          return updated;
        });
        
        setPendingRequestIds(prev => {
          const updated = { ...prev };
          delete updated[selectedGroupId];
          return updated;
        });
      }
      
      showAlert("success", "Join request cancelled successfully");
    }
  } catch (error) {
    console.error("Error cancelling join request:", error);
    showAlert("error", error.response?.data?.message || "Failed to cancel join request");
  } finally {
    setIsCancelling(false);
    setShowCancelModal(false);
    setSelectedRequestId(null);
    setSelectedGroupId(null);
  }
};


  // Open cancel confirmation modal
  const openCancelModal = (groupId, requestId) => {
    const reqId = requestId || pendingRequestIds[groupId];
    if (reqId) {
      setSelectedRequestId(reqId);
      setSelectedGroupId(groupId);
      setShowCancelModal(true);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Fetch join requests when component mounts or tab changes
  useEffect(() => {
    if (activeTab === "joinRequests") {
      fetchJoinRequests();
    }
  }, [activeTab]);

  // Initial fetch of join requests
  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  return (
    <>
    {alert.show && (
  <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
    <Alert
      type={alert.type}
      message={alert.message}
      onClose={() => setAlert({ ...alert, show: false })}
    />
  </div>
)}

      {activeTab === "myGroups" ? (
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
                  <GroupCard
                    key={`admin-${group.id}`}
                    group={group}
                    isAdmin={true}
                    onDelete={handleDeleteGroup}
                    onLeave={handleLeaveGroup}
                  />
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
                  <GroupCard
                    key={`joined-${group.id}`}
                    group={group}
                    isAdmin={false}
                    onDelete={handleDeleteGroup}
                    onLeave={handleLeaveGroup}
                  />
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
      ) : activeTab === "allGroups" ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-medium">All Groups</h3>
            {allGroups.length > 0 && (
              <span className="text-sm text-gray-500">
                Showing {Math.min(pagination.offset + 1, pagination.total)}-
                {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
              </span>
            )}
          </div>

          {loadingAllGroups ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {allGroups.map((group) => {
                  const isAdmin = adminGroups.some((g) => g.id === group.id);
                  const hasJoined = isAdmin || joinedGroups.some((g) => g.id === group.id);
                  const hasPendingRequest = pendingJoinRequests[group.id];
                  const isPrivate = group.privacy_level === "private";

                  return (
                    <div key={`all-${group.id}`} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col justify-between h-auto border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-2 sm:space-x-3 border-b pb-3">
                        <img
                          className="w-10 h-10 object-cover rounded-full"
                          src={
                            group.image ? `${base_url}/${group.image}` : "/default-group.png"
                          }
                          alt="Group"
                          onError={(e) => {
                            e.target.src = "/default-group.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
  {isPrivate && !hasJoined && !hasPendingRequest ? (
    <p title={group.name} className="font-medium capitalize truncate">{group.name}</p>
  ) : (
    <Link to={`/groups/${group.id}`}>
      <p title={group.name} className="font-medium capitalize truncate">{group.name}</p>
    </Link>
  )}
  <div className="flex items-center gap-2">
    <div className="text-gray-500 text-xs sm:text-sm">
      {group.members_count || 0} Members
    </div>
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
      isPrivate 
        ? "bg-red-100 text-red-800" 
        : "bg-green-100 text-green-800"
    }`}>
      {group.privacy_level || "public"}
    </span>
  </div>
</div>

                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
  {isPrivate && !hasJoined && !hasPendingRequest ? (
    <span className="text-xs sm:text-sm text-gray-500">
      Private Group
    </span>
  ) : (
    <Link
      to={`/groups/${group.id}`}
      className="text-xs sm:text-sm text-blue-600 hover:underline"
    >
      View Group
    </Link>
  )}
  
  {hasJoined ? (
    <button
      onClick={() => isAdmin ? handleDeleteGroup(group.id) : handleLeaveGroup(group.id)}
      className={`flex items-center ${
        isAdmin
          ? "text-red-600 hover:text-red-800"
          : "text-gray-600 hover:text-gray-800"
      } text-xs sm:text-sm`}
      title={isAdmin ? "Delete Group" : "Leave Group"}
    >
      {isAdmin ? (
        <>
          <Trash2 size={14} className="mr-1" /> Delete
        </>
      ) : (
        <>
          <LogOut size={14} className="mr-1" /> Leave
        </>
      )}
    </button>
  ) : hasPendingRequest ? (
    <button
      onClick={() => openCancelModal(group.id)}
      className="flex items-center justify-center bg-yellow-100 border border-yellow-200 text-gray-700 px-3 py-1 rounded-md text-xs sm:text-sm hover:bg-yellow-200"
    >
      <Clock size={14} className="mr-1" />
      Pending
    </button>
  ) : (
    <button
      onClick={() => handleJoinGroup(group.id, isPrivate)}
      className={`flex items-center justify-center px-3 py-1 rounded-md text-xs sm:text-sm ${
        isRequestingJoin 
          ? "bg-gray-100 border border-gray-200 text-gray-500" 
          : isPrivate
            ? "border border-blue-500 text-blue-500 hover:bg-blue-50"
            : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
      disabled={isRequestingJoin}
    >
      {isRequestingJoin ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          <span className="ml-1">Processing</span>
        </>
      ) : (
        <>
          <UserPlus size={14} className="mr-1" /> 
          {isPrivate ? "Request Join" : "Join"}
        </>
      )}
    </button>
  )}
</div>

                    </div>
                  );
                })}
              </div>

              {allGroups.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No groups available yet.</p>
                </div>
              )}

              {pagination.total > pagination.limit && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() =>
                      fetchAllGroups(pagination.limit, Math.max(0, pagination.offset - pagination.limit))
                    }
                    disabled={pagination.offset === 0}
                    className={`px-4 py-2 rounded-md ${
                      pagination.offset === 0
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of{" "}
                    {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <button
                    onClick={() =>
                      fetchAllGroups(pagination.limit, pagination.offset + pagination.limit)
                    }
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className={`px-4 py-2 rounded-md ${
                      pagination.offset + pagination.limit >= pagination.total
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : activeTab === "joinRequests" ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pending Join Requests</h3>

          {loadingJoinRequests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : joinRequests.length > 0 ? (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
    {request.group?.image ? (
      <img
        className="w-full h-full object-cover rounded-full"
        src={`${base_url}/${request.group.image}`}
        alt={request.group?.name || "Group"}
        onError={(e) => {
          e.target.src = "/default-group.png";
        }}
      />
    ) : (
      <span className="text-sm font-bold text-gray-600">
        {(request.group?.name || "G").charAt(0).toUpperCase()}
      </span>
    )}
  </div>
  <div>
    <h4 className="font-medium">{request.group?.name || "Unknown Group"}</h4>
    <p className="text-sm text-gray-500">
      Requested on {formatDate(request.created_at)}
    </p>
    <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
      Pending Request
    </span>
  </div>
</div>
<div className="flex gap-2 w-full sm:w-auto">
  <button
    onClick={() => openCancelModal(request.group_id, request.id)}
    className="flex-1 sm:flex-none px-3 py-1.5 bg-yellow-100 border border-yellow-200 text-gray-700 rounded hover:bg-yellow-200 text-sm flex items-center justify-center"
  >
    <Clock size={14} className="mr-1" />
    Pending
  </button>
  {/* Private groups can't be viewed until joined */}
  {request.group?.privacy_level === "private" ? (
    <button
      className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-200 text-gray-500 rounded text-sm text-center cursor-not-allowed"
      disabled
    >
      Private Group
    </button>
  ) : (
    <Link
      to={`/groups/${request.group_id}`}
      className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm text-center"
    >
      View Group
    </Link>
  )}
</div>


                  
                  
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">You have no pending join requests.</p>
          )}
        </div>
      ) : (
        activeTab === "invitations" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pending Invitations</h3>

            {loadingInvitations ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingInvitations.length > 0 ? (
              pendingInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={handleAcceptInvitation}
                  onReject={handleRejectInvitation}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">You have no pending invitations.</p>
            )}
          </div>
        )
      )}

      {/* Cancel Request Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Cancel Join Request</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your request to join this group?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-2 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isCancelling}
              >
                No, Keep Request
              </button>
              <button
                onClick={() => handleCancelRequest()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-4 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
