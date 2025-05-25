import React, { useState, useEffect } from "react";
import Case from "../components/Case";
import { Link, useNavigate } from "react-router-dom";
import Profile from "../assets/img/logo-evo-2.png";
import axios from "axios";
import NetworkManager from "../components/NetworkManager";
import {
  Briefcase,
  MapPin,
  Mail,
  Check,
  X,
  Clock,
  ArrowLeft,
  UserCheck,
  AlertCircle,
} from "lucide-react";

// Komponen Avatar: Menampilkan foto jika ada, jika tidak tampilkan inisial
function Avatar({ src, name, size = 64 }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
  if (
    src &&
    !src.includes("undefined") &&
    !src.includes("null") &&
    src !== Profile
  ) {
    return (
      <img
        src={src}
        alt={name}
        className="object-cover rounded-full w-full h-full"
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "";
        }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded font-semibold"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {initials}
    </div>
  );
}

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

// Modal Component
const CancelRequestModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center mb-4 text-blue-600">
          <Alert className="mr-2" size={24} />
          <h3 className="text-lg font-medium">Cancel Connection Request</h3>
        </div>

        <p className="mb-6 text-gray-600">
          Are you sure you want to cancel your connection request to{" "}
          <span className="font-medium">{userName}</span>? This action cannot be
          undone.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            No, keep request
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Yes, cancel request
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Connection() {
  const [activeTab, setActiveTab] = useState("people");
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertInfo, setAlertInfo] = useState({
  show: false,
  type: '', // 'success' or 'error'
  message: '',
});

const Alert = ({ type, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded shadow-lg max-w-md`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
 

  const fetchInvitations = async () => {
    const token = localStorage.getItem("token");
    setInvitationsLoading(true);

    try {
      const response = await axios.get(
        apiUrl + "/api/connections/requests?limit=10&offset=0",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!response.data?.data?.requests) {
        setInvitations([]);
        return;
      }

      const mappedInvitations = response.data.data.requests
        .filter((request) => request && request.sender)
        .map((invitation) => ({
          id: invitation.id,
          name: invitation.sender?.name || "Unknown",
          headline: invitation.headline || "No headline",
          status: "pending",
          profile: invitation.photo || "",
          username: invitation.sender?.username || "",
        }));

      setInvitations(mappedInvitations);
      setAlertInfo({
        show: true,
        type: "success",
        message: "Invitations fetched successfully",
      });
    } catch (error) {
      console.error("Gagal mengambil data undangan:", error);
      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const fetchPeoples = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = parseInt(localStorage.getItem("userId"));
    try {
      const response = await axios.get(apiUrl + "/api/user-peoples", {
        params: { limit: 9999, offset: 0 },
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const pendingIds =
        JSON.parse(localStorage.getItem("pendingConnections")) || [];

      const mappedConnections = response.data.data
        .filter((person) => person.id !== currentUserId)
        .map((person) => ({
          id: person.id,
          name: person.name,
          headline: person.headline || "No headline",
          status: person.is_connected
            ? "connected"
            : pendingIds.includes(person.id)
            ? "pending"
            : "connect",
          profile: person.photo || "",
          username: person.username || "",
          verified: person.verified,
        }));

      setConnections(mappedConnections);

      // Set connected users
      const connected = mappedConnections.filter(
        (conn) => conn.status === "connected"
      );
      setConnectedUsers(connected);
    } catch (error) {
      console.error("Gagal mengambil data user-peoples:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeoples();
    fetchInvitations();
  }, [activeTab]);

  const handleConnect = async (id) => {
  const token = localStorage.getItem("token");
  const pendingIds = JSON.parse(localStorage.getItem("pendingConnections")) || [];

  const person = connections.find((conn) => conn.id === id);
  if (person && person.status === "pending") {
    setSelectedUser(person);
    setModalOpen(true);
    return;
  }

  try {
    setConnections(
      connections.map((conn) =>
        conn.id === id ? { ...conn, status: "processing" } : conn
      )
    );

    const response = await axios.post(
      `${apiUrl}/api/users/${id}/connect`,
      {},
      { headers: { Authorization: "Bearer " + token } }
    );

    if (response.data?.connected) {
      const connectedUser = connections.find((conn) => conn.id === id);
      if (connectedUser) {
        setConnectedUsers((prev) => [
          ...prev,
          { ...connectedUser, status: "connected" },
        ]);
      }
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Connection request sent successfully!',
      });
    }

    setConnections(
      connections.map((conn) =>
        conn.id === id
          ? {
              ...conn,
              status: response.data?.connected ? "connected" : "pending",
            }
          : conn
      )
    );

    if (!response.data?.connected) {
      const newConnection = connections.find((conn) => conn.id === id);
      if (newConnection) {
        setInvitations((prev) => [
          {
            id: id,
            name: newConnection.name,
            headline: newConnection.headline,
            status: "pending",
            profile: newConnection.profile,
            username: newConnection.username,
          },
          ...prev,
        ]);
      }
    }
  } catch (error) {
    setConnections(
      connections.map((conn) =>
        conn.id === id
          ? {
              ...conn,
              status: "connect",
            }
          : conn
      )
    );
    setAlertInfo({
      show: true,
      type: 'error',
      message: error.response?.data?.message || 'Failed to send connection request',
    });
  }
};

  const handleCancelRequest = async (id) => {
    const token = localStorage.getItem("token");
    const pendingIds =
      JSON.parse(localStorage.getItem("pendingConnections")) || [];

    try {
      setConnections(
        connections.map((conn) =>
          conn.id === id ? { ...conn, status: "processing" } : conn
        )
      );

      await axios.delete(`${apiUrl}/api/connections/requests/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });

      // const updatedPending = pendingIds.filter((pid) => pid !== id);
      // localStorage.setItem(
      //   "pendingConnections",
      //   JSON.stringify(updatedPending)
      // );

      setConnections(
        connections.map((conn) =>
          conn.id === id ? { ...conn, status: "connect" } : conn
        )
      );

      setInvitations((prev) => prev.filter((inv) => inv.id !== id));

      setModalOpen(false);
      setSelectedUser(null);
     setAlertInfo({
      show: true,
      type: 'success',
      message: 'Connection request cancelled',
    });
  } catch (error) {
      setConnections(
        connections.map((conn) =>
          conn.id === id
            ? {
                ...conn,
                status: "pending",
              }
            : conn
        )
      );
      setModalOpen(false);
      setSelectedUser(null);
      setAlertInfo({
      show: true,
      type: 'error',
      message: error.response?.data?.message || 'Failed to cancel request',
    });
    }
  };

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");

    try {
      setInvitations(
        invitations.map((inv) =>
          inv.id === id ? { ...inv, status: "processing" } : inv
        )
      );

      await axios.put(
        `${apiUrl}/api/connections/requests/${id}/accept`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      const acceptedUser = invitations.find((inv) => inv.id === id);
      if (acceptedUser) {
        setConnectedUsers((prev) => [
          ...prev,
          { ...acceptedUser, status: "connected" },
        ]);

        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === id ? { ...conn, status: "connected" } : conn
          )
        );
      }

      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      await fetchInvitations();
      setAlertInfo({
      show: true,
      type: 'success',
      message: 'Connection accepted!',
    });
  } catch (error) {
      setInvitations(
        invitations.map((inv) =>
          inv.id === id ? { ...inv, status: "pending" } : inv
        )
      );
      setAlertInfo({
      show: true,
      type: 'error',
      message: error.response?.data?.message || 'Failed to accept connection',
    });
    }
  };


  const handleReject = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${apiUrl}/api/connections/requests/${id}/reject`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setInvitations(invitations.filter((inv) => inv.id !== id));
      setAlertInfo({
      show: true,
      type: 'success',
      message: 'Invitation rejected',
    });
  } catch (error) {
     setAlertInfo({
      show: true,
      type: 'error',
      message: error.response?.data?.message || 'Failed to reject invitation',
    });
    }
  };

  if (loading) {
    return (
      <Case>
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </Case>
    );
  }
  

  return (
    <Case>
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="fixed top-5 right-5 z-50">
                  {alertInfo.show && (
                    <Alert
                      type={alertInfo.type}
                      message={alertInfo.message}
                      onClose={() => setAlertInfo({ ...alertInfo, show: false })}
                    />
                  )}
                </div>
          {/* Left side - People suggestions */}
          <div className="lg:col-span-3 space-y-4 bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center border-b pb-4">
              <button
                onClick={() => navigate(-1)}
                className="mr-2 p-1 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold">
                More Suggestions for you
              </h2>
            </div>

            <div className="border-b border-gray-300 overflow-x-auto">
              <div className="flex min-w-max">
                <button
                  onClick={() => setActiveTab("people")}
                  className={`px-4 py-2 border-b-2 ${
                    activeTab === "people"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500"
                  } font-medium`}
                >
                  People
                </button>
                <button
                  onClick={() => setActiveTab("invitations")}
                  className={`px-4 py-2 border-b-2 ${
                    activeTab === "invitations"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500"
                  } font-medium`}
                >
                  Invitations
                </button>
              </div>
            </div>

            {activeTab === "people" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {connections.map((person) => (
                  <div
                    key={person.id}
                    className="bg-white rounded-lg shadow overflow-hidden"
                  >
                    <div className="relative">
                      <div className="bg-gray-200 h-16"></div>
                      <div className="absolute left-1/2 top-8 transform -translate-x-1/2">
                        <div className="w-16 h-16 bg-white rounded-full p-1">
                          <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200">
                            <Avatar
                              src={
                                person.profile
                                  ? apiUrl + "/" + person.profile
                                  : ""
                              }
                              name={person.name}
                              size={56}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 pb-4 px-4 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Link to={`/user-profile/${person.username}`}>
                          <h3 className="font-semibold text-gray-800 truncate">
                            {person.name}
                          </h3>
                        </Link>
                        {person.verified && (
                          <span className="ml-1 text-blue-500">
                            <UserCheck size={16} />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {person.headline}
                      </p>

                      <button
                        onClick={() => handleConnect(person.id)}
                        className={`w-full mt-10 py-2 rounded-md flex items-center justify-center text-sm font-medium ${
                          person.status === "connected"
                            ? "bg-blue-500 text-white"
                            : person.status === "pending"
                            ? "bg-yellow-100 border border-yellow-200 text-gray-700 hover:bg-yellow-200 cursor-pointer"
                            : person.status === "processing"
                            ? "bg-gray-100 border border-gray-200 text-gray-500"
                            : "border border-blue-500 text-blue-500"
                        }`}
                        disabled={
                          person.status === "connected" ||
                          person.status === "processing"
                        }
                      >
                        {person.status === "connected" ? (
                          <>
                            <Check size={16} className="mr-1" />
                            Connected
                          </>
                        ) : person.status === "pending" ? (
                          <>
                            <Clock size={16} className="mr-1" />
                            Pending
                          </>
                        ) : person.status === "processing" ? (
                          <>
                            <LoadingSpinner size={16} />
                            <span className="ml-1">Processing</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Connect
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {invitationsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size={24} />
                  </div>
                ) : invitations?.length > 0 ? (
                  invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow">
                          <Avatar
                            src={
                              invitation.profile
                                ? apiUrl + "/" + invitation.profile
                                : ""
                            }
                            name={invitation.name}
                            size={64}
                          />
                        </div>
                        <div>
                          <Link to={`/user-profile/${invitation.username}`}>
                            <h3 className="font-medium text-blue-500 text-sm sm:text-base">
                              {invitation.name}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            {invitation.headline}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(invitation.id)}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition disabled:opacity-50"
                          disabled={invitation.status === "processing"}
                        >
                          {invitation.status === "processing" ? (
                            <LoadingSpinner size={16} />
                          ) : (
                            <>
                              <Check size={16} />
                              Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(invitation.id)}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition disabled:opacity-50"
                          disabled={invitation.status === "processing"}
                        >
                          {invitation.status === "processing" ? (
                            <LoadingSpinner size={16} />
                          ) : (
                            <>
                              <X size={16} />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm">
                    No invitations at the moment.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side - Manage network */}
          <div className="space-y-4">
            <NetworkManager />

            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-3 border-b pb-3">
                Recently Connected
              </h3>
              <div className="space-y-3">
                {connectedUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <Avatar
                        src={user.profile ? apiUrl + "/" + user.profile : ""}
                        name={user.name}
                        size={40}
                      />
                    </div>
                    <div>
                      <Link to={`/user-profile/${user.username}`}>
                        <h4 className="text-sm font-medium">{user.name}</h4>
                      </Link>
                      <p className="text-xs text-gray-500">{user.headline}</p>
                    </div>
                  </div>
                ))}
                {connectedUsers.length > 3 && (
                  <Link
                    to="/list-connection"
                    className="text-blue-500 text-sm block text-center mt-2"
                  >
                    View all ({connectedUsers.length})
                  </Link>
                )}
                {connectedUsers.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-2">
                    No recent connections
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 overflow-hidden">
                <Avatar src={Profile} name="Gurdeep" size={80} />
              </div>
              <p className="text-xs sm:text-sm font-medium mb-1">
                Gurdeep, grow your career by following{" "}
                <span className="text-blue-600">Askbootsrap</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Stay up-to industry trends!
              </p>
              <button className="border border-blue-500 text-blue-500 rounded px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium">
                FOLLOW
              </button>
            </div>
          </div>
        </div>
      </div>

      <CancelRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => selectedUser && handleCancelRequest(selectedUser.id)}
        userName={selectedUser?.name || ""}
      />
      <div className="fixed top-5 right-5 z-50">
  {alertInfo.show && (
    <Alert
      type={alertInfo.type}
      message={alertInfo.message}
      onClose={() => setAlertInfo({ ...alertInfo, show: false })}
    />
  )}
</div>
    </Case>
  );
}
