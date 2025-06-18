import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Briefcase, Heart, Trash2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import Pusher from "pusher-js";

const NotificationDropdown = () => {
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pusherChannel, setPusherChannel] = useState(null);

  const bellRef = useRef(null);
    const dropdownRef = useRef(null);
  const [isBellOpen, setIsBellOpen] = useState(false);

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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? "" : "s"} ago`;

    return "Just now";
  };

  const getNotificationIcon = (category) => {
    switch (category) {
      case "connection":
        return <User className="text-sky-500" />;
      case "job":
        return <Briefcase className="text-green-500" />;
      case "post":
        return <Bell className="text-pink-500" />;
      default:
        return <Heart className="text-gray-400" />;
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl + "/api/notifications?limit=10&offset=0",
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
            time: formatTimeAgo(n.created_at),
            icon: getNotificationIcon(n.category),
            actor: n.actor,
            status: n.status,
            read: n.status === "read",
          }))
        : [];
      
      setNotifications(notifData);
      setUnreadCount(data.data.unread_count || 0);
    } catch (error) {
      console.error("FETCH ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(apiUrl + "/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notification_ids: [notificationId] }),
      });

      setNotifications(prev =>
        prev.map(n => 
          n.id === notificationId ? { ...n, status: "read", read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(apiUrl + "/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, status: "read", read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);

    if (!userId) return;

    // Initialize Pusher
    const pusher = new Pusher("a579dc17c814f8b723ea", {
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

    const channel = pusher.subscribe(`private-user-${userId}`);
    setPusherChannel(channel);

    channel.bind("new-notification", (data) => {
      const newNotification = {
        id: data.id,
        type: data.category,
        title: data.title,
        desc: data.message,
        time: formatTimeAgo(data.created_at),
        icon: getNotificationIcon(data.category),
        actor: data.actor,
        status: data.status,
        read: data.status === "read",
      };

      setNotifications(prev => [newNotification, ...prev]);
      if (data.status === "unread") {
        setUnreadCount(prev => prev + 1);
      }
    });

    channel.bind("notifications-read", (data) => {
      setUnreadCount(data.unread_count);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

   useEffect(() => {
    const handleClickOutside = (event) => {
      // Jika dropdown terbuka dan klik terjadi di luar bell dan dropdown
      if (isBellOpen && 
          !bellRef.current?.contains(event.target) && 
          !dropdownRef.current?.contains(event.target)) {
        setIsBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBellOpen]); 

  const handleNotificationClick = async (notif) => {
    if (notif.status === "unread") {
      await markAsRead(notif.id);
    }
    navigate(`/notification?tab=${notif.type}`);
    setIsBellOpen(false);
  };

  return (
    <div ref={bellRef} className="relative hidden sm:block">
      <div
        onClick={() => setIsBellOpen(!isBellOpen)}
        className="cursor-pointer relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {isBellOpen && (
        <div ref={dropdownRef} className="absolute right-0 z-50 mt-2 bg-white rounded-lg shadow-lg w-80">
          <div className="flex items-center justify-between p-4 font-bold text-white border-b bg-gradient-to-r from-sky-500 to-cyan-400">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-normal hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <ul className="overflow-y-auto text-black divide-y divide-gray-100 max-h-96 scrollbar-hide">
            {loading ? (
              <li className="px-4 py-8 text-center text-gray-400">
                Loading notifications...
              </li>
            ) : notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-400">
                No notifications
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    n.status === "unread" ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 mt-1 bg-gray-100 rounded-full">
                      {n.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-semibold ${
                          n.status === "unread" ? "text-blue-800" : ""
                        }`}
                      >
                        {n.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {n.actor?.name ? `${n.actor.name}: ${n.desc}` : n.desc}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span>{n.time}</span>
                      </div>
                    </div>
                    {n.status === "unread" && (
                      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </li>
              ))
            )}
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
  );
};

export default NotificationDropdown;