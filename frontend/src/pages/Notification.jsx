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
  Grid,
  Check,
  X,
} from "lucide-react";
import Case from "../components/Case";
import Alert from "../components/Auth/alert";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime"; // Tambahkan import ini

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const NotificationPage = () => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [notifTab, setNotifTab] = React.useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("tab") || "all";
  });

  // Sinkronisasi state ke URL saat notifTab berubah
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (notifTab !== (searchParams.get("tab") || "all")) {
      searchParams.set("tab", notifTab);
      window.history.replaceState(
        null,
        "",
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
  const [connectionStatus, setConnectionStatus] = useState({});

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
    {
      key: "all",
      label: "All",
      icon: <Grid className="w-4 h-4 mr-0" />,
    },
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
      data: [],
    },
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
        const formattedDate = date.toISOString().split("T")[0];
        days.push(formattedDate);

        // Count views per day
        const dailyViews =
          thisWeekData.viewers?.filter(
            (viewer) =>
              new Date(viewer.viewed_at).toISOString().split("T")[0] ===
              formattedDate
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
            labels: days.map((date) => {
              const d = new Date(date);
              return d.toLocaleDateString("en-US", { weekday: "short" });
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
    const tab = searchParams.get("tab") || "all";
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

  // Tambahkan fungsi handleAcceptConnection// Tambahkan state untuk melacak status koneksi

  // Modifikasi fungsi handleAcceptConnection
  const handleAcceptConnection = async (notification) => {
    const token = localStorage.getItem("token");

    try {
      setProcessingAction(notification.id);

      // Panggil API untuk menerima permintaan koneksi
      await axios.put(
        `${apiUrl}/api/connections/requests/${notification.referenceId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update status koneksi untuk notifikasi ini
      setConnectionStatus((prev) => ({
        ...prev,
        [notification.id]: "accepted",
      }));

      // Update notifikasi dengan status koneksi baru
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, connectionStatus: "accepted" } : n
        )
      );

      // Tampilkan pesan sukses
      setAlertInfo({
        show: true,
        type: "success",
        message: "Connection request accepted successfully!",
      });
    } catch (error) {
      console.error("Failed to accept connection:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to accept connection request",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Modifikasi fungsi handleRejectConnection
  const handleRejectConnection = async (notification) => {
    const token = localStorage.getItem("token");

    try {
      setProcessingAction(notification.id);

      // Panggil API untuk menolak permintaan koneksi
      await axios.put(
        `${apiUrl}/api/connections/requests/${notification.referenceId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update status koneksi untuk notifikasi ini
      setConnectionStatus((prev) => ({
        ...prev,
        [notification.id]: "rejected",
      }));

      // Update notifikasi dengan status koneksi baru
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, connectionStatus: "rejected" } : n
        )
      );

      // Tampilkan pesan sukses
      setAlertInfo({
        show: true,
        type: "success",
        message: "Connection request rejected",
      });
    } catch (error) {
      console.error("Failed to reject connection:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to reject connection request",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const formatPostTime = (dateString) => {
    if (!dateString) return "";

    try {
      const utcDate = dayjs.utc(dateString);

      if (!utcDate.isValid()) {
        console.warn("Invalid date:", dateString);
        return "";
      }

      const now = dayjs.utc();
      const diffInHours = now.diff(utcDate, "hour");

      if (diffInHours < 24) {
        return utcDate.format("h:mm A"); // hasil: 2:49 AM // Format 24 jam, misal: 02:49
      } else {
        return utcDate.format("MMM D [at] HH:mm"); // Misal: Jun 5 at 02:49
      }
    } catch (error) {
      console.error("Time formatting error:", error);
      return "";
    }
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
        time: formatPostTime(notif.created_at),
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

      const notifData = res.data.data.notifications.map((n) => {
        // Deteksi lebih akurat untuk permintaan koneksi masuk
        const isConnectionRequest =
          n.category === "connection" &&
          n.reference_id &&
          (n.title.toLowerCase().includes("wants to connect") ||
            n.message.toLowerCase().includes("wants to connect")) &&
          // Pastikan ini adalah permintaan yang belum diproses
          !n.connection_status;

        return {
          id: n.id,
          type: n.category,
          title: n.title,
          desc: n.message,
          time: formatPostTime(n.created_at),
          icon: getNotificationIcon(n.category),
          actor: n.actor,
          status: n.status,
          referenceId: n.reference_id,
          connectionStatus: n.connection_status || null,
          isConnectionRequest: isConnectionRequest,
        };
      });

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
      await axios.delete(`${apiUrl}/api/notifications?category=${category}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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

  return (
    <Case>
      <div className="min-h-screen bg-gray-50">
        {alertInfo.show && (
          <div className="fixed z-50 top-5 right-5">
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            />
          </div>
        )}

        <div className="container px-3 py-5 mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row">
            {/* Left Column - Mobile First Hidden, Show on LG */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="mb-4 bg-white rounded-lg shadow">
                <div className="p-4">
                  <div className="mb-2 text-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      Notification
                    </h2>
                    <p className="text-gray-600">
                      {unreadCount > 0 ? (
                        <>
                          You have{" "}
                          <code className="text-red-600 ">{unreadCount}</code>{" "}
                          unread notifications
                        </>
                      ) : (
                        "You're all caught up! Check back later for new notifications"
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      className="w-full px-6 py-1 text-blue-500 border border-blue-500 rounded-full"
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
                  <h2 className="mb-4 text-xl font-semibold">
                    Who viewed your profile
                  </h2>

                  {profileViews.dailyViews &&
                  profileViews.dailyViews.length > 0 ? (
                    profileViews.dailyViews.slice(0, 3).map((viewer) => (
                      <div
                        key={viewer.id}
                        className="flex items-center justify-between p-2 mb-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          (window.location.href = `/user-profile/${viewer.username}`)
                        }
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12 mr-3 overflow-hidden bg-gray-200 rounded-full">
                            {viewer.photo ? (
                              <img
                                src={`${apiUrl}/${viewer.photo}`}
                                alt={viewer.name}
                                className="object-cover w-full h-full rounded-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                                <span className="text-sm font-bold text-gray-600">
                                  {viewer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{viewer.name}</p>
                            <p className="text-sm text-gray-600">
                              {viewer.headline || "No headline yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-400">
                      No profile views yet
                    </div>
                  )}

                  {profileViews.dailyViews &&
                    profileViews.dailyViews.length > 3 && (
                      <div className="mt-2 text-center">
                        <button className="text-sm text-blue-600 hover:underline">
                          See all {profileViews.dailyViews.length} viewers
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Center Column - Full width on mobile, 3/5 on LG */}
            <div className="w-full lg:w-3/5">
              <div className="mb-4 bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  {/* NAVBAR TABS - hanya tampil di mobile */}
                  <div className="block lg:hidden">
                    <div className="flex gap-2 pb-1 mb-4 overflow-x-auto text-sm whitespace-nowrap">
                      {notifTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setNotifTab(tab.key)}
                          className={`flex flex-col items-center min-w-[64px] px-2 py-2 rounded-lg transition ${
                            notifTab === tab.key
                              ? "text-sky-600 bg-sky-50"
                              : "text-gray-600"
                          }`}
                        >
                          {tab.icon ? (
                            React.cloneElement(tab.icon, { size: 20 })
                          ) : (
                            <span className="w-5 h-5" />
                          )}
                          <span className="mt-1 text-xs">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold">Recent</h2>
                  {/* NAVBAR TABS - hanya tampil di desktop */}
                  <div className="flex-wrap hidden gap-2 mt-4 lg:flex">
                    {notifTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setNotifTab(tab.key)}
                        className={`flex items-center px-4 py-1.5 rounded-full border-2 transition font-semibold text-sm
                        ${
                          notifTab === tab.key
                            ? "border-sky-400 text-sky-600 bg-sky-50"
                            : "border-sky-300 text-sky-500 hover:border-sky-400 bg-white"
                        }`}
                        style={{ minWidth: 80, maxWidth: "100%" }}
                      >
                        {tab.icon &&
                          React.cloneElement(tab.icon, {
                            size: 18,
                            className: "mr-2",
                          })}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                {showDeleteCategoryModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="relative bg-white shadow-2xl rounded-xl p-7 w-80 animate-fadeIn">
                      <div className="flex items-center mb-4">
                        <Bell className="mr-2 text-sky-500" size={22} />
                        <h3 className="text-lg font-bold text-sky-700">
                          Confirm Delete
                        </h3>
                      </div>
                      <p className="mb-6 text-sm text-gray-600">
                        Are you sure you want to delete all notifications in the
                        category "
                        <b>
                          {notifTabs.find((t) => t.key === categoryToDelete)
                            ?.label || categoryToDelete}
                        </b>
                        "? This action cannot be undone.
                      </p>
                      <button
                        className="w-full py-2 mb-3 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                        onClick={async () => {
                          await handleDeleteByCategory(categoryToDelete);
                          setShowDeleteCategoryModal(false);
                          setCategoryToDelete(null);
                        }}
                      >
                        Yes, Delete
                      </button>
                      <button
                        className="w-full py-2 font-semibold text-gray-500 transition rounded-lg hover:text-sky-600 hover:bg-gray-100"
                        onClick={() => setShowDeleteCategoryModal(false)}
                      >
                        Cancel
                      </button>
                      <span
                        className="absolute text-gray-400 cursor-pointer top-2 right-3 hover:text-sky-500"
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
                  <div className="flex gap-2 px-4 mt-4">
                    <button
                      className="flex-1 py-2 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      onClick={handleDeleteSelectedNotif}
                      disabled={selectedToDelete.length === 0}
                    >
                      Delete
                    </button>
                    <button
                      className="flex-1 py-2 font-semibold text-gray-500 transition rounded-lg hover:text-sky-600 hover:bg-gray-100"
                      onClick={handleCancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="">
                  {loading ? (
                    <div className="py-8 text-center text-gray-400">
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
                          <div className="flex items-center mr-3">{n.icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="flex-1 mr-4">
                                <h3
                                  className={`font-semibold ${
                                    n.status === "unread" ? "text-blue-800" : ""
                                  }`}
                                >
                                  {n.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {n.actor?.name
                                    ? `${n.actor.name}: ${n.desc}`
                                    : n.desc}
                                </p>
                              </div>
                              <div className="flex items-start">
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                  {n.time}
                                </span>
                                {!deleteMode && (
                                  <button
                                    className="p-1 ml-2 text-gray-500 rounded-full hover:bg-gray-200"
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

                            {/* Add Accept/Reject buttons fornnection requests */}
                            {/* Add Accept/Reject buttons for connection requests */}
                            {n.isConnectionRequest && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptConnection(n);
                                  }}
                                  disabled={processingAction === n.id}
                                  className="flex items-center gap-1 px-3 py-1 text-xs text-white transition bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
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
                                  className="flex items-center gap-1 px-3 py-1 text-xs text-white transition bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
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

                            {/* Show status after action */}
                            {n.type === "connection" &&
                              (connectionStatus[n.id] === "accepted" ||
                                n.connectionStatus === "accepted") && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs text-green-800 bg-green-100 rounded">
                                    <Check size={14} />
                                    Accepted
                                  </span>
                                </div>
                              )}

                            {n.type === "connection" &&
                              (connectionStatus[n.id] === "rejected" ||
                                n.connectionStatus === "rejected") && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs text-gray-800 bg-gray-100 rounded">
                                    <X size={14} />
                                    Rejected
                                  </span>
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
                      <div className="py-8 text-center text-gray-400">
                        No notifications
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Right Column - Mobile First Hidden, Show on LG */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="mb-4 bg-white rounded-lg shadow">
                <div className="p-4">
                  <h2 className="mb-4 text-xl font-semibold border-b">
                    Similar Jobs
                  </h2>

                  {loadingJobs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        <span className="text-sm">Loading jobs...</span>
                      </div>
                    </div>
                  ) : randomJobs.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-gray-500">No jobs available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {randomJobs.map((job, index) => (
                        <div
                          key={job.id}
                          className="p-3 transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          onClick={() =>
                            (window.location.href = `/jobs/${job.id}`)
                          }
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {job.title}
                              </h4>
                              <p className="text-xs font-medium text-blue-500">
                                {job.company?.name || "Company"}
                              </p>
                            </div>
                            {job.company?.logo && (
                              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 p-1 ml-2 bg-white rounded-full">
                                <img
                                  src={
                                    job.company.logo.startsWith("http")
                                      ? job.company.logo
                                      : `${apiUrl}/${job.company.logo}`
                                  }
                                  alt="Company Logo"
                                  className="object-cover w-full h-full rounded-full"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center mb-2 text-xs text-gray-600">
                            <MapPin size={12} className="flex-shrink-0 mr-1" />
                            <span className="truncate">
                              {job.location || "Remote"}
                            </span>
                          </div>

                          {(job.min_salary || job.max_salary) && (
                            <div className="mb-2 text-xs font-medium text-green-600">
                              {job.min_salary && job.max_salary
                                ? `${
                                    job.currency || "$"
                                  } ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}`
                                : job.min_salary
                                ? `From ${
                                    job.currency || "$"
                                  } ${job.min_salary.toLocaleString()}`
                                : `Up to ${
                                    job.currency || "$"
                                  } ${job.max_salary.toLocaleString()}`}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {job.job_type || "Full-time"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {job.created_at
                                ? dayjs(job.created_at).fromNow()
                                : "Recently posted"}
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
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg lg:hidden"></div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="relative bg-white shadow-2xl rounded-xl p-7 w-80 animate-fadeIn">
              <div className="flex items-center mb-4">
                <Bell className="mr-2 text-sky-500" size={22} />
                <h3 className="text-lg font-bold text-sky-700">
                  Notification Action
                </h3>
              </div>
              <p className="mb-6 text-sm text-gray-500">
                Select the action you want to take on this notification.
              </p>
              <button
                className="w-full py-2 mb-3 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                onClick={handleDeleteAll}
              >
                <span className="flex items-center justify-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete All
                </span>
              </button>
              <button
                className="w-full py-2 mb-3 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600"
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
                className="w-full py-2 font-semibold text-gray-500 transition rounded-lg hover:text-sky-600 hover:bg-gray-100"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <span
                className="absolute text-gray-400 cursor-pointer top-2 right-3 hover:text-sky-500"
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
