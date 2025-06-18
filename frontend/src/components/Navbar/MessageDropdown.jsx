import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Pusher from "pusher-js";
import { MessageSquare, Briefcase as JobIcon } from "lucide-react";

const MessageDropdown = () => {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [pusher, setPusher] = useState(null);
  const [channels, setChannels] = useState({});
  const [userName, setUserName] = useState("User");

  const msgRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Function to extract user ID from JWT token
  const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  // Format time function
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day ago`;

    return messageDate.toLocaleDateString();
  };

  // Initialize Pusher and fetch initial conversations
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userId = getUserIdFromToken(token);
    if (!userId) return;

    // Fetch user data to get name if needed
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data) {
          setUserName(response.data.data.name || "User");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();

    // Fetch conversations
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          apiUrl + "/api/conversations?limit=10&offset=0",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.conversations
        ) {
          // Sort by last message timestamp (newest first)
          const sortedConversations = response.data.data.conversations.sort(
            (a, b) => {
              const aTime = a.last_message?.created_at || a.updated_at;
              const bTime = b.last_message?.created_at || b.updated_at;
              return new Date(bTime) - new Date(aTime);
            }
          );

          console.log("Sorted conversations:", sortedConversations);

          setConversations(sortedConversations);

          // Calculate total unread count
          const totalUnread = sortedConversations.reduce(
            (total, conv) => total + (conv.unread_count || 0),
            0
          );

          setTotalUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    // Initialize Pusher
    const pusherClient = new Pusher("a579dc17c814f8b723ea", {
      cluster: "ap1",
      authorizer: (channel) => {
        return {
          authorize: (socketId, callback) => {
            const formData = new FormData();
            formData.append("socket_id", socketId);
            formData.append("channel_name", channel.name);

            fetch(apiUrl + "/api/pusher/auth", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => callback(null, data))
              .catch((error) => callback(error, null));
          },
        };
      },
    });

    // Subscribe to user's private channel
    try {
      const userChannel = pusherClient.subscribe(`private-user-${userId}`);

      userChannel.bind("pusher:subscription_succeeded", () => {
        console.log("Successfully subscribed to user channel in Navbar");
      });

      userChannel.bind("pusher:subscription_error", (error) => {
        console.error("Error subscribing to user channel:", error);
      });

      // Handle new message notifications
      userChannel.bind("new-message-notification", (data) => {
        console.log("New message notification received in Navbar:", data);

        setConversations((prevConversations) => {
          // Find the conversation that received the new message
          const updatedConversations = [...prevConversations];
          const conversationIndex = updatedConversations.findIndex(
            (conv) => conv.id === data.conversation_id
          );

          if (conversationIndex > -1) {
            // Get the conversation
            const conversation = updatedConversations[conversationIndex];

            // Get current user ID to determine if this message is TO the user
            const currentUserId = getUserIdFromToken(
              localStorage.getItem("token")
            );
            const isSentToUser = data.sender_id !== currentUserId;

            // Update the conversation with the new message data
            const updatedConversation = {
              ...conversation,
              last_message: {
                ...data.message,
                created_at: data.created_at || new Date().toISOString(),
              },
              updated_at: data.created_at || new Date().toISOString(),
              // Only increment unread count if message was sent TO the current user
              unread_count: isSentToUser
                ? (conversation.unread_count || 0) + 1
                : conversation.unread_count || 0,
            };

            // Remove the conversation from its current position
            updatedConversations.splice(conversationIndex, 1);

            // Add it to the beginning of the array (top of the list)
            updatedConversations.unshift(updatedConversation);

            // Update total unread count
            if (isSentToUser) {
              setTotalUnreadCount((prev) => prev + 1);
            }

            return updatedConversations;
          }

          // If conversation not found in current list, fetch all conversations
          // This will handle edge cases like receiving messages for a new conversation
          // fetchConversations();
          return prevConversations;
        });
      });

      // Handle new conversation
      userChannel.bind("new-conversation", (data) => {
        console.log("New conversation received:", data);
        setConversations((prev) => [data, ...prev]);
        setTotalUnreadCount((prev) => prev + 1);
      });

      setChannels((prev) => ({ ...prev, user: userChannel }));
    } catch (error) {
      console.error("Error subscribing to user channel:", error);
    }

    setPusher(pusherClient);
    fetchConversations();

    return () => {
      if (pusherClient) {
        if (channels.user) {
          channels.user.unbind_all();
          pusherClient.unsubscribe(`private-user-${userId}`);
        }
        pusherClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!msgRef.current?.contains(event.target)) setIsMsgOpen(false);
      if (!dropdownRef.current?.contains(event.target))
        setIsDropdownOpen(false);
      if (!mobileMenuRef.current?.contains(event.target))
        setIsMobileMenuOpen(false);
    };

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navigateToConversation = (conversationId) => {
    setIsMsgOpen(false);
    navigate(`/messages/${conversationId}`);
  };

  return (
    <div ref={msgRef} className="relative hidden sm:block">
      <div
        onClick={() => setIsMsgOpen(!isMsgOpen)}
        className="relative cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
          </span>
        )}
      </div>
      {isMsgOpen && (
       <div className="absolute right-0 z-50 mt-2 bg-white rounded-lg shadow-lg w-80">
          <div className="flex items-center justify-between p-4 font-bold text-white border-b bg-gradient-to-r from-sky-500 to-cyan-400">
            <span>Messages</span>
            {totalUnreadCount > 0 && (
              <span className="text-sm font-normal">
                {totalUnreadCount} unread
              </span>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            <ul className="overflow-y-auto text-black divide-y divide-gray-100 max-h-80">
              {conversations.map((conversation) => {
                // Get other participant (not current user)
                const currentUserId = getUserIdFromToken(
                  localStorage.getItem("token")
                );
                const otherParticipants =
                  conversation.participants?.filter(
                    (p) => p && p.user_id !== currentUserId
                  ) || [];
                const otherParticipant = otherParticipants[0]?.user;

                if (!otherParticipant) return null;

                return (
                  <li
                    key={conversation.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      conversation.unread_count > 0 ? "bg-blue-50" : ""
                    }`}
                    onClick={() => navigateToConversation(conversation.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                          {otherParticipant.photo ? (
                            <img
                              src={`${apiUrl}/${otherParticipant.photo}`}
                              alt={otherParticipant.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="font-semibold text-gray-600">
                              {otherParticipant.name
                                ?.substring(0, 2)
                                .toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {otherParticipant.name || "Unknown User"}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(
                              conversation.last_message?.created_at ||
                                conversation.updated_at
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate max-w-[180px]">
                            {conversation.last_message ? (
                              conversation.last_message.deleted ||
                              conversation.last_message.deleted_at ? (
                                "Pesan telah dihapus"
                              ) : conversation.last_message.message_type ===
                                "text" ? (
                                <>
                                  {conversation.last_message.sender_id ===
                                  getUserIdFromToken(
                                    localStorage.getItem("token")
                                  )
                                    ? "You: "
                                    : ""}
                                  {conversation.last_message.content}
                                </>
                              ) : (
                                `[${conversation.last_message.message_type}]`
                              )
                            ) : (
                              "No messages yet"
                            )}
                          </p>

                          {conversation.unread_count > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 ml-2 text-xs text-white bg-blue-500 rounded-full">
                              {conversation.unread_count > 99
                                ? "99+"
                                : conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="p-3 text-center border-t">
            <Link
              to="/messages"
              className="text-sm font-medium text-sky-500 hover:text-sky-700"
              onClick={() => setIsMsgOpen(false)}
            >
              See All Messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;