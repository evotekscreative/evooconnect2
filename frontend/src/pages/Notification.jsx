import React, { useEffect, useState } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import {
  Bell,
  MoreHorizontal,
  MapPin,
  Heart,
  User,
  FileText,
  Link2,
  Briefcase,
  HeartCrack,
  Trash2,
  Eye,
  Check,
  X,
} from "lucide-react";
import Case from "../components/Case";
import Alert from "../components/Auth/alert";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

const NotificationPage = () => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [notifTab, setNotifTab] = React.useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('tab') || 'all';
  });

  // Sinkronisasi state ke URL saat notifTab berubah
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (notifTab !== (searchParams.get('tab') || 'all')) {
      searchParams.set('tab', notifTab);
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${searchParams.toString()}`
      );
    }
  }, [notifTab]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedNotifId, setSelectedNotifId] = React.useState(null);
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [selectedToDelete, setSelectedToDelete] = React.useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pusherChannel, setPusherChannel] = useState(null);
  const [processingAction, setProcessingAction] = useState(null); // Track which notification is being processed
  const [randomJobs, setRandomJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [alertInfo, setAlertInfo] = React.useState({
    show: false,
    type: "success",
    message: "",
  });

  const fetchRandomJobs = async () => {
    try {
      setLoadingJobs(true);
      const userToken = localStorage.getItem("token");
      const response = await axios.get(apiUrl + "/api/jobs/random", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data?.data?.jobs) {
        setRandomJobs(response.data.data.jobs.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch random jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const notifTabs = [
    { key: "all", label: "All" },
    {
      key: "post",
      label: "Sosial Media",
      icon: <Bell className="w-4 h-4 mr-1" />,
    },
    { key: "job", label: "Jobs", icon: <Briefcase className="w-4 h-4 mr-1" /> },
    {
      key: "connection",
      label: "Connection",
      icon: <User className="w-4 h-4 mr-1" />,
    },
  ];

  const [profileViews, setProfileViews] = useState({
  thisWeek: 0,
  lastWeek: 0,
  percentageChange: 0,
  dailyViews: [],
  chartData: {
    labels: [],
    data: []
  }
});

useEffect(() => {
  fetchProfileViews();
  fetchRandomJobs();
}, []);

const fetchProfileViews = async () => {
  try {
    const userToken = localStorage.getItem("token");

    const [thisWeekResponse, lastWeekResponse] = await Promise.all([
      axios.get(apiUrl + "/api/user/profile/views/this-week", {
        headers: { Authorization: `Bearer ${userToken}` },
      }),
      axios.get(apiUrl + "/api/user/profile/views/last-week", {
        headers: { Authorization: `Bearer ${userToken}` },
      }),
    ]);

    const thisWeekData = thisWeekResponse.data.data || {};
    const lastWeekData = lastWeekResponse.data.data || {};

    const days = [];
    const dailyCounts = [];

    // Prepare last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      days.push(formattedDate);

      // Count views per day
      const dailyViews =
        thisWeekData.viewers?.filter(
          (viewer) => new Date(viewer.viewed_at).toISOString().split('T')[0] === formattedDate
        ) || [];

      dailyCounts.push(dailyViews.length);
    }

    setProfileViews((prev) => {
      const newThisWeek = thisWeekData.count || 0;
      const newLastWeek = lastWeekData.count || 0;

      // If data is the same as before, don't update
      if (prev.thisWeek === newThisWeek && prev.lastWeek === newLastWeek) {
        return prev;
      }

      // Calculate change only if data is different
      let percentageChange = 0;
      if (newLastWeek > 0) {
        percentageChange = ((newThisWeek - newLastWeek) / newLastWeek) * 100;
      } else if (newThisWeek > 0) {
        percentageChange = 100;
      }

      return {
        thisWeek: newThisWeek,
        lastWeek: newLastWeek,
        percentageChange: Math.round(percentageChange),
        dailyViews: thisWeekData.viewers || [],
        chartData: {
          labels: days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
          }),
          data: dailyCounts,
        },
      };
    });
  } catch (error) {
    console.error("Failed to fetch profile views:", error);
    // Fallback to local data if available
    const cachedViews = localStorage.getItem("profileViewsData");
    if (cachedViews) {
      setProfileViews(JSON.parse(cachedViews));
    }
  }
};


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab') || 'all';
    if (tab !== notifTab) {
      setNotifTab(tab);
    }
  }, [window.location.search]);

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
    if (interval >= 1)
      return `${interval} year${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1)
      return `${interval} month${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1)
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;

    return "Just now";
  };

  // Inisialisasi Pusher
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);

    if (!userId) return;

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
      console.log("New notification:", data);
      const notif = data.id
        ? data
        : data.data
        ? data.data
        : data.notification
        ? data.notification
        : {};

      const newNotification = {
        id: notif.id,
        type: notif.category,
        title: notif.title,
        desc: notif.message,
        time: formatTimeAgo(notif.created_at),
        icon: getNotificationIcon(notif.category),
        actor: notif.actor,
        status: notif.status,
        referenceId: notif.reference_id, // Add reference ID for connection requests
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setAlertInfo({
        show: true,
        type: "info",
        message: `New notification: ${newNotification.title}`,
      });
    });

    channel.bind("notifications-read", (data) => {
      console.log("Notifications read update:", data);
      setUnreadCount(data.unread_count);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const getNotificationIcon = (category) => {
    switch (category) {
      case "connection":
        return <User className="text-sky-500" />;
      case "job":
        return <Briefcase className="text-green-500" />;
      case "post":
        return <Bell className="text-red-500" />;
      default:
        return <Eye className="text-gray-400" />;
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await axios.get(apiUrl + "/api/notifications", {
        params: {
          limit: 99,
          offset: 0,
          category: notifTab === "all" ? undefined : notifTab,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const notifData = res.data.data.notifications.map((n) => ({
        id: n.id,
        type: n.category,
        title: n.title,
        desc: n.message,
        time: formatTimeAgo(n.created_at),
        icon: getNotificationIcon(n.category),
        actor: n.actor,
        status: n.status,
        referenceId: n.reference_id, // Add reference ID for connection requests
      }));

      setNotifications(notifData);
      setUnreadCount(res.data.data.unread_count);
    } catch (error) {
      console.error("FETCH ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [notifTab]);

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiUrl + "/api/notifications/mark-read",
        { notification_ids: [notificationId] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read" } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiUrl + "/api/notifications/mark-all-read",
        { category: notifTab === "all" ? undefined : notifTab },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);

      setAlertInfo({
        show: true,
        type: "success",
        message: "Semua notifikasi ditandai sebagai telah dibaca",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteMode(false);
    setSelectedToDelete([]);
  };

  const handleMoreClick = (id) => {
    setSelectedNotifId(id);
    setModalOpen(true);
  };

  const handleDeleteSelectedNotif = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(apiUrl + "/api/notifications/selected", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: { notification_ids: selectedToDelete },
      });
      setNotifications((prev) =>
        prev.filter((n) => !selectedToDelete.includes(n.id))
      );
      setAlertInfo({
        show: true,
        type: "success",
        message: "Notifikasi berhasil dihapus!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Gagal menghapus notifikasi!",
      });
    }
  };

  const handleDeleteAll = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(apiUrl + "/api/notifications", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications([]);
      setModalOpen(false);
      setSelectedNotifId(null);
      setAlertInfo({
        show: true,
        type: "success",
        message: "Semua notifikasi berhasil dihapus!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Gagal menghapus semua notifikasi!",
      });
      setModalOpen(false);
    }
  };

  const handleShowDeleteCheckbox = () => {
    setDeleteMode(true);
    setModalOpen(false);
    setSelectedToDelete([]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedToDelete((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteByCategory = async (category) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.delete(
        `${apiUrl}/api/notifications?category=${category}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.type !== category));
      setAlertInfo({
        show: true,
        type: "success",
        message: `Semua notifikasi kategori "${category}" berhasil dihapus!`,
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Gagal menghapus notifikasi kategori ini!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle accept connection request
  const handleAcceptConnection = async (notification) => {
    const token = localStorage.getItem("token");
    setProcessingAction(notification.id);
    
    try {
      await axios.put(
        `${apiUrl}/api/connections/requests/${notification.referenceId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update notification status
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setAlertInfo({
        show: true,
        type: "success",
        message: "Connection request accepted!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to accept connection",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle reject connection request
  const handleRejectConnection = async (notification) => {
    const token = localStorage.getItem("token");
    setProcessingAction(notification.id);
    
    try {
      await axios.put(
        `${apiUrl}/api/connections/requests/${notification.referenceId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update notification status
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setAlertInfo({
        show: true,
        type: "success",
        message: "Connection request rejected",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to reject connection",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <Case>
      <div className="bg-gray-50 min-h-screen">
        {alertInfo.show && (
          <div className="fixed top-5 right-5 z-50">
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            />
          </div>
        )}

        <div className="container mx-auto px-3 py-5 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left Column - Mobile First Hidden, Show on LG */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4">
                  <div className="text-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      Notification
                    </h2>
                    <p className="text-gray-600">
                      {unreadCount > 0 ? (
                        <>
                          You have{" "}
                          <code className=" text-red-600">{unreadCount}</code>{" "}
                          unread notifications
                        </>
                      ) : (
                        "You're all caught up! Check back later for new notifications"
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      className="border border-blue-500 text-blue-500 rounded-full px-6 py-1 w-full"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Who viewed your profile
                  </h2>
                  
                  {profileViews.dailyViews && profileViews.dailyViews.length > 0 ? (
                    profileViews.dailyViews.slice(0, 3).map((viewer) => (
                      <div key={viewer.id} className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => window.location.href = `/user-profile/${viewer.username}`}>
                        <div className="flex items-center">
                          <div className="w-12 h-12 mr-3 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            {viewer.photo ? (
                              <img
                                src={`${apiUrl}/${viewer.photo}`}
                                alt={viewer.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                                <span className="text-sm font-bold text-gray-600">
                                  {viewer.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{viewer.name}</p>
                            <p className="text-gray-600 text-sm">{viewer.headline || "No headline yet"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      No profile views yet
                    </div>
                  )}
                  
                  {profileViews.dailyViews && profileViews.dailyViews.length > 3 && (
                    <div className="text-center mt-2">
                      <button className="text-blue-600 text-sm hover:underline">
                        See all {profileViews.dailyViews.length} viewers
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Column - Full width on mobile, 3/5 on LG */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recent</h2>
                  </div>

                  {/* Tabs */}
                  <div className="mt-2 flex flex-wrap gap-2 text-sm mb-4">
                    {notifTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setNotifTab(tab.key)}
                        className={`px-4 py-1 border rounded-full flex items-center font-semibold transition
          ${
            notifTab === tab.key
              ? "bg-sky-100 text-sky-700 border-sky-400"
              : "border-sky-400 text-sky-600 hover:bg-sky-50"
          }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                    {notifTab !== "all" && (
                      <button
                        className="ml-1 flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold shadow hover:from-red-600 hover:to-pink-600 transition text-xs"
                        onClick={() => {
                          setCategoryToDelete(notifTab);
                          setShowDeleteCategoryModal(true);
                        }}
                      >
                        <Trash2 size={16} />
                        Delete All&nbsp;
                        <span className="font-bold">
                          {notifTabs.find((t) => t.key === notifTab)?.label}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                {showDeleteCategoryModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-2xl p-7 w-80 relative animate-fadeIn">
                      <div className="flex items-center mb-4">
                        <Bell className="text-sky-500 mr-2" size={22} />
                        <h3 className="font-bold text-lg text-sky-700">
                          Confirm Delete
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6 text-sm">
                        Are you sure you want to delete all notifications in the
                        category "
                        <b>
                          {notifTabs.find((t) => t.key === categoryToDelete)
                            ?.label || categoryToDelete}
                        </b>
                        "? This action cannot be undone.
                      </p>
                      <button
                        className="w-full mb-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
                        onClick={async () => {
                          await handleDeleteByCategory(categoryToDelete);
                          setShowDeleteCategoryModal(false);
                          setCategoryToDelete(null);
                        }}
                      >
                        Yes, Delete
                      </button>
                      <button
                        className="w-full py-2 rounded-lg font-semibold text-gray-500 hover:text-sky-600 hover:bg-gray-100 transition"
                        onClick={() => setShowDeleteCategoryModal(false)}
                      >
                        Cancel
                      </button>
                      <span
                        className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-sky-500"
                        onClick={() => setShowDeleteCategoryModal(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                )}

                {deleteMode && (
                  <div className="flex gap-2 mt-4 px-4">
                    <button
                      className="flex-1 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
                      onClick={handleDeleteSelectedNotif}
                      disabled={selectedToDelete.length === 0}
                    >
                      Delete
                    </button>
                    <button
                      className="flex-1 py-2 rounded-lg font-semibold text-gray-500 hover:text-sky-600 hover:bg-gray-100 transition"
                      onClick={handleCancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center text-gray-400 py-8">
                      Loading...
                    </div>
                  ) : (
                    notifications
                      .filter((n) => notifTab === "all" || n.type === notifTab)
                      .map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 flex border-b hover:bg-gray-50 items-center ${
                            n.status === "unread" ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markAsRead(n.id)}
                        >
                          {deleteMode && (
                            <input
                              type="checkbox"
                              className="mr-3 accent-sky-500 checkbox-white w-[20px] h-[20px]"
                              checked={selectedToDelete.includes(n.id)}
                              onChange={() => handleCheckboxChange(n.id)}
                            />
                          )}
                          <div className="mr-3 flex items-center">{n.icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h3
                                  className={`font-semibold ${
                                    n.status === "unread" ? "text-blue-800" : ""
                                  }`}
                                >
                                  {n.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {n.actor?.name
                                    ? `${n.actor.name}: ${n.desc}`
                                    : n.desc}
                                </p>
                              </div>
                              <div className="flex items-start">
                                <span className="text-gray-500 text-sm whitespace-nowrap">
                                  {n.time}
                                </span>
                                {!deleteMode && (
                                  <button
                                    className="ml-2 text-gray-500 rounded-full hover:bg-gray-200 p-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoreClick(n.id);
                                    }}
                                  >
                                    <MoreHorizontal size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Add Accept/Reject buttons for connection requests */}
                            {n.type === "connection" && n.referenceId && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptConnection(n);
                                  }}
                                  disabled={processingAction === n.id}
                                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition disabled:opacity-50"
                                >
                                  {processingAction === n.id ? (
                                    "Processing..."
                                  ) : (
                                    <>
                                      <Check size={14} />
                                      Accept
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectConnection(n);
                                  }}
                                  disabled={processingAction === n.id}
                                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition disabled:opacity-50"
                                >
                                  {processingAction === n.id ? (
                                    "Processing..."
                                  ) : (
                                    <>
                                      <X size={14} />
                                      Reject
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                  {!loading &&
                    notifications.filter(
                      (n) => notifTab === "all" || n.type === notifTab
                    ).length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        No notifications
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Right Column - Mobile First Hidden, Show on LG */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4 border-b">
                    Similar Jobs
                  </h2>

                  {loadingJobs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading jobs...</span>
                      </div>
                    </div>
                  ) : randomJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No jobs available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {randomJobs.map((job, index) => (
                        <div
                          key={job.id}
                          className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/jobs/${job.id}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {job.title}
                              </h4>
                              <p className="text-blue-500 text-xs font-medium">
                                {job.company?.name || 'Company'}
                              </p>
                            </div>
                            {job.company?.logo && (
                              <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center ml-2 flex-shrink-0">
                                <img
                                  src={job.company.logo.startsWith("http") ? job.company.logo : `${apiUrl}/${job.company.logo}`}
                                  alt="Company Logo"
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-600 text-xs mb-2">
                            <MapPin size={12} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{job.location || 'Remote'}</span>
                          </div>
                          
                          {(job.min_salary || job.max_salary) && (
                            <div className="text-green-600 text-xs font-medium mb-2">
                              {job.min_salary && job.max_salary 
                                ? `${job.currency || '$'} ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}`
                                : job.min_salary 
                                ? `From ${job.currency || '$'} ${job.min_salary.toLocaleString()}`
                                : `Up to ${job.currency || '$'} ${job.max_salary.toLocaleString()}`
                              }
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {job.job_type || 'Full-time'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {job.created_at ? dayjs(job.created_at).fromNow() : 'Recently posted'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>



            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Show only on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
          <div className="flex justify-around items-center p-2">
            {notifTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setNotifTab(tab.key)}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  notifTab === tab.key
                    ? "text-sky-600 bg-sky-50"
                    : "text-gray-600"
                }`}
              >
                {tab.icon ? (
                  React.cloneElement(tab.icon, { size: 20 })
                ) : (
                  <span className="h-5 w-5" />
                )}
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-2xl p-7 w-80 relative animate-fadeIn">
              <div className="flex items-center mb-4">
                <Bell className="text-sky-500 mr-2" size={22} />
                <h3 className="font-bold text-lg text-sky-700">
                  Notification Action
                </h3>
              </div>
              <p className="text-gray-500 mb-6 text-sm">
                Select the action you want to take on this notification.
              </p>
              <button
                className="w-full mb-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
                onClick={handleDeleteAll}
              >
                <span className="flex items-center justify-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete All
                </span>
              </button>
              <button
                className="w-full mb-3 py-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-sky-600 transition"
                onClick={handleShowDeleteCheckbox}
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Select and Delete Multiple
                </span>
              </button>
              <button
                className="w-full py-2 rounded-lg font-semibold text-gray-500 hover:text-sky-600 hover:bg-gray-100 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <span
                className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-sky-500"
                onClick={() => setModalOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>
    </Case>
  );
};

export default NotificationPage;