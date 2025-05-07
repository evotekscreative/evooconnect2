import React, { useState, useEffect } from "react";
import Case from "../components/Case";
import { Link, useNavigate } from "react-router-dom";
import Profile from "../assets/img/logo-evo-2.png";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  Mail,
  Check,
  X,
  Clock,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

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

export default function Connection() {
  const [activeTab, setActiveTab] = useState("people");
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  const fetchInvitations = async () => {
    const token = localStorage.getItem("token");
    setInvitationsLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:3000/api/connections/requests?limit=10&offset=0",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const mappedInvitations = response.data.data.requests.map(
        (invitation) => ({
          id: invitation.id,
          name: invitation.sender.name,
          headline: invitation.headline || "No headline",
          status: "pending",
          profile: invitation.photo || Profile,
          username: invitation.sender.username || "",
        })
      );

      console.log(response.data.data.requests);

      setInvitations(mappedInvitations);
      // Cache the invitations
    } catch (error) {
      console.error("Gagal mengambil data undangan:", error);
    } finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const currentUserId = user.id;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/user-peoples",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

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
            profile: person.photo || Profile,
            username: person.username || "",
          }));

        setConnections(mappedConnections);
      } catch (error) {
        console.error("Gagal mengambil data user-peoples:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    fetchInvitations();
  }, []);

  const handleConnect = async (id) => {
    const token = localStorage.getItem("token");
    const pendingIds =
      JSON.parse(localStorage.getItem("pendingConnections")) || [];

    try {
      if (pendingIds.includes(id)) {
        await axios.delete(
          `http://localhost:3000/api/connections/requests/${id}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        const updatedPending = pendingIds.filter((pid) => pid !== id);
        localStorage.setItem(
          "pendingConnections",
          JSON.stringify(updatedPending)
        );

        setConnections(
          connections.map((conn) =>
            conn.id === id ? { ...conn, status: "connect" } : conn
          )
        );
        return;
      }

      await axios.post(
        `http://localhost:3000/api/users/${id}/connect`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      const updatedPending = [...pendingIds, id];
      localStorage.setItem(
        "pendingConnections",
        JSON.stringify(updatedPending)
      );

      setConnections(
        connections.map((conn) =>
          conn.id === id ? { ...conn, status: "pending" } : conn
        )
      );

      fetchInvitations();
    } catch (error) {
      console.error("Connection action failed:", error);
    }
  };

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3000/api/connections/requests/${id}/accept`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setInvitations(invitations.filter((inv) => inv.id !== id));

      const acceptedInvitation = invitations.find((inv) => inv.id === id);
      if (acceptedInvitation) {
        setConnections((prev) => [
          ...prev,
          { ...acceptedInvitation, status: "connected" },
        ]);
      }

      await fetchInvitations();
    } catch (error) {
      console.error("Gagal menerima undangan:", error);
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3000/api/connections/requests/${id}/reject`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setInvitations(invitations.filter((inv) => inv.id !== id));
    } catch (error) {
      console.error("Gagal menolak undangan:", error);
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
                            <img
                              src={person.profile}
                              alt={`${person.name}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 pb-4 px-4 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {person.name}
                        </h3>
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
                            ? "bg-yellow-100 border border-yellow-200 text-gray-700"
                            : "border border-blue-500 text-blue-500"
                        }`}
                        disabled={
                          person.status === "pending" ||
                          person.status === "connected"
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
                          <img
                            src={invitation.profile}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = Profile;
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-500 text-sm sm:text-base">
                            {invitation.name}
                          </h3>
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
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-3 text-sm sm:text-base">
                Manage my network
              </h3>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li className="border-b pb-3">
                  <Link to="/list-connection" className="flex justify-between">
                    <span>Connections</span>
                    <span>
                      {
                        [...connections, ...invitations].filter(
                          (c) => c.status === "connected"
                        ).length
                      }
                    </span>
                  </Link>
                </li>
                <li className="border-b pb-3">
                  <Link to="/messages" className="flex justify-between">
                    <span>Contacts</span> <span>869</span>
                  </Link>
                </li>
                <li className="border-b pb-3">
                  <Link to="/groups" className="flex justify-between">
                    <span>Groups</span> <span>0</span>
                  </Link>
                </li>
                <li>
                  <Link to="/hashtags" className="flex justify-between">
                    <span>Hashtag</span> <span>8</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow p-4 text-center">
              <img
                src={Profile}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover"
              />
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
    </Case>
  );
}
