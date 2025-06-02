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
} from "lucide-react";
import Case from "../components/Case";
import Alert from "../components/Auth/alert";

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

  const [alertInfo, setAlertInfo] = React.useState({
    show: false,
    type: "success",
    message: "",
  });

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

  // Function to format time as "X time ago"
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

    // Konfigurasi Pusher
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
        type: notif.category, // <-- PENTING!
        title: notif.title,
        desc: notif.message,
        time: formatTimeAgo(notif.created_at),
        icon: getNotificationIcon(notif.category),
        actor: notif.actor,
        status: notif.status,
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

      // Update status notifikasi di local state
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

      // Update semua notifikasi ke status read
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
      setNotifications([]); // Kosongkan notifikasi di state
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

  // Handle checkbox change
  const handleCheckboxChange = (id) => {
    setSelectedToDelete((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ...existing code...
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
      // Hapus notifikasi di state sesuai kategori
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
  // ...existing code...

  return (
    <Case>
      <div className="bg-gray-100 min-h-screen">
        {alertInfo.show && (
          <div className="fixed top-5 right-5 z-50">
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            />
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Mobile First Hidden, Show on LG */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="">
                  <img
                    src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                    className="w-full h-auto"
                  />
                </div>
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
              <div className="max-w-sm rounded-lg bg-white shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-green-500 rounded-full"></div>
                  </div>

                  <div className="text-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Envato</h2>
                    <p className="text-gray-500">Melbourne, AU</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium">1 day ago</span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Applicant Rank</span>
                    <span className="font-medium">25</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Full width on mobile, 2/4 on LG */}
            <div className="w-full lg:w-2/4">
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
            <div className="hidden lg:block lg:w-1/4">
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4 border-b">
                  <button className="bg-red-500 text-white rounded-lg flex items-center justify-center py-2 px-4 w-full">
                    <Bell className="mr-2" size={18} />
                    Set alert for jobs
                  </button>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4 border-b">
                    Similar Jobs
                  </h2>

                  <div className="mb-4">
                    <div className="bg-gray-100 p-4 rounded-lg ">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-semibold">Product Director</h3>
                        <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                          <img
                            src="/api/placeholder/24/24"
                            alt="Company Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-blue-500">Spotify Inc.</p>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin size={14} className="mr-1" />
                        <span>India, Punjab</span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                        </div>
                        <span className="text-gray-600 text-sm ml-2">
                          18 connections
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Who viewed your profile
                  </h2>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-3 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src="/api/placeholder/48/48"
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Sophia Lee</p>
                        <p className="text-gray-600 text-sm">@Harvard</p>
                      </div>
                    </div>
                    <button className="border border-blue-500 text-blue-500 rounded-full px-4 py-1">
                      Connect
                    </button>
                  </div>
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
                )}{" "}
                {/* Placeholder jika tidak ada icon */}
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
