import { useState, useEffect } from "react";
import {
  UserPlus,
  UserMinus,
  Search,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import Case from "../../components/Case.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Profile from "../../assets/img/logo-evo-2.png";
import NetworkManager from "../../components/NetworkManager.jsx"
import Alert from "../../components/Auth/alert.jsx";


export default function ConnectionList() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [conversationCache, setConversationCache] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const handleMessageClick = async (connection) => {
    const token = localStorage.getItem("token");
    const userId = connection.id;

    try {
      // First check if we've already cached this conversation
      if (conversationCache[userId]) {
        navigate(`/messages/${conversationCache[userId]}`);
        return;
      }

      // Check if a conversation already exists
      const checkResponse = await axios.get(`${apiUrl}/api/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      // Find a conversation with this connection
      const existingConversation = checkResponse.data.data.conversations.find((conv) =>
        conv.participants.some((p) => p.user_id == userId)
      );

      // return existingConversation;

      console.log("Existing conversation:", existingConversation);

      if (existingConversation) {
        // Cache the conversation ID for future use
        setConversationCache((prev) => ({
          ...prev,
          [userId]: existingConversation.id,
        }));
        // Redirect to existing conversation
        navigate(`/messages/${existingConversation.id}`);
      } else {
        // Create a new conversation
        const createResponse = await axios.post(
          `${apiUrl}/api/conversations`,
          {
            participant_ids: [userId],
            message: null, // No initial message
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newConversationId = createResponse.data.data.id;

        // Cache the new conversation ID
        setConversationCache((prev) => ({
          ...prev,
          [userId]: newConversationId,
        }));

        // Redirect to the new conversation
        navigate(`/messages/${newConversationId}`);
      }
    } catch (err) {
      console.error("Error handling message action:", err);
      // Fallback to direct navigation if API calls fail
      // navigate(`/messages/${connection.username || connection.id}`);
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user);

      try {
        const response = await axios.get(
          `${apiUrl}/api/users/${user.id}/connections?limit=100&offset=0`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        let mappedConnections = [];
        if (response.data.data.connections != null) {
          mappedConnections = response.data.data.connections.map(
            (connection) => ({
              id: connection.user.id,
              name: connection.user.name,
              headline: connection.user.headline || "No headline",
              role: connection.user.headline || "", // gunakan headline jika ingin tampilkan di bawah nama
              connected: true,
              image: connection.user.photo || Profile,
              username: connection.user.username || "",
            })
          );
        } else {
          mappedConnections = [];
        }
        console.log(mappedConnections);
        console.log("API response:", response.data.data);

        setConnections(mappedConnections);
      } catch (err) {
        console.error("Failed to fetch connections:", err);
        setError("Failed to load connections. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const openDisconnectModal = (connection) => {
    setSelectedConnection(connection);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConnection(null);
  };

  const handleDisconnect = async () => {
    if (!selectedConnection) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `${apiUrl}/api/users/${selectedConnection.id}/connect`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setConnections(
        connections.filter(
          (connection) => connection.id !== selectedConnection.id
        )
      );
      closeModal();
      showAlert('success', 'Disconnected successfully');
    } catch (err) {
      console.error("Failed to disconnect:", err);
      showAlert('error', 'You are not connected to this user');
      closeModal();
    }
  };

  const filteredConnections = connections.filter(
    (connection) =>
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (connection.headline &&
        connection.headline.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Case>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Case>
    );
  }

  if (error) {
    return (
      <Case>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center py-20 text-red-500">{error}</div>
        </div>
      </Case>
    );
  }

  return (
    <Case>
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        {/* Confirmation Modal */}
        {showModal && selectedConnection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-blue-600 mb-4">
                Disconnect from {selectedConnection.name}?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to disconnect from{" "}
                {selectedConnection.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Left side - People suggestions */}
          <div className="lg:col-span-3 space-y-4 bg-white rounded-xl shadow p-4 sm:p-6">
            {alert.show && (
              <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
                <Alert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert({ ...alert, show: false })}
                />
              </div>
            )}
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="mr-2 p-1 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                My Connections
              </h1>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search connections..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Connection List */}
            <div className="space-y-4">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={apiUrl + '/' + connection.image}
                        alt={connection.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = Profile;
                        }}
                      />
                      <div>
                        <Link to={`/user-profile/${connection.username}`}>
                          <h3 className="font-medium text-gray-800">
                            {connection.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">
                          {connection.headline}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleMessageClick(connection)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition w-full sm:w-auto"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => openDisconnectModal(connection)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium text-white border bg-red-600 hover:bg-red-700 transition w-full sm:w-auto"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {connections.length === 0
                    ? "You don't have any connections yet."
                    : `No connections found matching "${searchTerm}"`}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredConnections.length} connection
                {filteredConnections.length !== 1 ? "s" : ""}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
              <p className="text-sm text-gray-600">
                Total connections: {connections.length}
              </p>
            </div>
          </div>

          {/* Right side - Manage network */}
          <div className="space-y-4">
            <NetworkManager />


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
