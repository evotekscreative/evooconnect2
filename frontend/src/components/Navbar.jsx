import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Tambahkan useLocation
import Logo from "../assets/img/logo1.png";
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
  Heart,
  Link2,
  FileText,
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
  const [user, setUser] = useState({ name: "", photo: null });

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

  // Fungsi untuk menandai notifikasi sebagai read dan redirect
  // Fungsi untuk menandai notifikasi sebagai read dan redirect
  const handleNotificationClick = async (notif) => {
    try {
      const token = localStorage.getItem("token");

      // Jika notifikasi belum dibaca, kirim request ke API
      if (!notif.read) {
        await fetch("http://localhost:3000/api/notifications/mark-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notification_ids: [notif.id] }),
        });

        // Update status read di local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notif.id ? { ...n, status: "read" } : n
          )
        );
      }

      // Redirect to notification page with appropriate tab
      navigate(`/notification?tab=${notif.type}`);
      setIsBellOpen(false);
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

  // Initialize Pusher and fetch initial conversations
  useEffect(() => {
    // Fetch user data from localStorage
    const fetchUserData = () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser({
          name: userData.name || "",
          photo: userData.photo || null,
        });
      }
    };

    fetchUserData();

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

  // ...existing code...

  useEffect(() => {
    // Fetch notifications mirip Notification.jsx
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "http://localhost:3000/api/notifications?limit=10&offset=0",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const notifData = Array.isArray(data.data.notifications)
          ? data.data.notifications.map((n) => ({
            id: n.id,
            type: n.category,
            title: n.title,
            desc: n.message,
            time: new Date(n.created_at).toLocaleString(),
            icon:
              n.category === "connection" ? (
                <User className="text-sky-500" />
              ) : n.category === "job" ? (
                <Briefcase className="text-green-500" />
              ) : n.category === "sosmed" ? (
                <Bell className="text-pink-500" />
              ) : (
                <Heart className="text-gray-400" />
              ),
            status: n.status, // tambahkan ini
          }))
          : [];
        setNotifications(notifData);
      } catch (error) {
        console.error("FETCH ERROR", error);
      }
    };
    fetchNotifications();
  }, []);

  // ...existing code...

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      if (date.toDateString() === now.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  // Format time with error handling
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "";
    }
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
          className="md:hidden mr-2"
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
        <div className="hidden md:flex gap-6 text-white font-thin text-sm items-center">
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
              className="cursor-pointer relative"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
                8
              </span>
            </div>
            {isMsgOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4 border-b font-bold text-black">
                  Messages
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
              className="cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2 bg-cyan-400 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            </div>

            {isBellOpen && (
              <div className="absolute right-0 z-50 mt-2 bg-white rounded-lg shadow-lg w-80">
                <div className="flex items-center justify-between p-4 font-bold text-white border-b bg-gradient-to-r from-sky-500 to-cyan-400">
                  <span>Notifications</span>
                  <span className="text-sm font-normal">
                    {notifications.filter((n) => !n.read).length} new
                  </span>
                </div>
                <ul className="overflow-y-auto text-black divide-y divide-gray-100 max-h-96 scrollbar-hide">


                  {notifications.length === 0 ? (
                    <li className="px-4 py-8 text-center text-gray-400">
                      No notifications
                    </li>
                  ) : notifications.map((n) => (
                    <li
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 mt-1 bg-gray-100 rounded-full">
                          {n.icon}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${!notification.read ? "font-medium" : ""
                              }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-600">{n.desc}</p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-500">
                            <span>{formatDate(n.time)}</span>
                            <span>{formatTime(n.time)}</span>
                          </div>
                        </div>
                        {n.status === "unread" && (
                          <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="p-3 text-center border-t">
                  <Link
                    to="/notification"
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
              className="flex items-center gap-2 cursor-pointer"
            >
              {user.photo ? (
                <img
                  src={`http://localhost:3000/${user.photo}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-semibold border border-white">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    {user.photo ? (
                      <img
                        src={`http://localhost:3000/${user.photo}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-sm font-bold text-gray-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <span className="text-green-500 text-sm">● Online</span>
                  </div>
                </div>
                <ul className="flex flex-col divide-y">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2">
                      My Account
                    </Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link
                      to="/edit-profile"
                      className="flex items-center gap-2"
                    >
                      Edit Profile
                    </Link>
                  </li>
                  <li
                    onClick={() => handleLogout()}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
          className="md:hidden absolute top-full left-0 w-full bg-sky-600 shadow-lg z-50"
        >
          <div className="flex flex-col p-4">
            <Link
              to="/jobs"
              className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </Link>
            <Link
              to="/connections"
              className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="w-4 h-4" />
              <span>Connection</span>
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Pen className="w-4 h-4" />
              <span>Blog</span>
            </Link>

            {/* Mobile version of messages and notifications */}
            <div className="border-t border-sky-400 mt-2 pt-2">
              <Link
                to="/messages"
                className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  8
                </span>
              </Link>
              <Link
                to="/notification"
                className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                <span className="ml-auto bg-cyan-400 text-white text-xs rounded-full px-2 py-0.5">
                  6
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
