import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Tambahkan useLocation
import Logo from "../assets/img/logo1.png";
import axios from "axios";
import Pusher from "pusher-js";
import {
  Users,
  Briefcase,
  Pen,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
  User,
  Briefcase as JobIcon,
  MessageCircle,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Tambahkan ini
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [pusher, setPusher] = useState(null);
  const [channels, setChannels] = useState({});
  const [userName, setUserName] = useState("User");

  // Add notifications state with sample data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "connection",
      content: "John Smith accepted your connection request",
      timestamp: "10 min ago",
      read: false,
    },
    {
      id: 2,
      type: "job",
      content: "New job opening matching your profile: Frontend Developer",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "message",
      content: "Lisa Wang mentioned you in a comment",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: 4,
      type: "system",
      content: "Your profile has been viewed 12 times this week",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: 5,
      type: "job",
      content: "Your job application was reviewed",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: 6,
      type: "connection",
      content: "Michael Brown sent you a connection request",
      timestamp: "3 days ago",
      read: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("q") || "";
  });

  const msgRef = useRef(null);
  const bellRef = useRef(null);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      // Tidak perlu reset searchQuery di sini agar tetap ada di input field
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
        const response = await axios.get("http://localhost:3000/api/users/me", {
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
          "http://localhost:3000/api/conversations?limit=10&offset=0",
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

            fetch("http://localhost:3000/api/pusher/auth", {
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
            // if (isSentToUser) {
            //   setTotalUnreadCount((prev) => prev + 1);
            // }

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
      if (!bellRef.current?.contains(event.target)) setIsBellOpen(false);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "connection":
        return <User className="w-4 h-4 text-blue-500" />;
      case "job":
        return <JobIcon className="w-4 h-4 text-green-500" />;
      case "message":
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const navigateToConversation = (conversationId) => {
    setIsMsgOpen(false);
    navigate(`/messages/${conversationId}`);
  };

  return (
    <nav
      className={`flex items-center justify-between px-4 sm:px-8 md:px-16 py-[13px] bg-sky-500 text-white shadow-sm relative font-sans sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg" : ""
        }`}
    >
      {/* Left: Logo + Hamburger Menu (mobile) */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          className="mr-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <Link to="/">
          <img src={Logo} alt="Logo" className="h-8" />
        </Link>

        {/* Search - Different styles for mobile vs desktop */}
        <div className="hidden sm:flex items-center bg-white rounded-full px-3 py-2 ml-4 w-[180px] md:w-[220px] lg:w-[280px]">
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              placeholder="Search people, jobs & more"
              className="flex-grow w-full px-2 text-sm text-black bg-transparent focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hidden">
              <Search className="w-4 h-4 text-black" />
            </button>
          </form>
          <Search className="w-4 h-4 text-black" onClick={handleSearch} />
        </div>
      </div>

      {/* Mobile Search - More elongated */}
      <div className="sm:hidden flex items-center bg-white rounded-md px-3 py-2 mx-2 flex-1 max-w-[180px]">
        <form onSubmit={handleSearch} className="w-full">
          <input
            type="text"
            placeholder="Search..."
            className="flex-grow w-full text-sm text-black bg-transparent focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="hidden">
            <Search className="w-4 h-4 ml-1 text-black" />
          </button>
        </form>
        <Search className="w-4 h-4 ml-1 text-black" onClick={handleSearch} />
      </div>

      {/* Right: Menu, Icons, Avatar */}
      <div className="flex items-center gap-4">
        {/* Desktop Menu */}
        <div className="items-center hidden gap-6 text-sm font-thin text-white md:flex">
          <Link
            to="/jobs"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
          </Link>
          <Link
            to="/connections"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <Users className="w-4 h-4" />
            <span>Connection</span>
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <Pen className="w-4 h-4" />
            <span>Blog</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Message - Hidden on mobile */}
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
                <div className="flex items-center justify-between p-4 font-bold text-black border-b">
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
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${conversation.unread_count > 0 ? "bg-blue-50" : ""
                            }`}
                          onClick={() =>
                            navigateToConversation(conversation.id)
                          }
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                                {otherParticipant.photo ? (
                                  <img
                                    src={`http://localhost:3000/${otherParticipant.photo}`}
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
                                    ) : conversation.last_message
                                      .message_type === "text" ? (
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

          {/* Bell - Hidden on mobile */}
          <div ref={bellRef} className="relative hidden sm:block">
            <div
              onClick={() => setIsBellOpen(!isBellOpen)}
              className="relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2 bg-cyan-400 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            </div>
            {isBellOpen && (
              <div className="absolute right-0 z-50 mt-2 bg-white rounded-lg shadow-lg w-80">
                <div className="flex items-center justify-between p-4 font-bold text-white border-b bg-sky-500">
                  <span>Notifications</span>
                  <span className="text-sm font-normal">
                    {notifications.filter((n) => !n.read).length} new
                  </span>
                </div>
                <ul className="overflow-y-auto text-black divide-y divide-gray-100 max-h-96">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 mt-1 bg-gray-100 rounded-full">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${!notification.read ? "font-medium" : ""
                              }`}
                          >
                            {notification.content}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {notification.timestamp}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="p-3 text-center border-t">
                  <Link
                    to="/notifications"
                    className="text-sm font-medium text-sky-500 hover:text-sky-700"
                    onClick={() => setIsBellOpen(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center font-semibold text-black bg-white border border-white rounded-full cursor-pointer w-7 h-7"
            >
              <img src="#" alt="" />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-64 mt-2 text-black bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-bold">{userName}</p>
                    <span className="text-sm text-green-500">● Online</span>
                  </div>
                </div>
                <ul className="flex flex-col divide-y">
                  <li className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                    <Link to="/profile" className="flex items-center gap-2">
                      My Account
                    </Link>
                  </li>
                  <li className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                    <Link
                      to="/edit-profile"
                      className="flex items-center gap-2"
                    >
                      Edit Profile
                    </Link>
                  </li>
                  <li
                    onClick={() => handleLogout()}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute left-0 z-50 w-full shadow-lg md:hidden top-full bg-sky-600"
        >
          <div className="flex flex-col p-4">
            <Link
              to="/jobs"
              className="flex items-center gap-3 px-4 py-3 rounded hover:bg-sky-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </Link>
            <Link
              to="/connections"
              className="flex items-center gap-3 px-4 py-3 rounded hover:bg-sky-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="w-4 h-4" />
              <span>Connection</span>
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-3 px-4 py-3 rounded hover:bg-sky-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Pen className="w-4 h-4" />
              <span>Blog</span>
            </Link>

            {/* Mobile version of messages and notifications */}
            <div className="pt-2 mt-2 border-t border-sky-400">
              <Link
                to="/messages"
                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-sky-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {totalUnreadCount}
                </span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-sky-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                <span className="ml-auto bg-cyan-400 text-white text-xs rounded-full px-2 py-0.5">
                  {notifications.filter((n) => !n.read).length}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
