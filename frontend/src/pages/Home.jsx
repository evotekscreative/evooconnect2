import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Tooltip as ChartTooltip } from "chart.js";
import { Button } from "../components/Button";
import Tooltip from "@mui/material/Tooltip";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Auth/alert";
import { Line } from "react-chartjs-2";
import "../assets/css/style.css";
import {
  SquarePen,
  NotebookPen,
  ThumbsUp,
  MessageCircle,
  Share2,
  Globe,
  LockKeyhole,
  Users,
  Image as ImageIcon,
  X,
  Ellipsis,
  MoreHorizontal,
  RefreshCw,
  UserPlus,
  TrendingUp,
  TrendingDown,
  TriangleAlert,
  Copy,
  Instagram,
  Twitter,
  CircleHelp,
  MapPin,
  Check,
} from "lucide-react";

export default function SocialNetworkFeed() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const clientUrl =
    import.meta.env.VITE_APP_CLIENT_URL || "http://localhost:5173";
  const [postContent, setPostContent] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("update");
  const [editActiveTab, setEditActiveTab] = useState("update");
  const [editPostContent, setEditPostContent] = useState("");
  const [editArticleContent, setEditArticleContent] = useState("");
  const [newPostImages, setNewPostImages] = useState([]);
  const [editPostImages, setEditPostImages] = useState([]);
  const [newEditImages, setNewEditImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentError, setCommentError] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [user, setUser] = useState({
    name: "",
    photo: null,
    username: "",
    initials: "UU",
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [profileViews, setProfileViews] = useState({
    thisWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
    dailyViews: [],
  });
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(null);
  const [postVisibility, setPostVisibility] = useState("public");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTarget, setReportTarget] = useState({
    userId: null,
    targetType: null,
    targetId: null,
  });
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [allReplies, setAllReplies] = useState({});
  const [showShowcase, setShowShowcase] = useState(false);
  const [showcaseReplies, setShowcaseReplies] = useState([]);
  const [allRepliesLoaded, setAllRepliesLoaded] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const addAlert = (type, message) => {
    setAlertInfo({
      show: true,
      type: type,
      message: message,
    });
    setTimeout(() => {
      setAlertInfo(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchSuggestedConnections = async () => {
    try {
      setLoadingSuggested(true);
      const userToken = localStorage.getItem("token");
      const response = await axios.get(apiUrl + "/api/user-peoples", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data?.data) {
        // Filter out people you're already connected with
        const connectedIds = connections.map((conn) => conn.id);
        const filtered = response.data.data.filter(
          (person) => !connectedIds.includes(person.id)
        );

        // Get 3 random suggestions
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        const suggestions = shuffled.slice(0, 3).map((person) => ({
          id: person.id,
          name: person.name || "Unknown User",
          username: person.username || "unknown",
          initials: person.name
            ? person.name
              .split(" ")
              .map((n) => n[0])
              .join("")
            : "UU",
          photo: person.photo || null,
          headline: person.headline || "No headline specified",
        }));

        setSuggestedConnections(suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch suggested connections:", error);
    } finally {
      setLoadingSuggested(false);
    }
  };

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

      const newThisWeek = thisWeekData.count || 0;
      const newLastWeek = lastWeekData.count || 0;

      // Jika data sama dengan sebelumnya, langsung return
      if (profileViews.thisWeek === newThisWeek && profileViews.lastWeek === newLastWeek) {
        return;
      }

      // Hitung perubahan persentase
      let percentageChange = 0;
      if (newLastWeek > 0) {
        percentageChange = ((newThisWeek - newLastWeek) / newLastWeek) * 100;
      } else if (newThisWeek > 0) {
        percentageChange = 100;
      }

      // Siapkan data chart hanya jika diperlukan
      const days = [];
      const dailyCounts = [];
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
        days.push(date);
        const dailyViews = thisWeekData.viewers?.filter(
          (viewer) => dayjs(viewer.viewed_at).format("YYYY-MM-DD") === date
        ) || [];
        dailyCounts.push(dailyViews.length);
      }

      setProfileViews({
        thisWeek: newThisWeek,
        lastWeek: newLastWeek,
        percentageChange: Math.round(percentageChange),
        dailyViews: thisWeekData.viewers || [],
        chartData: {
          labels: days.map((date) => dayjs(date).format("ddd")),
          data: dailyCounts,
        },
      });
    } catch (error) {
      console.error("Failed to fetch profile views:", error);
    }
  };

  const fetchConnections = async () => {
    try {
      const userToken = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user")).id;
      const response = await axios.get(
        `${apiUrl}/api/users/${userId}/connections`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const connectionsData = response.data.data.connections || [];
      const formattedConnections = connectionsData.map((connection) => ({
        id: connection.user.id,
        name: connection.user.name || "Unknown User",
        username: connection.user.username || "unknown",
        initials: connection.user.name
          ? connection.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
          : "UU",
        photo: connection.user.photo || null,
        status: connection.status,
      }));

      setConnections(formattedConnections);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      // Fallback ke data lokal jika ada
    }
  };

  useEffect(() => {
    // Simpan fungsi fetch dalam variabel
    const fetchData = async () => {
      await fetchProfileViews();
      await fetchConnections();
      await fetchSuggestedConnections();
    };

    fetchData();

    // Bersihkan jika komponen unmount
    return () => {
      // Cleanup jika perlu
    };
  }, []); // Empty array untuk eksekusi sekali saja
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserId(parsedUser.id);
    }
  }, []);
  const handleOpenPostOptions = (postId) => {
    setSelectedPostId(postId);
    setShowPostOptions(true);
  };

  const handleClosePostOptions = () => {
    setShowPostOptions(false);
    setSelectedPostId(null);
  };

  const getLast7DaysData = () => {
    // Jika data dari API tersedia
    if (profileViews.dailyViews && profileViews.dailyViews.length > 0) {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
        days.push(date);
      }

      const dailyCounts = days.map((date) => {
        const count = profileViews.dailyViews.filter(
          (viewer) => dayjs(viewer.viewed_at).format("YYYY-MM-DD") === date
        ).length;
        return count;
      });

      const labels = days.map((date) => dayjs(date).format("ddd"));
      return { labels, data: dailyCounts };
    }

    // Fallback ke data lokal (mungkin tidak ada)
    const views = JSON.parse(localStorage.getItem("profileViews")) || {};
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      labels.push(dayjs(date).format("ddd"));
      data.push(views[date] || 0); // Jika tidak ada data, nilai default 0
    }

    return { labels, data };
  };
  const { labels, data } = getLast7DaysData();

  const chartData = useMemo(() => {
    const defaultLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const defaultData = [0, 0, 0, 0, 0, 0, 0];

    return {
      labels: profileViews.chartData?.labels || defaultLabels,
      datasets: [
        {
          label: "Profile Views",
          data: profileViews.chartData?.data || defaultData,
          fill: false,
          borderColor: "#06b6d4",
          backgroundColor: "#06b6d4",
          tension: 0.4,
        },
      ],
    };
  }, [profileViews.chartData?.labels, profileViews.chartData?.data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
        },
      },
    },
  };

  useEffect(() => {
    console.log("chartOptions", chartOptions);
    console.log("chartData", chartData);
  }, [chartOptions, chartData]);

  const handlePostAction = (action) => {
    const post = posts.find((p) => p.id === selectedPostId);

    if (!post) {
      console.error("Post not found");
      return;
    }

    if (action === "report") {
      setShowReportModal(true);
    }

    switch (action) {
      case "edit":
        handleEditPost(post);
        break;
      case "delete":
        handleDeletePost(post.id);
        break;
      case "report":
        console.log("Report post:", post.id);
        break;
      case "connect":
        handleConnectWithUser(post.user?.id);
        console.log("Connect with user:", post.user?.id);
        break;
      default:
        console.error("Unknown action:", action);
    }

    handleClosePostOptions(); // Tutup modal setelah aksi selesai
  };

  const handleConnectWithUser = async (userId) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found");
      }

      // Check if already connected
      const isConnected = connections.some((conn) => conn.id === userId);
      if (isConnected) {
        setAlertInfo({
          show: true,
          type: "info",
          message: "You're already connected with this user",
        });
        return;
      }

      setLoadingSuggested(true); // Set loading state

      // Optimistic update
      const tempConnection = {
        id: userId,
        name:
          suggestedConnections.find((p) => p.id === userId)?.name ||
          "New Connection",
        username:
          suggestedConnections.find((p) => p.id === userId)?.username ||
          "newuser",
        initials:
          suggestedConnections.find((p) => p.id === userId)?.initials || "NC",
        photo: suggestedConnections.find((p) => p.id === userId)?.photo || null,
        status: "pending",
      };

      setConnections((prev) => [...prev, tempConnection]);
      setSuggestedConnections((prev) => prev.filter((p) => p.id !== userId));

      // Send connection request
      const response = await axios.post(
        `${apiUrl}/api/users/${userId}/connect`,
        {},
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.data.success) {
        // Update with actual data from response
        const newConnection = {
          id: userId,
          name: response.data.data?.user?.name || tempConnection.name,
          username:
            response.data.data?.user?.username || tempConnection.username,
          initials: response.data.data?.user?.name
            ? response.data.data.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
            : tempConnection.initials,
          photo: response.data.data?.user?.photo || tempConnection.photo,
          status: response.data.data?.status || "connected",
        };

        setConnections((prev) =>
          prev.map((conn) => (conn.id === userId ? newConnection : conn))
        );

        setAlertInfo({
          show: true,
          type: "success",
          message: "Connection request sent successfully!",
        });
      }
    } catch (error) {
      console.error("Failed to connect with user:", error);

      // Rollback optimistic update
      setConnections((prev) => prev.filter((conn) => conn.id !== userId));
      setSuggestedConnections((prev) => [
        ...prev,
        suggestedConnections.find((p) => p.id === userId) || {
          id: userId,
          name: "Unknown User",
          username: "unknown",
          initials: "UU",
          photo: null,
        },
      ]);

      setAlertInfo({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "You've already sent a connection request to this user",
      });
    } finally {
      setLoadingSuggested(false); // Reset loading state
    }
  };

  const fetchPosts = useCallback(
    async (pageNum = 0, append = false) => {
      try {
        if (pageNum === 0) {
          setLoadingPosts(true);
        } else {
          setIsLoadingMore(true);
        }

        const userToken = localStorage.getItem("token");
        const limit = 10; // Memuat 10 postingan per halaman
        const offset = pageNum * limit;

        // Fetch data dari API
        const response = await axios.get(
          `${apiUrl}/api/posts?limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );

        if (response.data?.data) {
          // Transformasi data setelah fetch
          const formattedPosts = response.data.data.map((post) => ({
            id: post.id,
            content: post.content,
            images: post.images?.map((img) =>
              img.startsWith("http") ? img : `${apiUrl}/${img}`
            ) || [],
            user: post.user || {
              id: post.user_id,
              name: "Unknown User",
              initials: "UU",
              username: "unknown",
            },
            group: post.group || null,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            created_at: post.created_at, // Jangan beri fallback
            visibility: post.visibility || "public",
            isLiked: post.is_liked || false,
          }));

          // Update state posts
          if (append) {
            setPosts((prevPosts) => [...prevPosts, ...formattedPosts]);
          } else {
            setPosts(formattedPosts);
          }

          if (formattedPosts.length < limit) {
            setHasMore(false); // Tidak ada lagi postingan untuk dimuat
          }
          else {
            setHasMore(true); // Masih ada postingan untuk dimuat
          }

          if (pageNum > 0) {
            setPage(pageNum);
          }
        } else {
          setHasMore(false); // Tidak ada data yang diterima
          if (!append) {
            setPosts([]); // Reset posts jika tidak ada data
          }
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        if (!localStorage.getItem("cachedPosts")) {
          setError("Failed to load posts. Please try again later.");
        }
      } finally {
        setLoadingPosts(false);
        setIsLoadingMore(false);
      }
    },
    [apiUrl]
  );

  // Inisialisasi Intersection Observer untuk infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !loadingPosts
        ) {
          fetchPosts(page + 1, true);
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    // Cleanup observer
    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [fetchPosts, hasMore, isLoadingMore, loadingPosts, page]);

  // Fetch posts pertama kali
  useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  const openPremiumModal = () => {
    setShowPremiumModal(true);
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleVisibilityChange = (visibility) => {
    setPostVisibility(visibility);
  };

  const openImageModal = (post, index) => {
    // Pastikan semua gambar memiliki URL lengkap
    const images = post.images.map((img) =>
      img.startsWith("http") ? img : `${apiUrl}/${img}`
    );

    setSelectedPost({
      ...post,
      images: images,
    });
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedPost(null);
    setSelectedImageIndex(0);
  };

  const navigateImage = (direction) => {
    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedPost.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === selectedPost.images.length - 1 ? 0 : prev + 1
      );
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
      const diffInHours = now.diff(utcDate, 'hour');

      if (diffInHours < 24) {
        return utcDate.format('h:mm A'); // hasil: 2:49 AM // Format 24 jam, misal: 02:49
      } else {
        return utcDate.format('MMM D [at] HH:mm'); // Misal: Jun 5 at 02:49
      }
    } catch (error) {
      console.error("Time formatting error:", error);
      return "";
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewPostImages([...newPostImages, ...imagePreviews]);
  };
  const removeImage = (index) => {
    const newImages = [...newPostImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setNewPostImages(newImages);
  };

  const handlePostSubmit = async () => {
    if (selectedPostId) {
      await handleUpdatePost();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = activeTab === "update" ? postContent : articleContent;
      const userToken = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", postVisibility);

      // Tambahkan semua gambar ke FormData
      newPostImages.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file);
        }
      });

      const response = await axios.post(apiUrl + "/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }

      // Pastikan response.data.data.images adalah array URL gambar
      const images = response.data.data.images || [];

      // Gunakan waktu saat ini untuk memastikan waktu postingan langsung muncul
      const currentTime = new Date().toISOString();

      const newPost = {
        id: response.data.data.id,
        content: response.data.data.content || content,
        images: images.map((img) => {
          // Pastikan URL gambar lengkap jika backend hanya mengembalikan nama file
          return img.startsWith("http") ? img : `${apiUrl}/${img}`;
        }),
        visibility: response.data.data.visibility || postVisibility,
        likes_count: response.data.data.likes_count || 0,
        comments_count: response.data.data.comments_count || 0,
        created_at: response.data.data.created_at || currentTime, // Gunakan created_at bukan createdAt
        user: response.data.data.user || {
          id: currentUserId,
          name: user.name || "Current User",
          photo: user.photo || "",
          initials: user.initials || "CU",
          username: user.username || "user",
        },
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setPostContent("");
      setArticleContent("");
      setNewPostImages([]); // Reset gambar setelah posting

      setAlertInfo({
        show: true,
        type: "success",
        message: "Successfully created post!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Field is required",
      });
      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to create post. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
    setCommentText("");
    setReplyingTo(null);
    setReplyText("");
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      setCommentError(null);

      // Coba muat dari cache terlebih dahulu
      const cachedComments = localStorage.getItem(`comments_${postId}`);
      if (cachedComments) {
        const parsedComments = JSON.parse(cachedComments);
        setComments((prev) => ({ ...prev, [postId]: parsedComments }));
      }

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/post-comments/${postId}?limit=10&offset=0&includeReplies=true`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      const commentsWithReplies = (response.data?.data?.comments || []).map(
        (comment) => {
          // Muat replies dari cache jika ada
          const cachedReplies = localStorage.getItem(`replies_${comment.id}`);
          const replies = cachedReplies
            ? JSON.parse(cachedReplies)
            : Array.isArray(comment.replies)
              ? comment.replies
              : [];

          return {
            id: comment.id || Math.random().toString(36).substr(2, 9),
            content: comment.content || "",
            user: comment.user || {
              name: "Unknown User",
              initials: "UU",
              username: "unknown",
              profile_photo: null,
            },
            replies: replies,
            repliesCount: comment.replies_count || replies.length,
          };
        }
      );

      // Simpan ke localStorage
      // localStorage.setItem(
      //   `comments_${postId}`,
      //   JSON.stringify(commentsWithReplies)
      // );

      setComments((prev) => ({
        ...prev,
        [postId]: commentsWithReplies,
      }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setCommentError("Failed to load comments");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/comments/${commentId}/replies`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const replies = response.data.data.comments || [];

      const processedReplies = replies.map((reply) => ({
        ...reply,
        // Create initials for the reply user
        user: reply.user
          ? {
            ...reply.user,
            initials: reply.user.name
              ? reply.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
              : "UU",
          }
          : { name: "Unknown User", initials: "UU" },
        // Ensure replyTo has complete user data including initials
        replyTo: reply.reply_to_id
          ? replies.find((r) => r.id === reply.reply_to_id)?.user
            ? {
              id: replies.find((r) => r.id === reply.reply_to_id).user.id,
              name:
                replies.find((r) => r.id === reply.reply_to_id).user.name ||
                "Unknown User",
              username:
                replies.find((r) => r.id === reply.reply_to_id).user
                  .username || "unknown",
              initials: replies.find((r) => r.id === reply.reply_to_id).user
                .name
                ? replies
                  .find((r) => r.id === reply.reply_to_id)
                  .user.name.split(" ")
                  .map((n) => n[0])
                  .join("")
                : "UU",
            }
            : null
          : null,
      }));

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: processedReplies,
      }));
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    }
  };

  const fetchAllReplies = async (commentId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [commentId]: true }));

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/comments/${commentId}/replies?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const replies = Array.isArray(response.data?.data)
        ? response.data.data.map((reply) => ({
          ...reply,
          // Create initials for the reply user
          user: reply.user
            ? {
              ...reply.user,
              initials: reply.user.name
                ? reply.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                : "UU",
            }
            : { name: "Unknown User", initials: "UU" },
          // Ensure replyTo has complete user data including initials
          replyTo: reply.reply_to_id
            ? response.data.data.find((r) => r.id === reply.reply_to_id)?.user
              ? {
                id: response.data.data.find(
                  (r) => r.id === reply.reply_to_id
                ).user.id,
                name:
                  response.data.data.find((r) => r.id === reply.reply_to_id)
                    .user.name || "Unknown User",
                username:
                  response.data.data.find((r) => r.id === reply.reply_to_id)
                    .user.username || "unknown",
                initials: response.data.data.find(
                  (r) => r.id === reply.reply_to_id
                ).user.name
                  ? response.data.data
                    .find((r) => r.id === reply.reply_to_id)
                    .user.name.split(" ")
                    .map((n) => n[0])
                    .join("")
                  : "UU",
              }
              : null
            : null,
        }))
        : [];

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: replies,
      }));

      // Mark that all replies have been loaded for this comment
      setAllRepliesLoaded((prev) => ({
        ...prev,
        [commentId]: true,
      }));

      // localStorage.setItem(`replies_${commentId}`, JSON.stringify(replies));

      // Update comment replies count
      // Setelah menambahkan reply baru, update replies count
      setComments((prev) => {
        const updated = { ...prev };
        if (updated[currentPostId]) {
          updated[currentPostId] = updated[currentPostId].map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                repliesCount: (c.replies_count || 0) + 1,
              };
            }
            return c;
          });
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      setCommentError(
        error.response?.data?.message || "Failed to load replies"
      );
    } finally {
      setLoadingComments((prev) => ({ ...prev, [commentId]: false }));
    }
  };
  useEffect(() => {
    // Muat cache replies saat komponen dimount
    const loadCachedReplies = () => {
      const cachedReplies = {};
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("replies_")) {
          const commentId = key.replace("replies_", "");
          try {
            cachedReplies[commentId] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            console.error("Failed to parse cached replies", e);
          }
        }
      });
      setAllReplies(cachedReplies);
    };

    loadCachedReplies();
  }, []);

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setShowCommentModal(true);
    fetchComments(postId);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    try {
      const userToken = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/post-comments/${currentPostId}`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === currentPostId) {
            return {
              ...post,
              comments_count: (post.comments_count || 0) + 1, // Pastikan ada fallback
            };
          }
          return post;
        })
      );

      fetchComments(currentPostId);
      setCommentText("");
      setCommentError(null);
      setAlertInfo({
        show: true,
        type: "success",
        message: "Successfully added comment!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to add comment",
      });
      setCommentError(
        error.response?.data?.message ||
        "An error occurred while adding the comment. Please try again."
      );
    }
  };

  const handleReply = async (commentId, replyToUser = null) => {
    if (!commentId || !replyText.trim()) return;

    try {
      const token = localStorage.getItem("token");

      if (editingReplyId) {
        await handleUpdateReply(editingReplyId);
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/comments/${commentId}/replies`,
        {
          content: replyText,
          replyTo: replyingTo, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newReply = {
        ...response.data.data,
        user: {
          ...response.data.data.user,
          initials: response.data.data.user?.name
            ? response.data.data.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
            : "CU",
        },
        replyTo: replyToUser
          ? {
            id: replyToUser.id,
            name: replyToUser.name,
            username: replyToUser.username,
            initials: getInitials(replyToUser.name),
          }
          : null,
      };

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), newReply],
      }));

      // Update comment replies count
      setComments((prev) => {
        const updated = { ...prev };
        if (updated[currentPostId]) {
          updated[currentPostId] = updated[currentPostId].map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                repliesCount: (c.repliesCount || 0) + 1,
              };
            }
            return c;
          });
        }
        return updated;
      });

      setReplyText("");
      setReplyingTo(null);
      setReplyToUser(null);
      setCommentError(null);
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      addAlert("success", "Successfully added reply!");
    } catch (error) {
      addAlert("error", "Failed to add reply");
      setCommentError(
        error.response?.data?.message ||
        "Failed to add reply. Please try again."
      );
    }
  };


  const toggleReplies = async (commentId) => {
    // Reset editing states when toggling replies
    setEditingReplyId(null);
    setEditingCommentId(null);
    setCommentText("");
    setReplyText("");

    // Jika belum ada data replies, fetch dari API
    if (!allReplies[commentId] || allReplies[commentId].length === 0) {
      await fetchReplies(commentId);
    }

    // Toggle expanded state
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
    try {
      const userToken = localStorage.getItem("token");

      // Optimistic UI update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isCurrentlyLiked
                ? Math.max(post.likes_count - 1, 0) // Pastikan tidak negatif
                : post.likes_count + 1,
              isLiked: !isCurrentlyLiked,
            };
          }
          return post;
        })
      );

      // Send request to backend
      if (isCurrentlyLiked) {
        await axios.delete(`${apiUrl}/api/post-actions/${postId}/like`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
      } else {
        await axios.post(
          `${apiUrl}/api/post-actions/${postId}/like`,
          {},
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
      }
    } catch (error) {
      console.error("Failed to like post:", error);

      // Rollback on error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isCurrentlyLiked
                ? post.likes_count + 1
                : Math.max(post.likes_count - 1, 0), // Pastikan tidak negatif
              isLiked: isCurrentlyLiked,
            };
          }
          return post;
        })
      );

      setError("Failed to like post. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const userToken = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setPosts(posts.filter((post) => post.id !== postId));
      handleClosePostOptions();

      // Reset edit state jika post yang dihapus sedang dalam mode edit
      if (selectedPostId === postId) {
        setSelectedPostId(null);
        setPostContent("");
      }
      setAlertInfo({
        show: true,
        type: "success",
        message: "Deleted post successfully!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to delete post",
      });
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    setIsLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      const content =
        editActiveTab === "update" ? editPostContent : editArticleContent;

      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", postVisibility);

      // Tambahkan gambar yang sudah ada dan tidak dihapus
      editPostImages.forEach((img) => {
        if (typeof img === "string") {
          formData.append("existingImages[]", img);
        }
      });

      // Tambahkan gambar baru
      newEditImages.forEach((img) => {
        formData.append("images", img.file);
      });

      // Tambahkan gambar yang dihapus
      removedImages.forEach((img) => {
        formData.append("removedImages[]", img);
      });

      // Kirim permintaan update
      const response = await axios.put(
        `${apiUrl}/api/posts/${editingPost.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update state posts dengan data terbaru dari response
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPost.id
            ? {
              ...response.data.data,
              // Pastikan URL gambar lengkap
              images: (response.data.data.images || []).map((img) =>
                img.startsWith("http") ? img : `${apiUrl}/${img}`
              ),
            }
            : post
        )
      );

      // Tutup modal dan reset state
      setShowEditModal(false);
      setEditingPost(null);
      setEditPostImages([]);
      setNewEditImages([]);
      setRemovedImages([]);

      setAlertInfo({
        show: true,
        type: "success",
        message: "Post updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update post:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to update post. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewEditImages([...newEditImages, ...imagePreviews]);
  };

  const handleRemoveExistingImage = (index) => {
    const removed = editPostImages[index];
    // Pastikan kita menyimpan path lengkap gambar yang dihapus
    const fullImagePath = removed.startsWith("http")
      ? removed
      : `${apiUrl}/${removed}`;

    setRemovedImages([...removedImages, fullImagePath]);
    setEditPostImages(editPostImages.filter((_, i) => i !== index));
  };
  const handleRemoveNewImage = (index) => {
    const newImagesCopy = [...newEditImages];
    URL.revokeObjectURL(newImagesCopy[index].preview);
    newImagesCopy.splice(index, 1);
    setNewEditImages(newImagesCopy);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setEditArticleContent(post.content);
    setEditPostImages(post.images || []); // Set gambar yang sudah ada
    setNewEditImages([]); // Reset gambar baru
    setRemovedImages([]);
    setPostVisibility(post.visibility || "public");
    setEditActiveTab("update");
    setShowEditModal(true);
  };

  const renderPostOptionsModal = () => {
    // Cari post yang dipilih
    const post = posts.find((p) => p.id === selectedPostId);

    // Jika post tidak ditemukan, jangan render apa-apa
    if (!post) return null;

    const isCurrentUserPost = (post.user?.id ?? post.user_id) == currentUserId;
    const isConnected = connections.some((conn) => conn.id === post.user?.id);

    // Cek apakah post ini milik user yang sedang login
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-xs mx-4">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-3">Post Options</h3>

            {/* Opsi untuk post milik user sendiri */}
            {isCurrentUserPost ? (
              <>
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                  onClick={() => {
                    handleEditPost(post);
                    handleClosePostOptions();
                  }}
                >
                  <SquarePen size={16} className="mr-2" />
                  Edit Post
                </button>
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                  onClick={() => handleDeletePost(post.id)}
                >
                  <X size={16} className="mr-2" />
                  Delete Post
                </button>
              </>
            ) : (
              <>

                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                  onClick={() => {
                    const post = posts.find((p) => p.id === selectedPostId);
                    if (post && post.user && post.id) {
                      handleReportClick(post.user.id, "post", post.id);
                    } else {
                      console.error("Invalid post data for report:", post);
                      setAlertInfo({
                        show: true,
                        type: "error",
                        message: "Cannot report this post. Missing required information.",
                      });
                    }
                    handleClosePostOptions();
                  }}
                >
                  <TriangleAlert size={16} className="mr-2" />
                  Report Post
                </button>

                {!isConnected && (
                  <button
                    className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-blue-500"
                    onClick={() => handleConnectWithUser(post.user?.id)}
                  >
                    <Users size={16} className="mr-2" />
                    Connect with User
                  </button>
                )}
              </>
            )}
          </div>
          <div className="border-t p-3">
            <button
              className="w-full py-2 text-gray-500 hover:text-gray-700"
              onClick={handleClosePostOptions}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoGrid = (images) => {
    if (!images || images.length === 0) return null;

    // Pastikan semua gambar memiliki URL lengkap
    const validImages = images.map((img) =>
      img.startsWith("http") ? img : `${apiUrl}/${img}`
    );

    if (validImages.length === 1) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <img
            src={validImages[0]}
            className="w-full h-48 md:h-64 lg:h-96 object-cover cursor-pointer"
            alt="Post"
            onClick={() => openImageModal({ images: validImages }, 0)}
          />
        </div>
      );
    } else if (validImages.length === 2) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {validImages.map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo}
                  className="w-full h-full object-cover cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ images: validImages }, index)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (validImages.length === 3) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            <div className="relative aspect-square row-span-2">
              <img
                src={validImages[0]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 1"
                onClick={() => openImageModal({ images: validImages }, 0)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={validImages[1]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 2"
                onClick={() => openImageModal({ images: validImages }, 1)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={validImages[2]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 3"
                onClick={() => openImageModal({ images: validImages }, 2)}
              />
            </div>
          </div>
        </div>
      );
    } else if (validImages.length >= 4) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {validImages.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo}
                  className="w-full h-full object-cover cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ images: validImages }, index)}
                />
                {index === 3 && validImages.length > 4 && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                    onClick={() => openImageModal({ images: validImages }, 3)}
                  >
                    +{validImages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const handleOpenShareModal = (postId) => {
    setSharePostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsModalOpen(false);
    setSharePostId(null);
  };

  // Add this at the top of your file with other utility functions
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "UU";

    const names = name.trim().split(/\s+/); // Pisahkan berdasarkan spasi

    // Ambil maksimal 3 huruf pertama dari nama depan, tengah, dan belakang
    const initials = names
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");

    return initials || "UU";
  };

  const copyToClipboard = async () => {
    try {
      const urlToCopy = `${clientUrl}/post/${sharePostId}`;

      // Fallback untuk browser yang tidak support Clipboard API
      if (!navigator.clipboard) {
        const textArea = document.createElement("textarea");
        textArea.value = urlToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(urlToCopy);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback manual
      const input = document.createElement("input");
      input.value = `${clientUrl}/post/${sharePostId}`;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Check out this post: ${clientUrl}/post/${sharePostId}`
    )}`;
    window.open(url, "_blank");
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      `${clientUrl}/post/${sharePostId}`
    )}`;
    window.open(url, "_blank");
  };

  const copyToClipboar = () => {
    navigator.clipboard.writeText(apiUrl + "/post/" + currentPostId);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Fix for handleReportComment function
  const handleReportComment = async (
    targetUserId,
    targetType,
    targetId,
    reason
  ) => {
    // Validate all required parameters
    if (!targetUserId || !targetType || !targetId) {
      console.error("Missing required parameters:", {
        targetUserId,
        targetType,
        targetId,
      });
      setAlertInfo({
        show: true,
        type: "error",
        message: "Unable to report content due to missing information",
      });
      return;
    }

    // Prevent reporting own content
    if (targetUserId === user.id) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "You cannot report your own content",
      });
      return;
    }

    try {
      console.log("Submitting report with:", {
        targetUserId,
        targetType,
        targetId,
        reason,
        reporterId: user.id,
      });

      const userToken = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/reports/${targetUserId}/${targetType}/${targetId}`,
        { reason, reporterId: user.id },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code == 201) {
        setAlertInfo({
          show: true,
          type: "success",
          message: "Report submitted successfully",
        });
      }
    } catch (error) {
      console.error("Report submission error:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message: error.response?.data?.error || "Failed to submit report",
      });
    } finally {
      setShowReportModal(false);
      setSelectedReason("");
      setCustomReason("");
    }
  };

  // Fix for handleReportClick to properly set target IDs
  const handleReportClick = (userId, targetType, targetId) => {
    setReportTarget({
      userId,
      targetType,
      targetId
    });
    setShowReportModal(true);
  };


  const renderCommentOptionsModal = () => {
    if (!showCommentOptions || !selectedComment) return null;

    const isCurrentUserComment = selectedComment?.user?.id === currentUserId;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-xs mx-4">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-3">Comment Options</h3>

            {isCurrentUserComment ? (
              <>
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                  onClick={() => {
                    setEditingCommentId(selectedComment.id);
                    setCommentText(selectedComment.content);
                    setShowCommentOptions(false);
                  }}
                >
                  <SquarePen size={16} className="mr-2" />
                  Edit Comment
                </button>
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                  onClick={() => handleDeleteComment(selectedComment.id)}
                >
                  <X size={16} className="mr-2" />
                  Delete Comment
                </button>
              </>
            ) : (
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                onClick={() => {
                  if (selectedComment?.user?.id) {
                    handleReportClick(
                      selectedComment.user.id,
                      "comment",
                      selectedComment.id
                    );
                  } else {
                    setAlertInfo({
                      show: true,
                      type: "error",
                      message: "Cannot identify comment owner. Report failed.",
                    });
                  }
                  setShowCommentOptions(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Report Comment
              </button>
            )}
          </div>

          <div className="border-t p-3">
            <button
              className="w-full py-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCommentOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReplyOptionsModal = () => {
    if (!showReplyOptions || !selectedReply) return null;

    const isCurrentUserReply = selectedReply?.user?.id === currentUserId;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-xs mx-4">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-3">Reply Options</h3>

            {isCurrentUserReply ? (
              <>
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                  onClick={() => {
                    setEditingReplyId(selectedReply.id);
                    setReplyText(selectedReply.content);
                    setShowReplyOptions(false);
                  }}
                >
                  <SquarePen size={16} className="mr-2" />
                  Edit Reply
                </button>
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                  onClick={() => handleDeleteReply(selectedReply.id)}
                >
                  <X size={16} className="mr-2" />
                  Delete Reply
                </button>
              </>
            ) : (
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                onClick={() => {
                  if (selectedReply?.user?.id) {
                    handleReportClick(
                      selectedReply.user.id,
                      "comment",
                      selectedReply.id
                    );
                  }
                  setShowReplyOptions(false);
                }}
              >
                <TriangleAlert size={16} className="mr-2" />
                Report Reply
              </button>
            )}
          </div>

          <div className="border-t p-3">
            <button
              className="w-full py-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowReplyOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleUpdateReply = async (replyId) => {
    if (!replyId || !replyText.trim()) return;

    try {
      const userToken = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/comments/${replyId}`,
        { content: replyText },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      // Update replies state
      setAllReplies((prev) => {
        const updatedReplies = { ...prev };
        Object.keys(updatedReplies).forEach((commentId) => {
          updatedReplies[commentId] = updatedReplies[commentId].map((reply) => {
            if (reply.id === replyId) {
              return {
                ...reply,
                content: replyText,
              };
            }
            return reply;
          });
        });
        return updatedReplies;
      });

      // Reset state
      setEditingReplyId(null);
      setReplyText("");
      setAlertInfo({
        show: true,
        type: "success",
        message: "Reply updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update reply:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to update reply. Please try again.",
      });
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found");
      }

      // Find the parent comment ID
      let parentCommentId = null;
      Object.keys(allReplies).forEach((commentId) => {
        if (allReplies[commentId].some((reply) => reply.id === replyId)) {
          parentCommentId = commentId;
        }
      });

      if (!parentCommentId) {
        throw new Error("Parent comment not found");
      }

      // Optimistic update
      setAllReplies((prev) => ({
        ...prev,
        [parentCommentId]: prev[parentCommentId].filter(
          (reply) => reply.id !== replyId
        ),
      }));

      // Update comment replies count
      setComments((prev) => {
        const updated = { ...prev };
        if (updated[currentPostId]) {
          updated[currentPostId] = updated[currentPostId].map((comment) => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                repliesCount: (comment.repliesCount || 1) - 1,
              };
            }
            return comment;
          });
        }
        return updated;
      });

      // Send delete request
      await axios.delete(`${apiUrl}/api/comments/${replyId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setShowReplyOptions(false);
      setSelectedReply(null);

      setAlertInfo({
        show: true,
        type: "success",
        message: "Reply deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete reply:", error);

      // Rollback optimistic update
      if (selectedReply) {
        setAllReplies((prev) => {
          const updated = { ...prev };
          const parentCommentId =
            selectedReply.commentId ||
            Object.keys(prev).find((id) =>
              prev[id].some((r) => r.id === selectedReply.id)
            );

          if (parentCommentId) {
            updated[parentCommentId] = [
              ...(updated[parentCommentId] || []),
              selectedReply,
            ];
          }
          return updated;
        });

        // Rollback replies count
        setComments((prev) => {
          const updated = { ...prev };
          const parentCommentId =
            selectedReply.commentId ||
            Object.keys(allReplies).find((id) =>
              allReplies[id].some((r) => r.id === selectedReply.id)
            );

          if (updated[currentPostId] && parentCommentId) {
            updated[currentPostId] = updated[currentPostId].map((comment) => {
              if (comment.id === parentCommentId) {
                return {
                  ...comment,
                  repliesCount: (comment.repliesCount || 0) + 1,
                };
              }
              return comment;
            });
          }
          return updated;
        });
      }

      setAlertInfo({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to delete reply",
      });
    }
  };
  const ReportModal = ({
    showReportModal,
    setShowReportModal,
    selectedReason,
    setSelectedReason,
    customReason,
    setCustomReason,
    setAlertInfo,
    reportTarget // Tambahkan prop reportTarget
  }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitReport = async () => {
      if (!selectedReason) {
        setAlertInfo({
          show: true,
          type: "error",
          message: "Please select a reason for reporting"
        });
        return;
      }

      const reasonText = selectedReason === "Other" ? customReason : selectedReason;

      try {
        setIsSubmitting(true);
        const userToken = localStorage.getItem("token");

        const response = await axios.post(
          `${apiUrl}/api/reports/${reportTarget.userId}/${reportTarget.targetType}/${reportTarget.targetId}`,
          { reason: reasonText },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data?.code === 201) {
          setAlertInfo({
            show: true,
            type: "success",
            message: "Report submitted successfully!"
          });
          setShowReportModal(false);
          setSelectedReason("");
          setCustomReason("");
        } else {
          throw new Error("Failed to submit report");
        }
      } catch (error) {
        console.error("Failed to submit report:", error);
        setAlertInfo({
          show: true,
          type: "error",
          message: error.response?.data?.message || "Failed to submit report"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] ${showReportModal ? "block" : "hidden"
        }`}>
        <div className="bg-white rounded-lg w-full max-w-md mx-4 p-5">
          <h3 className="text-lg font-semibold mb-4">Report this content</h3>
          <p className="mb-3 text-sm text-gray-600">
            Please select a reason for reporting
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              "Harassment",
              "Fraud",
              "Spam",
              "Misinformation",
              "Hate speech",
              "Threats or violence",
              "Self-harm",
              "Graphic content",
              "Extremist organizations",
              "Sexual content",
              "Fake account",
              "Child exploitation",
              "Illegal products",
              "Violation",
              "Other",
            ].map((reason) => (
              <button
                key={reason}
                className={`py-2 px-3 text-sm border rounded-full ${selectedReason === reason
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white hover:bg-gray-100"
                  }`}
                onClick={() => setSelectedReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>

          {selectedReason === "Other" && (
            <textarea
              className="w-full p-2 border rounded mb-3 text-sm"
              rows={3}
              placeholder="Please describe the reason for your report"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-2">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowReportModal(false);
                setSelectedReason("");
                setCustomReason("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded text-white ${selectedReason
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
                }`}
              disabled={!selectedReason || isSubmitting}
              onClick={handleSubmitReport}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                "Report"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found");
      }

      // Gunakan endpoint yang sesuai dengan backend
      const response = await axios.delete(
        `${apiUrl}/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        // Update state komentar
        setComments((prev) => {
          const updatedComments = { ...prev };
          if (updatedComments[currentPostId]) {
            updatedComments[currentPostId] = updatedComments[
              currentPostId
            ].filter((comment) => comment.id !== commentId);
          }
          return updatedComments;
        });

        // Update jumlah komentar di post
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === currentPostId) {
              return {
                ...post,
                comments_count: (post.comments_count || 1) - 1,
              };
            }
            return post;
          })
        );

        setShowCommentOptions(false);
        setSelectedComment(null);

        // Tampilkan notifikasi sukses
        setCommentError(null);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);

      let errorMessage = "Failed to delete comment. Please try again.";
      if (error.response) {
        console.error("Error details:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;

        if (error.response.status === 401) {
          errorMessage = "You need to login again to perform this action";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to delete this comment";
        } else if (error.response.status === 404) {
          errorMessage = "Comment not found";
        } else if (error.response.status === 405) {
          errorMessage =
            "Server doesn't allow this action. Please contact support.";
        }
      }

      setCommentError(errorMessage);
    }
  };

  const handleOpenCommentOptions = (comment, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedComment(comment);
    setShowCommentOptions(true);
  };

  const handleUpdateComment = async (commentId) => {
    if (!commentId || !commentText.trim()) return;



    try {
      const userToken = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/comments/${commentId}`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      // Update comments state
      setComments((prev) => {
        const updatedComments = { ...prev };
        if (updatedComments[currentPostId]) {
          updatedComments[currentPostId] = updatedComments[currentPostId].map(
            (comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  content: commentText,
                };
              }
              return comment;
            }
          );
        }
        return updatedComments;
      });

      // Reset state
      setEditingCommentId(null);
      setCommentText("");
      setAlertInfo({
        show: true,
        type: "success",
        message: "Comment updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update post:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to update comment. Please try again.",
      });
    }
  };

  const handleOpenShowcase = async (commentId) => {
    if (!commentId) {
      console.error("No comment ID provided");
      return;
    }

    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/comments/${commentId}/replies?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      // Ensure response.data.data is an array
      const replies = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      setShowcaseReplies(replies);
      setShowShowcase(true);
    } catch (error) {
      console.error("Failed to load replies:", error);
      setCommentError("Failed to load replies. Please try again.");
      setShowcaseReplies([]); // Reset to empty array on error
    }
  };
  const renderShowcase = () => {
    if (!showShowcase) return null;

    // Pastikan showcaseReplies adalah array sebelum memanggil .map()
    const repliesToRender = Array.isArray(showcaseReplies)
      ? showcaseReplies
      : [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Replies</h3>
            <button onClick={() => setShowShowcase(false)}>
              <X size={20} />
            </button>
          </div>

          {repliesToRender.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No Replies</p>
          ) : (
            <div className="space-y-3 mb-6 text-left">
              {repliesToRender.map((reply) => (
                <div key={reply.id} className="flex items-start border-b pb-3">
                  <div className="ml-3">
                    <p className="font-medium">
                      {reply.user?.name || "Unknown"}
                    </p>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userToken = localStorage.getItem("token");
        const response = await axios.get(apiUrl + "/api/user/profile", {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        const userData = response.data.data;
        setUser({
          name: userData.name,
          username: userData.username,
          initials: userData.name
            ? userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            : "UU",
          photo: userData.photo,
        });
        setProfileImage(userData.photo);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserProfile = (username, userId) => {
    try {
      if (userId === currentUserId) {
        navigate("/profile");
      } else if (username) {
        navigate(`/user-profile/${username}`);
      }
    } catch (error) {
      console.error("Failed to navigate to user profile:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to navigate to user profile",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 px-4 md:px-6 lg:px-12 xl:px-32 py-4 md:py-6">
      {renderShowcase()}
      <div className="fixed top-5 right-5 z-50">
        {alertInfo.show && (
          <Alert
            type={alertInfo.type}
            message={alertInfo.message}
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          />
        )}
      </div>

      {/* Notification Alert */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Link copied to clipboard!
        </div>
      )}

      {/* Left Sidebar - Profile Section */}
      <div className="block w-full md:w-1/4 lg:w-1/4 mb-4 md:mb-0 md:pr-2 lg:pr-4">
        <div className="bg-white rounded-lg shadow mb-4 p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="relative w-28 h-28 mx-auto bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              {user.photo ? (
                <img
                  src={
                    user.photo.startsWith("http")
                      ? user.photo
                      : `${apiUrl}/${user.photo}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                    e.target.parentElement.classList.add("bg-gray-300");
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-lg font-bold text-gray-600">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`/profile`}
            className="font-bold mb-2 text-sm cursor-pointer "
          >
            {user.name || "Unknown User"}
          </Link>

          <div className="flex border-t pt-3 mt-2">
            <Link
              to={"/list-connection"}
              className="flex-1 text-center border-r"
            >
              <div className="text-base font-semibold">
                {connections.length}
              </div>
              <div className="text-gray-500 text-xs">Connections</div>
            </Link>
            <div className="flex-1 text-center">
              <div className="text-base font-semibold">
                {profileViews.thisWeek.toLocaleString()}
              </div>
              <div className="text-gray-500 text-xs">Views</div>
            </div>
          </div>

          <Link to="/profile">
            <button className="mt-3 text-blue-500 text-sm font-medium">
              View my profile
            </button>
          </Link>
        </div>

        {/* chart */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="font-medium text-sm mb-3">Profile Views</h3>

          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-xl font-semibold text-cyan-400">
                {profileViews.lastWeek.toLocaleString()}
              </div>
              <div className="text-gray-500 text-xs">last 7 days</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold flex items-center justify-center ${profileViews.percentageChange >= 0
                  ? "text-green-500"
                  : "text-red-500"
                  }`}
              >
                {profileViews.percentageChange >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                {profileViews.percentageChange > 0 ? "+" : ""}
                {Math.abs(profileViews.percentageChange)}%
              </div>
              <div className="text-gray-500 text-xs">Since last week</div>
            </div>
          </div>

          <div className="h-32 md:h-40 w-full mt-2 relative">
            <Line
              data={chartData}
              options={{
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      stepSize: 10,
                      callback: function (value) {
                        return value;
                      },
                    },
                    grid: {
                      color: "#e5e7eb",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Feed */}
      <div
        className={`w-full ${showMobileMenu ? "hidden" : "block"
          } md:block md:w-full lg:w-1/2 px-0 md:px-1`}
      >
        <div
          id="post-form"
          className="bg-white rounded-2xl shadow-md mb-6 p-4 space-y-4"
        >
          {/* Tabs */}
          <div className="flex border-b pb-2 space-x-1">
            <button
              className={`flex-1 flex items-center justify-center text-sm font-medium py-2 rounded-t-lg transition ${activeTab === "update"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-500"
                }`}
              onClick={() => setActiveTab("update")}
            >
              <SquarePen size={16} className="mr-2" />
              <span className="hidden sm:inline">Share an update</span>
              <span className="sm:hidden">Update</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center text-sm font-medium py-2 rounded-t-lg transition ${activeTab === "article"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-500"
                }`}
              onClick={() => setActiveTab("article")}
            >
              <NotebookPen size={16} className="mr-2" />
              <span className="hidden sm:inline">Write an article</span>
              <span className="sm:hidden">Article</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === "update" ? (
            <>
              {/* Input */}
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 bg-gray-200 text-xs rounded-full flex items-center justify-center font-semibold text-gray-600">
                  {user.photo ? (
                    <img
                      src={
                        user.photo.startsWith("http")
                          ? user.photo
                          : `${apiUrl}/${user.photo}`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                        e.target.parentElement.classList.add("bg-gray-300");
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-300">
                      <span className="text-sm font-bold text-gray-600">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="flex-1 border-none outline-none bg-transparent text-sm"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>

              {/* Visibility Options */}
              <div className="flex items-center justify-between px-2">
                <div className="flex space-x-2">
                  {[
                    ["public", <Globe size={14} />],
                    ["private", <LockKeyhole size={14} />],
                    ["connections", <Users size={14} />],
                  ].map(([type, icon]) => (
                    <Tooltip
                      title={type.charAt(0).toUpperCase() + type.slice(1)}
                      key={type}
                    >
                      <span
                        onClick={() => handleVisibilityChange(type)}
                        className={`p-1 rounded-full cursor-pointer transition ${postVisibility === type
                          ? "bg-blue-600"
                          : "bg-gray-400"
                          } text-white`}
                      >
                        {icon}
                      </span>
                    </Tooltip>
                  ))}
                  <Tooltip title="Who can see this post">
                    <button className="text-gray-500 hover:text-blue-500">
                      <CircleHelp size={14} />
                    </button>
                  </Tooltip>
                </div>

                <Button
                  className={`px-4 py-2 text-sm transition-colors duration-300 ease-in-out ${isLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700"
                    }`}
                  onClick={handlePostSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : activeTab === "update" ? (
                    "Share"
                  ) : (
                    "Publish"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Editor */}
              <div className="ck-editor-container relative z-10">
                <CKEditor
                  editor={ClassicEditor}
                  data={articleContent}
                  onChange={(e, editor) => setArticleContent(editor.getData())}
                  config={{
                    toolbar: {
                      items: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "undo",
                        "redo",
                      ],
                      shouldNotGroupWhenFull: true,
                    },
                    heading: {
                      options: [
                        {
                          model: "paragraph",
                          title: "Paragraph",
                          class: "ck-heading_paragraph",
                        },
                        {
                          model: "heading1",
                          view: "h1",
                          title: "Heading 1",
                          class: "ck-heading_heading1",
                        },
                        {
                          model: "heading2",
                          view: "h2",
                          title: "Heading 2",
                          class: "ck-heading_heading2",
                        },
                        {
                          model: "heading3",
                          view: "h3",
                          title: "Heading 3",
                          class: "ck-heading_heading3",
                        },
                      ],
                    },
                  }}
                />
              </div>

              {activeTab === "article" &&
                newPostImages.length > 0 &&
                !selectedPostId && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {newPostImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.preview}
                          className="w-full h-24 object-cover rounded-md border"
                          alt={`img-${index}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                        <button
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                          onClick={() => removeImage(index)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              {/* Visibility & Submit */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-2">
                  {/* Add Images */}
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center text-blue-600 text-sm hover:underline"
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Add images
                  </button>

                  {/* Visibility Buttons */}
                  {[
                    {
                      type: "public",
                      icon: <Globe size={14} />,
                      label: "Public: Anyone can see this post",
                    },
                    {
                      type: "private",
                      icon: <LockKeyhole size={14} />,
                      label: "Private: Only you can see this post",
                    },
                    {
                      type: "connections",
                      icon: <Users size={14} />,
                      label: "Connections: Only your connections can see this post",
                    },
                  ].map(({ type, icon, label }) => (
                    <div key={type} className="relative">
                      {/* Desktop */}
                      <span className="hidden lg:inline">
                        <Tooltip title={label}>
                          <span
                            onClick={() => handleVisibilityChange(type)}
                            className={`p-1 rounded-full cursor-pointer transition ${postVisibility === type ? "bg-blue-600" : "bg-gray-400"
                              } text-white`}
                          >
                            {icon}
                          </span>
                        </Tooltip>
                      </span>

                      {/* Mobile/Tablet */}
                      <span className="inline lg:hidden">
                        <span
                          onClick={() => {
                            handleVisibilityChange(type);
                            setShowMobileInfo(type);
                            setTimeout(() => setShowMobileInfo(null), 1500);
                          }}
                          className={`p-1 rounded-full transition ${postVisibility === type ? "bg-blue-600" : "bg-gray-400"
                            } text-white`}
                        >
                          {icon}
                        </span>
                        {showMobileInfo === type && (
                          <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 z-50 whitespace-nowrap">
                            {label}
                          </div>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <Button
                  className="px-4 py-2 text-sm"
                  onClick={handlePostSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting...</span>
                    </div>
                  ) : (
                    "Publish"
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Hidden input for image upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Posts */}
        <div className="mb-10">
          {loadingPosts && page === 0 ? (
            <div className="text-center py-4">Loading post...</div>
          ) : (
            <>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-md mb-6 p-4 space-y-4"
                >
                  {/* Modified header with overlapping images */}
                  <div className="border-b border-gray-200 pb-2 mb-1 relative">
                    {/* Group info - as background element */}
                    {post?.group && (
                      <Link to={`/groups/${post.group?.id}`}>
                        {/* Group photo */}
                        <div className="absolute left-0 top-0 bottom-2 z-0">
                          {post.group?.image ? (
                            <img
                              className="rounded-lg object-cover w-12 h-12 border-2 border-gray-300 shadow-md"
                              src={
                                post.group.image.startsWith("http")
                                  ? post.group.image
                                  : `${apiUrl}/${post.group.image}`
                              }
                              alt="Group"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                              }}
                            />
                          ) : (
                            <div className="rounded-full border-2 border-white w-10 h-10 bg-gray-300 flex items-center justify-center shadow-md">
                              <span className="text-xs font-bold text-gray-600">
                                {post.group?.name?.charAt(0) || "G"}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        {/* User photo */}
                        <div
                          className={`${post?.group
                            ? "relative z-10 ml-4 mt-2 transform translate-y-2"
                            : ""
                            }`}
                        >
                          {post.user?.photo ? (
                            <Link to={`/user-profile/${post.user.username}`}>
                              <img
                                className="rounded-full border-2 border-gray-300 w-10 h-10 object-cover"
                                src={
                                  post.user.photo.startsWith("http")
                                    ? post.user.photo
                                    : `${apiUrl}/${post.user.photo}`
                                }
                                alt="Profile"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                  e.target.parentElement.classList.add("bg-gray-300");
                                }}
                              />
                            </Link>
                          ) : (
                            <div className="w-9 h-9 bg-gray-200 text-xs rounded-full flex items-center justify-center font-semibold text-gray-600">
                              <span className="text-xs font-bold text-gray-600">
                                {getInitials(post.user?.name)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className={`${post?.group ? "ml-3 mt-2" : "ml-2"}`}
                        >
                          <h6
                            className="font-bold mb-0 text-sm cursor-pointer hover:underline"
                            onClick={() =>
                              fetchUserProfile(post.user.username, post.user.id)
                            }
                          >
                            {post.user?.name || "Unknown User"}
                          </h6>
                          <div className="flex items-center">
                            <small className="text-gray-500 text-xs">
                              {formatPostTime(post.created_at)}
                            </small>
                            <span className="text-gray-400 mx-1 text-xs">
                              •
                            </span>
                            {post.group && (
                              <small className="text-gray-500 text-xs">
                                <div className="flex items-center text-xs text-gray-500">
                                  <a
                                    href="#"
                                    className="hover:underline text-blue-500"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(`/groups/${post.group.id}`);
                                    }}
                                  >
                                    Posted in {post.group.name}
                                  </a>
                                </div>
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto relative group">
                        <button
                          className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 mr-2"
                          onClick={() => handleOpenPostOptions(post.id)}
                        >
                          <Ellipsis size={14} />
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-1">
                          {post.visibility === "public" && <Globe size={14} />}
                          {post.visibility === "private" && (
                            <LockKeyhole size={14} />
                          )}
                          {post.visibility === "connections" && (
                            <Users size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    // Tambahkan class khusus untuk konten post
                    <div
                      className="ck-content ml-1 text-gray-600 break-words whitespace-pre-line"
                      style={{
                        maxWidth: '100%',
                        color: '#374151',
                        padding: '0.5rem'
                      }}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                  )}

                  {renderPhotoGrid(post.images)}

                  <div>
                    {/* Likes & Comments Info */}
                    <div className="flex items-center space-x-4 px-4 py-1 text-xs text-gray-500 justify-between">
                      <div className="flex items-center space-x-1 pt-1">
                        <span className="text-black flex">
                          <ThumbsUp size={14} className="mr-1" />{" "}
                          {post.likes_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <span
                          className="text-black"
                          onClick={() => openCommentModal(post.id)}
                        >
                          {post.comments_count || 0} Comment
                        </span>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="border-t border-gray-200 px-2 py-1 flex justify-between gap-1 text-xs sm:text-sm">
                      <button
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition ${post.isLiked
                          ? "text-blue-600 bg-blue-50"
                          : "text-black hover:bg-gray-100"
                          }`}
                        onClick={() => handleLikePost(post.id, post.isLiked)}
                      >
                        <ThumbsUp size={14} className="mr-2" />
                        Like
                      </button>

                      <button
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-black hover:bg-gray-100"
                        onClick={() => openCommentModal(post.id)}
                      >
                        <MessageCircle size={14} className="mr-2" />
                        Comment
                      </button>

                      <button
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-black hover:bg-gray-100"
                        onClick={() => handleOpenShareModal(post.id)}
                      >
                        <Share2 size={14} className="mr-2" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div ref={loadingRef} className="text-center py-4">
                  {isLoadingMore ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">
                        Loading more...
                      </span>
                    </div>
                  ) : (
                    <div className="h-10"></div> // Placeholder untuk observer
                  )}
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                  No more posts
                </div>
              )}
              {posts.length === 0 && !loadingPosts && (
                <div className="text-center py-8 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500">No posts yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Share this post</h3>
                <button
                  onClick={handleCloseShareModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Copy link</p>
                <div className="flex items-center border rounded-lg p-2">
                  <input
                    type="text"
                    value={`${clientUrl}/post/${sharePostId}`}
                    readOnly
                    className="flex-grow text-sm text-gray-700 mr-2 outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">Share to</p>
                <div className="flex justify-around">
                  <button
                    onClick={shareToWhatsApp}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-green-100 p-3 rounded-full mb-1">
                      <MessageCircle size={24} className="text-green-600" />
                    </div>
                    <span className="text-xs">WhatsApp</span>
                  </button>

                  <button
                    onClick={() =>
                      window.open("https://www.instagram.com", "_blank")
                    }
                    className="flex flex-col items-center"
                  >
                    <div className="bg-pink-100 p-3 rounded-full mb-1">
                      <Instagram size={24} className="text-pink-600" />
                    </div>
                    <span className="text-xs">Instagram</span>
                  </button>

                  <button
                    onClick={shareToTwitter}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-1">
                      <Twitter size={24} className="text-blue-600" />
                    </div>
                    <span className="text-xs">Twitter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Post Options Modal */}
      {
        showPostOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {renderPostOptionsModal()}
          </div>
        )
      }

      {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <h3 className="text-lg font-medium mb-4">Edit Post</h3>


              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={() => setShowEditModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
                  onClick={handleUpdatePost}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                                  </button>
              </div>
            </div>
          </div>
        )}

      {/* Right Sidebar */}
      <div
        className={`${showMobileMenu ? "block" : "hidden"
          } md:block w-full md:w-1/4 lg:w-1/4 mb-4 md:mb-0 md:pl-2 lg:pr-4`}
      >
        {/* People You Might Know */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              People you might know
            </h3>
            <button
              onClick={fetchSuggestedConnections}
              disabled={loadingSuggested}
              className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingSuggested ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Content */}
          {loadingSuggested ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Finding suggestions...</span>
              </div>
            </div>
          ) : suggestedConnections.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No suggestions available at the moment
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Check back later for new connections
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedConnections.map((person, index) => (
                <div
                  key={person.id}
                  className="group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  {/* Profile Picture */}
                  <div className="relative mr-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-md">
                      {person.photo ? (
                        <img
                          src={
                            person.photo.startsWith("http")
                              ? person.photo
                              : `${apiUrl}/${person.photo}`
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.parentElement.classList.add("bg-gray-300");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-500">
                            {getInitials(person.name)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/user-profile/${person.username}`}>
                      <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors duration-200">
                        {person.name}
                      </h4>
                    </Link>
                    <p className="text-gray-600 text-xs truncate mt-0.5">
                      {person.headline}
                    </p>
                  </div>

                  {/* Connect Button */}
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-200 group-hover:shadow-md"
                    onClick={() => handleConnectWithUser(person.id)}
                    disabled={
                      connections.some((conn) => conn.id === person.id) ||
                      loadingSuggested
                    }
                    title={`Connect with ${person.name}`}
                  >
                    {connections.some((conn) => conn.id === person.id) ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <UserPlus size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium Banner */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <div className="mb-2">
            <img src="/" alt="Premium" className="w-full rounded" />
          </div>
          <h3 className="font-bold text-sm md:text-base text-yellow-500 text-center mb-1">
            EVOConnect Premium
          </h3>
          <p className="text-gray-600 text-xs text-center mb-3">
            Grow & nurture your network
          </p>
          <button
            className="w-full border border-yellow-500 text-yellow-500 py-1 md:py-1.5 rounded-lg font-medium text-xs md:text-sm"
            onClick={openPremiumModal}
          >
            ACTIVATE
          </button>
        </div>

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
              <div className="relative">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold text-yellow-600">
                    EVOConnect Premium
                  </h3>
                  <button
                    onClick={closePremiumModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold mb-2">
                      Unlock Premium Features
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Upgrade your account to access exclusive features:
                    </p>

                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>Unlimited connections and messaging</span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>Advanced analytics for your posts</span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>Priority support 24/7</span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-yellow-500 mr-2 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>Custom profile badge</span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h5 className="font-bold text-yellow-700 mb-2">
                        Premium Plan
                      </h5>
                      <p className="text-2xl font-bold text-yellow-600 mb-1">
                        $9.99
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Billed annually or $12.99 month-to-month
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-between">
                  <button
                    onClick={closePremiumModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="font-medium text-sm mb-3">Jobs</h3>
          <div className="mb-4">
            <div className="bg-gray-100 p-3 md:p-4 rounded-lg">
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-xs md:text-sm">
                  Product Director
                </h3>
                <div className="bg-white rounded-full p-1 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center">
                  <img
                    src="/api/placeholder/24/24"
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-blue-500 text-xs md:text-sm">Spotify Inc.</p>
              <div className="flex items-center text-gray-600 text-xs">
                <MapPin size={12} className="mr-1" />
                <span>India, Punjab</span>
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex -space-x-1 md:-space-x-2">
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                </div>
                <span className="text-gray-600 text-xs ml-2">
                  18 connections
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {
        showImageModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl w-full mx-4">
              <button
                className="absolute top-2 md:top-4 right-2 md:right-4 text-white bg-black bg-opacity-50 rounded-full p-1 md:p-2 z-10"
                onClick={closeImageModal}
              >
                <X size={20} />
              </button>

              <div className="relative">
                <img
                  src={selectedPost.images[selectedImageIndex]}
                  className="w-full max-h-[80vh] object-contain"
                  alt={`Post ${selectedImageIndex + 1}`}
                />

                {selectedPost.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 md:p-2"
                      onClick={() => navigateImage("prev")}
                    >
                      <svg
                        className="w-4 md:w-6 h-4 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>

                    <button
                      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 md:p-2"
                      onClick={() => navigateImage("next")}
                    >
                      <svg
                        className="w-4 md:w-6 h-4 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center">
                <div className="flex space-x-1 md:space-x-2">
                  {selectedPost.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${selectedImageIndex === index ? "bg-white" : "bg-gray-500"
                        }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showReportModal && (
          <ReportModal
            showReportModal={showReportModal}
            setShowReportModal={setShowReportModal}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            customReason={customReason}
            setCustomReason={setCustomReason}
            setAlertInfo={setAlertInfo}
            reportTarget={reportTarget} // Tambahkan reportTarget
          />
        )
      }

      {/* Comment Modal */}
      {
        showCommentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            {renderShowcase()}

            {/* Main Comment Modal */}
            <div
              className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col shadow-xl"
              style={{ zIndex: showReportModal ? 40 : 50 }}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
                <button
                  onClick={closeCommentModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Comments Content */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {loadingComments[currentPostId] ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : !Array.isArray(comments[currentPostId]) ||
                  comments[currentPostId].length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No comments yet.</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Be the first to comment!
                    </p>
                  </div>
                ) : (
                  Array.isArray(comments[currentPostId]) &&
                  comments[currentPostId].filter(Boolean).map((comment) => {
                    if (!comment) return null;

                    const commentUser = comment.user || {
                      name: "Unknown User",
                      initials: "UU",
                      username: "unknown",
                      profile_photo: null,
                    };

                    return (
                      <div key={comment.id} className="group">
                        {/* Comment Container */}
                        <div className="flex gap-3">
                          {/* User Avatar */}
                          <div className="flex-shrink-0">
                            {commentUser.profile_photo ? (
                              <Link to={`/user-profile/${commentUser.username}`}>
                                <img
                                  className="rounded-full w-10 h-10 object-cover border-2 border-white hover:border-blue-200 transition-colors"
                                  src={
                                    commentUser.profile_photo.startsWith("http")
                                      ? commentUser.profile_photo
                                      : `${apiUrl}/${commentUser.profile_photo}`
                                  }
                                  alt="Profile"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "";
                                    e.target.parentElement.classList.add("bg-gray-300");
                                  }}
                                />
                              </Link>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                                <span className="text-xs font-medium text-gray-600">
                                  {getInitials(commentUser.name)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 rounded-lg p-3">
                              {/* User Info */}
                              <div className="flex items-center justify-between">
                                <Link
                                  to={`/user-profile/${commentUser.username}`}
                                  className="text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline"
                                >
                                  {commentUser.name}
                                </Link>

                                {/* Comment Actions */}
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {comment.user?.id === currentUserId && (
                                    <button
                                      className="text-gray-500 hover:text-gray-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedComment(comment);
                                        setShowCommentOptions(true);
                                      }}
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                  )}

                                  {comment.user?.id !== currentUserId && (
                                    <button
                                      className="text-gray-500 hover:text-red-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (comment.user?.id) {
                                          handleReportClick(
                                            comment.user.id,
                                            "comment",
                                            comment.id
                                          );
                                        }
                                      }}
                                    >
                                      <TriangleAlert size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Comment Text */}
                              {editingCommentId === comment.id ? (
                                <div className="mt-2 flex gap-2">
                                  <input
                                    type="text"
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    value={commentText}
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                    autoFocus
                                  />
                                  <button
                                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                    onClick={() =>
                                      handleUpdateComment(comment.id)
                                    }
                                  >
                                    Update
                                  </button>
                                  <button
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setCommentText("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 mt-1">
                                  {comment.content}
                                </p>
                              )}
                            </div>

                            {/* Comment Meta */}
                            <div className="flex items-center justify-between mt-2 px-1">
                              <span className="text-xs text-gray-500">
                                {formatPostTime(comment.created_at)}
                              </span>

                              <div className="flex items-center space-x-4">
                                <button
                                  className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                                  onClick={() => {
                                    setReplyingTo(comment.id);
                                    setReplyToUser(comment.user);
                                  }}
                                >
                                  Reply
                                </button>

                                {(comment.repliesCount > 0 ||
                                  allReplies[comment.id]?.length > 0) && (
                                    <button
                                      className="text-xs text-gray-500 hover:text-blue-500"
                                      onClick={() => toggleReplies(comment.id)}
                                    >
                                      {expandedReplies[comment.id]
                                        ? "Hide replies"
                                        : `Show replies (${comment.repliesCount})`}
                                    </button>
                                  )}
                              </div>
                            </div>

                            {/* Reply Input */}
                            {replyingTo === comment.id && (
                              <div className="mt-3 flex gap-2">
                                <input
                                  type="text"
                                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  placeholder={`Reply to ${replyToUser?.name || comment.user.name
                                    }...`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  autoFocus
                                />
                                <button
                                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                  onClick={() =>
                                    handleReply(
                                      comment.id,
                                      replyToUser || comment.user
                                    )
                                  }
                                >
                                  Post
                                </button>
                              </div>
                            )}

                            {/* Replies Section */}
                            {expandedReplies[comment.id] && (
                              <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
                                {loadingComments[comment.id] ? (
                                  <div className="flex justify-center py-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                  </div>
                                ) : (
                                  (allReplies[comment.id] || []).map((reply) => (
                                    <div key={reply.id} className="group">
                                      <div className="flex gap-2">
                                        {/* Reply User Avatar */}
                                        <div className="flex-shrink-0">
                                          {reply.user?.profile_photo ? (
                                            <Link
                                              to={`/user-profile/${reply.user.username}`}
                                            >
                                              <img
                                                className="rounded-full w-8 h-8 object-cover border-2 border-white hover:border-blue-200 transition-colors"
                                                src={
                                                  reply.user.profile_photo.startsWith(
                                                    "http"
                                                  )
                                                    ? reply.user.profile_photo
                                                    : `${apiUrl}/${reply.user.profile_photo}`
                                                }
                                                alt="Profile"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src = "";
                                                  e.target.parentElement.classList.add(
                                                    "bg-gray-300"
                                                  );
                                                }}
                                              />
                                            </Link>
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                                              <span className="text-xs font-medium text-gray-600">
                                                {getInitials(reply.user?.name)}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Reply Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-gray-50 rounded-lg p-2">
                                            {/* Reply User Info */}
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center">
                                                <Link
                                                  to={`/user-profile/${reply.user.username}`}
                                                  className="text-xs font-semibold text-gray-800 hover:text-blue-600 hover:underline"
                                                >
                                                  {reply.user?.name ||
                                                    "Unknown User"}
                                                </Link>
                                                {reply.reply_to &&
                                                  reply.parent_id !==
                                                  reply.reply_to
                                                    .reply_to_id && (
                                                    <span className="text-xs text-gray-500 ml-1 flex items-center">
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="10"
                                                        height="10"
                                                        fill="currentColor"
                                                        className="mr-1"
                                                        viewBox="0 0 16 16"
                                                      >
                                                        <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                                                      </svg>
                                                      <Link
                                                        to={`/user-profile/${reply.reply_to.username}`}
                                                        className="text-blue-500 hover:underline"
                                                      >
                                                        {reply.reply_to.name}
                                                      </Link>
                                                    </span>
                                                  )}
                                              </div>

                                              {/* Reply Actions */}
                                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {reply.user?.id === user.id && (
                                                  <button
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedReply(reply);
                                                      setShowReplyOptions(true);
                                                    }}
                                                  >
                                                    <MoreHorizontal size={14} />
                                                  </button>
                                                )}

                                                {reply.user?.id !== user.id && (
                                                  <button
                                                    className="text-gray-500 hover:text-red-500"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (reply.user?.id) {
                                                        handleReportClick(
                                                          reply.user.id,
                                                          "comment",
                                                          reply.id
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <TriangleAlert size={14} />
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {/* Reply Text */}
                                            {editingReplyId === reply.id ? (
                                              <div className="mt-1 flex gap-2">
                                                <input
                                                  type="text"
                                                  className="flex-1 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                  value={replyText}
                                                  onChange={(e) =>
                                                    setReplyText(e.target.value)
                                                  }
                                                  autoFocus
                                                />
                                                <button
                                                  className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors"
                                                  onClick={() =>
                                                    handleUpdateReply(reply.id)
                                                  }
                                                >
                                                  Update
                                                </button>
                                                <button
                                                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs hover:bg-gray-300 transition-colors"
                                                  onClick={() => {
                                                    setEditingReplyId(null);
                                                    setReplyText("");
                                                  }}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-700 mt-1">
                                                {reply.content}
                                              </p>
                                            )}
                                          </div>

                                          {/* Reply Meta */}
                                          <div className="flex items-center justify-between mt-1 px-1">
                                            <span className="text-xs text-gray-500">
                                              {formatPostTime(reply.created_at)}
                                            </span>

                                            <div className="flex items-center space-x-3">
                                              <button
                                                className="text-xs text-blue-500 hover:text-blue-700"
                                                onClick={() => {
                                                  setReplyingTo(reply.id);
                                                  setReplyToUser(reply.user);
                                                }}
                                              >
                                                Reply
                                              </button>
                                            </div>
                                          </div>
                                          {replyingTo === reply.id && (
                                            <div className="mt-3 flex gap-2">
                                              <input
                                                type="text"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                placeholder={`Reply to ${replyToUser?.name ||
                                                  reply.user.name
                                                  }...`}
                                                value={replyText}
                                                onChange={(e) =>
                                                  setReplyText(e.target.value)
                                                }
                                                autoFocus
                                              />
                                              <button
                                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                                onClick={() =>
                                                  handleReply(
                                                    reply.id,
                                                    replyToUser || reply.user
                                                  )
                                                }
                                              >
                                                Post
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Options Modal */}
              {renderReplyOptionsModal()}
              {renderCommentOptionsModal()}

              {/* Add Comment Section */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {user.photo ? (
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={
                          user.photo.startsWith("http")
                            ? user.photo
                            : `${apiUrl}/${user.photo}`
                        }
                        alt="Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                          e.target.parentElement.classList.add("bg-gray-300");
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          {getInitials(user.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    {commentError && (
                      <p className="text-red-500 text-xs mt-1">{commentError}</p>
                    )}
                  </div>

                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    onClick={handleAddComment}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}