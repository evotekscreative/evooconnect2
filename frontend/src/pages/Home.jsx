import { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Tooltip as ChartTooltip } from "chart.js";
import { Button } from "../components/Button";
import Tooltip from "@mui/material/Tooltip";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Link, useLocation } from "react-router-dom";
import Alert from "../components/Auth/Alert";
import { Line } from "react-chartjs-2";
import {
  SquarePen,
  NotebookPen,
  ThumbsUp,
  MessageCircle,
  Share,
  Globe,
  CircleHelp,
  X,
  MapPin,
  LockKeyhole,
  Users,
  Copy,
  Instagram,
  Twitter,
  Image as ImageIcon,
  Menu,
  Ellipsis,
  MoreHorizontal,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend
);

export default function SocialNetworkFeed() {
  const [postContent, setPostContent] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("update");
  const [articleImages, setArticleImages] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentError, setCommentError] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [postVisibility, setPostVisibility] = useState("public");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [allRepliesLoaded, setAllRepliesLoaded] = useState({});
  const [showcaseReplies, setShowcaseReplies] = useState([]);
  const [showShowcase, setShowShowcase] = useState(false);
  const [allReplies, setAllReplies] = useState({});
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
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
    const views = JSON.parse(localStorage.getItem("profileViews")) || {};
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      labels.push(dayjs(date).format("ddd"));
      data.push(views[date] || 0);
    }

    return { labels, data };
  };

  const { labels, data } = getLast7DaysData();

  const chartData = {
    labels,
    datasets: [
      {
        label: "Profile Views",
        data,
        fill: false,
        borderColor: "#06b6d4",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

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
        console.log("Connect with user:", post.user?.id);
        break;
      default:
        console.error("Unknown action:", action);
    }

    handleClosePostOptions(); // Tutup modal setelah aksi selesai
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const userToken = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/posts", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.data && Array.isArray(response.data.data)) {
          setPosts(
            response.data.data.map((post) => ({
              ...post,
              comments_count: post.comments_count || 0, // Berikan nilai default jika undefined
            }))
          );
        } else {
          setPosts([]);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load posts. Please try again later.");
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("cachedPosts", JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    const cachedPosts = localStorage.getItem("cachedPosts");
    if (cachedPosts) {
      try {
        const parsedPosts = JSON.parse(cachedPosts);
        if (Array.isArray(parsedPosts)) {
          setPosts(
            parsedPosts.map((post) => ({
              ...post,
              comments_count: post.comments_count || 0,
            }))
          );
        }
      } catch (e) {
        console.error("Failed to parse cached posts", e);
        localStorage.removeItem("cachedPosts");
      }
    }
  }, []);
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
    // Pastikan post.images adalah array URL lengkap
    const images = post.images.map(img => 
      img.startsWith('http') ? img : `http://localhost:3000/${img}`
    );
    
    setSelectedPost({
      ...post,
      images: images
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

  const formatPostTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = dayjs();
    const postTime = dayjs(timestamp);
    const diffInSeconds = now.diff(postTime, "second");
    const diffInMinutes = now.diff(postTime, "minute");
    const diffInHours = now.diff(postTime, "hour");
    const diffInDays = now.diff(postTime, "day");

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return postTime.format("MMM D, YYYY");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Buat URL untuk preview gambar
    const imagePreviews = files.map((file) => ({
      file, // Simpan file asli
      preview: URL.createObjectURL(file), // Buat URL untuk preview
    }));

    setArticleImages([...articleImages, ...imagePreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...articleImages];
    // Hapus URL preview dari memori
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setArticleImages(newImages);
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
      articleImages.forEach((img) => {
        if (img.file) {
          // Jika ini file baru yang diupload
          formData.append("images", img.file);
        } else if (typeof img === "string") {
          // Jika ini URL gambar yang sudah ada
          formData.append("existingImages", img);
        }
      });

      const response = await axios.post(
        "http://localhost:3000/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }

      // Pastikan response.data.data.images adalah array URL gambar
      const images = response.data.data.images || [];

      const newPost = {
        id: response.data.data.id,
        content: response.data.data.content || content,
        images: images.map((img) => {
          // Pastikan URL gambar lengkap jika backend hanya mengembalikan nama file
          return img.startsWith("http") ? img : `http://localhost:3000/${img}`;
        }),
        visibility: response.data.data.visibility || postVisibility,
        likes_count: response.data.data.likes_count || 0,
        comments_count: response.data.data.comments_count || 0,
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        user: response.data.data.user || {
          name: "Current User",
          photo: "",
          initials: "CU",
        },
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setPostContent("");
      setArticleContent("");
      setArticleImages([]);
    } catch (error) {
      console.error("Post failed:", error);
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
        `http://localhost:3000/api/post-comments/${postId}?limit=10&offset=0&includeReplies=true`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

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
            ...comment,
            user: comment.user || {
              name: "Unknown User",
              initials: "UU",
            },
            replies: replies,
            repliesCount: comment.repliesCount || replies.length,
          };
        }
      );

      // Simpan ke localStorage
      localStorage.setItem(
        `comments_${postId}`,
        JSON.stringify(commentsWithReplies)
      );

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
      setLoadingComments((prev) => ({ ...prev, [commentId]: true }));
      setCommentError(null);

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/comments/${commentId}/replies`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setComments((prev) => {
        const updatedComments = { ...prev };
        if (updatedComments[currentPostId]) {
          updatedComments[currentPostId] = updatedComments[currentPostId].map(
            (comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: response.data.data || [],
                  repliesCount: response.data.data?.length || 0,
                };
              }
              return comment;
            }
          );
        }
        return updatedComments;
      });

      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      setCommentError(
        error.response?.data?.message || "Failed to load replies"
      );
    } finally {
      setLoadingComments((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const fetchAllReplies = async (commentId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [commentId]: true }));

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/comments/${commentId}/replies?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const replies = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: replies,
      }));

      localStorage.setItem(`replies_${commentId}`, JSON.stringify(replies));

      // Update comment replies count
      setComments((prev) => {
        const updatedComments = { ...prev };
        if (updatedComments[currentPostId]) {
          updatedComments[currentPostId] = updatedComments[currentPostId].map(
            (comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  repliesCount: replies.length,
                };
              }
              return comment;
            }
          );
        }
        return updatedComments;
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
      setCommentError("Komentar tidak boleh kosong");
      return;
    }

    try {
      const userToken = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/post-comments/${currentPostId}`,
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
    } catch (error) {
      console.error("Gagal menambahkan komentar:", error);
      setCommentError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan komentar. Silakan coba lagi."
      );
    }
  };

  const handleReply = async (commentId, replyToUser = null) => {
    if (!commentId || !replyText.trim()) return;

    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/comments/${commentId}/replies`,
        {
          content: replyText,
          replyTo: replyToUser?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newReply = {
        ...response.data.data,
        user: response.data.data.user || {
          name: "Current User",
          initials: "CU",
        },
      };

      // Update state dan cache
      const updatedReplies = [...(allReplies[commentId] || []), newReply];

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: updatedReplies,
      }));

      // Update localStorage cache
      localStorage.setItem(
        `replies_${commentId}`,
        JSON.stringify(updatedReplies)
      );

      // Update replies count in comments state
      setComments((prev) => {
        const updatedComments = { ...prev };
        if (updatedComments[currentPostId]) {
          updatedComments[currentPostId] = updatedComments[currentPostId].map(
            (comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  repliesCount: (comment.repliesCount || 0) + 1,
                };
              }
              return comment;
            }
          );
        }
        return updatedComments;
      });

      // Reset form
      setReplyText("");
      setReplyingTo(null);
      setReplyToUser(null);
      setCommentError(null);

      // Pastikan replies expanded
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (error) {
      console.error("Failed to add reply:", error);
      setCommentError(
        error.response?.data?.message ||
          "Failed to add reply. Please try again."
      );
    }
  };

  const toggleReplies = async (commentId) => {
    if (!commentId) return;

    // Jika belum ada data di state atau cache, fetch dari API
    if (!allReplies[commentId] || allReplies[commentId].length === 0) {
      const cachedReplies = localStorage.getItem(`replies_${commentId}`);
      if (cachedReplies) {
        try {
          setAllReplies((prev) => ({
            ...prev,
            [commentId]: JSON.parse(cachedReplies),
          }));
        } catch (e) {
          console.error("Failed to parse cached replies", e);
          await fetchAllReplies(commentId);
        }
      } else {
        await fetchAllReplies(commentId);
      }
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
    try {
      const userToken = localStorage.getItem("token");

      if (isCurrentlyLiked) {
        await axios.delete(
          `http://localhost:3000/api/post-actions/${postId}/like`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
      } else {
        await axios.post(
          `http://localhost:3000/api/post-actions/${postId}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isCurrentlyLiked
                ? post.likes_count - 1
                : post.likes_count + 1,
              isLiked: !isCurrentlyLiked,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to like post:", error);
      setError("Failed to like post. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const userToken = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/posts/${postId}`, {
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
        setArticleImages([]);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("Failed to delete post. Please try again.");
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    setIsLoading(true);
    try {
      const userToken = localStorage.getItem("token");

      // Upload new images first
      let uploadedImageUrls = [];
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((file) => {
          formData.append("images", file);
        });

        const uploadResponse = await axios.post(
          "http://localhost:3000/api/posts/images",
          formData,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadedImageUrls = uploadResponse.data.data.filenames || [];
      }

      // Prepare the updated post data
      const updatedPost = {
        content: postContent,
        images: [...articleImages, ...uploadedImageUrls], // Keep existing + new images
        removedImages: removedImages, // Images to be removed
        visibility: postVisibility,
      };

      const response = await axios.put(
        `http://localhost:3000/api/posts/${editingPost.id}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPost.id ? response.data.data : post
        )
      );

      setShowEditModal(false);
      setEditingPost(null);
      setNewImages([]);
      setRemovedImages([]);
    } catch (error) {
      console.error("Failed to update post:", error);
      setError("Failed to update post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const handleRemoveExistingImage = (index) => {
    const removed = articleImages[index];
    setRemovedImages([...removedImages, removed]);
    setArticleImages(articleImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostContent(post.content);
    setArticleImages(post.images || []);
    setNewImages([]);
    setRemovedImages([]);
    setPostVisibility(post.visibility || "public");
    setShowEditModal(true);
  };

  const renderLikeButton = (post) => (
    <button
      className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm flex items-center ${post.isLiked
          ? "bg-blue-100 text-blue-600"
          : "bg-sky-100 hover:bg-sky-200 text-blue-500"
        }`}
      onClick={() => handleLikePost(post.id, post.isLiked)}
    >
      <ThumbsUp size={12} className="mr-1" />
      <span className="mr-1">Like</span> ({post.likes_count || 0})
    </button>
  );

  const renderPostOptionsModal = () => {
    if (!showPostOptions || !selectedPostId) return null;

    const post = posts.find((p) => p.id === selectedPostId);
    const isCurrentUserPost = post?.user?.id === currentUserId;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-xs mx-4">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-3">Post Options</h3>

            {isCurrentUserPost && (
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                onClick={() => handleEditPost(post)}
              >
                <SquarePen size={16} className="mr-2" />
                Edit Post
              </button>
            )}

            {isCurrentUserPost && (
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                onClick={() => handleDeletePost(post.id)}
              >
                <X size={16} className="mr-2" />
                Delete Post
              </button>
            )}

            <button
              className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
              onClick={() => console.log("Report post")}
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
              Report Post
            </button>

            {!isCurrentUserPost && (
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-blue-500"
                onClick={() => console.log("Connect with user")}
              >
                <Users size={16} className="mr-2" />
                Connect with User
              </button>
            )}
          </div>

          <div className="border-t p-3">
            <button
              className="w-full py-2 text-gray-500 hover:text-gray-700"
              onClick={handleClosePostOptions}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoGrid = (images) => {
    if (!images || images.length === 0) return null;

    // Pastikan images adalah array URL yang valid
    const validImages = images.map((img) => {
      // Jika img sudah berupa URL lengkap, gunakan langsung
      if (
        typeof img === "string" &&
        (img.startsWith("http") || img.startsWith("/"))
      ) {
        return img;
      }
      // Jika backend mengembalikan path relatif, tambahkan base URL
      return `http://localhost:3000/${img}`;
    });

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
    } else if (images.length === 2) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {images.map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={"http://localhost:3000/" + photo}
                  className="w-full h-full object-cover cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ images }, index)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (images.length === 3) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            <div className="relative aspect-square row-span-2">
              <img
                src={"http://localhost:3000/" + images[0]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 1"
                onClick={() => openImageModal({ images }, 0)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={"http://localhost:3000/" + images[1]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 2"
                onClick={() => openImageModal({ images }, 1)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={"http://localhost:3000/" + images[2]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 3"
                onClick={() => openImageModal({ images }, 2)}
              />
            </div>
          </div>
        </div>
      );
    } else if (images.length >= 4) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <div className="grid grid-cols-2 gap-1">
            {images.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={"http://localhost:3000/" + photo}
                  className="w-full h-full object-cover cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ images }, index)}
                />
                {index === 3 && images.length > 4 && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                    onClick={() => openImageModal({ images }, 3)}
                  >
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleOpenShareModal = (postId) => {
    setSharePostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsModalOpen(false);
    setSharePostId(null);
  };

  const copyToClipboard = () => {
    const urlToCopy = `http://localhost:5173/post/${sharePostId}`;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Check out this post: http://localhost:5173/post/${sharePostId}`
    )}`;
    window.open(url, "_blank");
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      `http://localhost:5173/post/${sharePostId}`
    )}`;
    window.open(url, "_blank");
  };

  const copyToClipboar = () => {
    navigator.clipboard.writeText(
      "http://localhost:3000/post/" + currentPostId
    );
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const renderCommentOptionsModal = () => {
    if (!showCommentOptions || !selectedComment) return null;

    const isCurrentUserComment =
      selectedComment.user && selectedComment.user.id === currentUserId;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-xs mx-4">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-3">Comment Options</h3>

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
                onClick={() => {
                  handleDeleteComment(selectedComment.id);
                  setShowCommentOptions(false);
                }}
              >
                <X size={16} className="mr-2" />
                Delete Comment
              </button>
            </>

            <button
              className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
              onClick={() => {
                handleReportClick(comment.user?.id, "comment", comment.id);
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
  const handleDeleteComment = async (commentId) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found");
      }

      console.log("Deleting comment with ID:", commentId);

      // Gunakan endpoint yang sesuai dengan backend
      const response = await axios.delete(
        `http://localhost:3000/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response:", response);

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
        `http://localhost:3000/api/comments/${commentId}`,
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
    } catch (error) {
      console.error("Failed to update comment:", error);
      setCommentError("Failed to update comment. Please try again.");
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
        `http://localhost:3000/api/comments/${commentId}/replies?limit=100`,
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
            <h3 className="text-lg font-semibold">Semua Reply</h3>
            <button onClick={() => setShowShowcase(false)}>
              <X size={20} />
            </button>
          </div>

          {repliesToRender.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tidak ada reply.</p>
          ) : (
            <div className="space-y-3">
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

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 px-4 md:px-6 lg:px-12 xl:px-32 py-4 md:py-6">
      {renderCommentOptionsModal()}
      {renderShowcase()}
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow">
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center text-lg text-gray-600 mr-3">
            PE
          </div>
          <h2 className="font-bold">PPLG EVOTEKS</h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Notification Alert */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Link copied to clipboard!
        </div>
      )}

      {/* Left Sidebar - Profile Section */}
      <div
        className={`${
          showMobileMenu ? "block" : "hidden"
        } md:block w-full md:w-1/4 lg:w-1/4 mb-4 md:mb-0 md:pr-2 lg:pr-4`}
      >
        <div className="bg-white rounded-lg shadow mb-4 p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-gray-200 w-16 md:w-20 h-16 md:h-20 flex items-center justify-center text-2xl md:text-3xl text-gray-600">
              PE
            </div>
          </div>

          <h2 className="text-lg font-bold mb-4">PPLG EVOTEKS</h2>

          <div className="flex border-t pt-3">
            <div className="flex-1 text-center border-r">
              <div className="text-base font-semibold">358</div>
              <div className="text-gray-500 text-xs">Connections</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-base font-semibold">85</div>
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
                {data.reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-gray-500 text-xs">last 7 days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-500">+43%</div>
              <div className="text-gray-500 text-xs">Since last week</div>
            </div>
          </div>

          <div className="h-32 md:h-40 mt-2">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Main Content - Feed */}
      <div
        className={`w-full ${
          showMobileMenu ? "hidden" : "block"
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
                  PE
                </div>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="flex-1 border-none outline-none bg-transparent text-sm"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-red-500 text-center py-4">{error}</div>
              )}

              {/* Visibility Options */}
              <div className="flex items-center justify-between px-2">
                <div className="flex space-x-2">
                  {[
                    ["public", <Globe size={14} />],
                    ["private", <LockKeyhole size={14} />],
                    ["connection", <Users size={14} />],
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
                </div>
                <Tooltip title="Who can see this post">
                  <button className="text-gray-500 hover:text-blue-500">
                    <CircleHelp size={14} />
                  </button>
                </Tooltip>
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
              <div className="border rounded-md overflow-hidden text-black ck-editor-mode">
                <CKEditor
                  editor={ClassicEditor}
                  data={articleContent}
                  onChange={(e, editor) => setArticleContent(editor.getData())}
                  config={{
                    toolbar: [
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
                  }}
                />
              </div>
              {error && (
                <div className="text-red-500 text-center py-4">{error}</div>
              )}

              {/* Image preview */}
              {articleImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {articleImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.preview} // Gunakan URL preview
                        className="w-full h-24 object-cover rounded-md border"
                        alt={`img-${index}`}
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
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center text-blue-600 text-sm hover:underline"
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Add images
                  </button>
                  {[
                    ["public", <Globe size={14} />],
                    ["private", <LockKeyhole size={14} />],
                    ["connection", <Users size={14} />],
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
                </div>
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
        <div className="p-0">
          {loadingPosts ? (
            <div className="text-center py-4">Memuat post...</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow mb-4 border-b p-3"
              >
                {/* Post Header */}
                <div className="border-b pb-3 flex items-center mb-3">
                  {post.user?.photo ? (
                    <img
                      src={post.user.photo}
                      className="rounded-full mr-2 w-8 md:w-10 h-8 md:h-10"
                      alt={post.user?.name || "User"}
                    />
                  ) : (
                    <div className="rounded-full bg-gray-200 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-xs md:text-sm mr-2">
                      {post.user?.initial || "UU"}
                    </div>
                  )}
                  <div>
                    <h6 className="font-bold mb-0 text-sm md:text-base">
                      {post.user?.name || "Unknown User"}
                    </h6>
                    <small className="text-gray-500 text-xs">
                      {formatPostTime(
                        post.createdAt || new Date().toISOString()
                      )}
                    </small>
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
                      {post.visibility === "connection" && <Users size={14} />}
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                {post.content && (
                  <div
                    className="mb-3 text-sm md:text-base ck-editor-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}

                {/* Post Images */}
                {post.images && renderPhotoGrid(post.images)}

                {/* Post Actions */}
                <div className="border-t px-4 py-2 flex justify-between">
                  <button
                    className={`flex items-center justify-center w-1/3 py-2 rounded-lg ${post.isLiked
                        ? "text-blue-600 bg-blue-50"
                        : "text-blue-600 hover:bg-blue-100"
                      }`}
                    onClick={() => handleLikePost(post.id, post.isLiked)}
                  >
                    <ThumbsUp size={14} className="mr-2" />
                    Like ({post.likes_count || 0})
                  </button>

                  <button
                    className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                    onClick={() => openCommentModal(post.id)}
                  >
                    <MessageCircle size={14} className="mr-2" />
                    Comment ({post.comments_count || 0})
                  </button>

                  <button
                    className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50"
                    onClick={() => handleOpenShareModal(post.id)}
                  >
                    <Share size={14} className="mr-2" />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
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
                  value={`http://localhost:5173/post/${sharePostId}`}
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
      )}

      {/* Post Options Modal */}
      {showPostOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xs mx-4">
            <div className="p-4">
              <h3 className="font-medium text-lg mb-3">Post Options</h3>

              {/* Edit Option (only show if post belongs to current user) */}
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                onClick={() => handlePostAction("edit")}
              >
                <SquarePen size={16} className="mr-2" />
                Edit Post
              </button>

              {/* Delete Option (only show if post belongs to current user) */}
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                onClick={() => handlePostAction("delete")}
              >
                <X size={16} className="mr-2" />
                Delete Post
              </button>

              {/* Report Option */}
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                onClick={() => handleReportClick(post.user?.id, "post", post.id)}
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
                Report Post
              </button>

              {/* Connect Option (only show if post doesn't belong to current user) */}
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-blue-500"
                onClick={() => handlePostAction("connect")}
              >
                <Users size={16} className="mr-2" />
                Connect with User
              </button>
            </div>

            <div className="border-t p-3">
              <button
                className="w-full py-2 text-gray-500 hover:text-gray-700"
                onClick={handleClosePostOptions}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold mb-4">Laporkan posting ini</h3>
            <p className="mb-3 text-sm text-gray-600">Pilih kebijakan kami yang berlaku</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                "Pelecehan", "Penipuan", "Spam", "Misinformasi", "Ujaran kebencian",
                "Ancaman atau kekerasan", "Menyakiti diri sendiri", "Konten sadis",
                "Organisasi berbahaya atau ekstremis", "Konten seksual", "Akun palsu",
                "Eksploitasi anak", "Produk dan layanan ilegal", "Pelanggaran", "Lainnya"
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



            {selectedReason === "Lainnya" && (
              <textarea
                className="w-full p-2 border rounded mb-3 text-sm"
                rows={3}
                placeholder="Jelaskan alasan Anda melaporkan postingan ini"
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
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  selectedReason
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={!selectedReason}
                onClick={() => {
                  // Lakukan POST report ke backend atau tampilkan alert dulu
                  console.log("Report submitted:", selectedReason === "Lainnya" ? customReason : selectedReason);
                  setShowReportModal(false);
                  setSelectedReason("");
                  setCustomReason("");
                }}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Edit Post</h3>
            <textarea
              className="w-full border rounded-lg p-2 mb-4"
              rows="4"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />

            {/* Existing Images */}
            {articleImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Current Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {articleImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={"http://localhost:3000/" + img}
                        className="w-full h-24 object-cover rounded-md border"
                        alt={`img-${index}`}
                      />
                      <button
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        onClick={() => handleRemoveExistingImage(index)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">New Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {newImages.map((img, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-24 object-cover rounded-md border"
                        alt={`new-img-${index}`}
                      />
                      <button
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        onClick={() => handleRemoveNewImage(index)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images Button */}
            <div className="mb-4">
              <input
                type="file"
                id="edit-post-images"
                className="hidden"
                onChange={handleNewImageUpload}
                multiple
                accept="image/*"
              />
              <label
                htmlFor="edit-post-images"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <ImageIcon size={14} className="mr-2" />
                Add Images
              </label>
            </div>

            {/* Visibility Options */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Visibility</h4>
              <div className="flex space-x-2">
                {[
                  ["public", <Globe size={14} />, "Public"],
                  ["private", <LockKeyhole size={14} />, "Private"],
                  ["connection", <Users size={14} />, "Connections"],
                ].map(([type, icon, label]) => (
                  <button
                    key={type}
                    onClick={() => setPostVisibility(type)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${postVisibility === type
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {icon}
                    <span className="ml-2">{label}</span>
                  </button>
                ))}
              </div>
            </div>

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
        className={`${
          showMobileMenu ? "block" : "hidden"
        } md:block w-full md:w-1/4 lg:w-1/4 mb-4 md:mb-0 md:pl-2 lg:pr-4`}
      >
        {/* People You Might Know */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <h3 className="font-medium text-sm mb-3">People you might know</h3>

          <div className="flex items-center mb-3">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-200 overflow-hidden mr-2">
              <img
                src="/api/placeholder/40/40"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-xs md:text-sm">
                Bintang Asydqi
              </div>
              <div className="text-gray-500 text-xs">Student at Alexander</div>
            </div>
            <div className="text-blue-500">
              <svg
                className="w-4 md:w-5 h-4 md:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
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
      {showImageModal && selectedPost && (
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
                src={
                  selectedPost.images[selectedImageIndex]
                }
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
                        strokeWidth="2"
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
                        strokeWidth="2"
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
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                      selectedImageIndex === index ? "bg-white" : "bg-gray-500"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          {renderCommentOptionsModal()}
          {renderShowcase()}
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
            <div className="p-3 md:p-4 border-b flex justify-between items-center">
              <h3 className="text-base md:text-lg font-semibold">Comments</h3>
              <button onClick={closeCommentModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-3 md:p-4 overflow-y-auto flex-1">
              {loadingComments[currentPostId] ? (
                <div className="text-center py-4">Loading comments...</div>
              ) : !Array.isArray(comments[currentPostId]) ||
                comments[currentPostId].length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments[currentPostId].map((comment) => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex items-start mb-2">
                      {comment.user.photo ? (
                        <img
                          src={comment.user.photo}
                          className="rounded-full mr-2 w-6 md:w-8 h-6 md:h-8"
                          alt="User"
                        />
                      ) : (
                        <div className="rounded-full bg-gray-200 w-6 md:w-8 h-6 md:h-8 flex items-center justify-center text-xs mr-2">
                          {comment.user.initials || "UU"}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                          <div className="font-semibold text-xs md:text-sm">
                            {comment.user.name}
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="mt-2 flex">
                              <input
                                type="text"
                                className="flex-1 border rounded-l-lg p-2 text-xs md:text-sm"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                              />
                              <button
                                className="bg-blue-500 text-white px-2 md:px-3 rounded-r-lg text-xs md:text-sm"
                                onClick={() => handleUpdateComment(comment.id)}
                              >
                                Update
                              </button>
                              <button
                                className="bg-gray-500 text-white px-2 md:px-3 rounded-r-lg text-xs md:text-sm ml-1"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setCommentText("");
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs md:text-sm">
                              {comment.content}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPostTime(comment.createdAt)}
                        </div>
                        <div className="relative">
                          {/* Main actions row */}
                          <div className="flex items-center space-x-4 p-2 rounded-lg">
                            <button
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center"
                              onClick={() => {
                                setReplyingTo(comment.id);
                                setReplyToUser(comment.user);
                              }}
                            >
                              Reply
                            </button>

                            <button
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComment(comment);
                                setShowCommentOptions(!showCommentOptions);
                              }}
                            >
                              <MoreHorizontal size={14} />
                            </button>

                            {(comment.repliesCount > 0 ||
                              allReplies[comment.id]?.length > 0) && (
                              <button
                                className="text-gray-500 text-xs hover:underline"
                                onClick={() => toggleReplies(comment.id)}
                              >
                                {expandedReplies[comment.id]
                                  ? "Hide replies"
                                  : `View replies (${
                                      comment.repliesCount ||
                                      allReplies[comment.id]?.length ||
                                      0
                                    })`}
                              </button>
                            )}
                          </div>

                          {/* Dropdown menu */}
                          {showCommentOptions && (
                            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-md border border-gray-200 w-36 py-1 z-10">
                              <button
                                className="w-full text-left py-2 px-3 text-sm hover:bg-gray-100 flex items-center"
                                onClick={() => {
                                  if (selectedComment) {
                                    handleOpenShowcase(selectedComment.id);
                                    setShowCommentOptions(false);
                                  }
                                }}
                              >
                                <MessageCircle size={12} className="mr-2" />
                                See Thread
                              </button>
                              {/* You can add more dropdown options here */}
                            </div>
                          )}
                        </div>

                        {replyingTo === comment.id && (
                          <div className="mt-2 flex">
                            <input
                              type="text"
                              className="flex-1 border rounded-l-lg p-2 text-xs md:text-sm"
                              placeholder={`Reply to ${comment.user.name}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                              className="bg-blue-500 text-white px-2 md:px-3 rounded-r-lg text-xs md:text-sm"
                              onClick={() =>
                                handleReply(comment.id, comment.user)
                              }
                            >
                              Post
                            </button>
                          </div>
                        )}
                        {expandedReplies[comment.id] && (
                          <div className="mt-2 ml-4 md:ml-6 pl-2 md:pl-4 border-l-2 border-gray-200">
                            {loadingComments[comment.id] ? (
                              <div className="text-center py-2">
                                Loading replies...
                              </div>
                            ) : (
                              <>
                                {(allReplies[comment.id] || []).map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="mb-3 group relative"
                                  >
                                    <div className="flex items-start">
                                      {reply.user?.photo ? (
                                        <img
                                          src={reply.user.photo}
                                          className="rounded-full mr-2 w-5 md:w-6 h-5 md:h-6"
                                          alt="User"
                                        />
                                      ) : (
                                        <div className="rounded-full bg-gray-200 w-5 md:w-6 h-5 md:h-6 flex items-center justify-center text-xxs md:text-xs mr-2">
                                          {reply.user?.initials || "UU"}
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="bg-gray-100 rounded-lg p-1 md:p-2">
                                          <div className="font-semibold text-xxs md:text-xs items-center flex">
                                            {reply.user?.name || "Unknown User"}
                                            {reply.replyTo && (
                                              <span className="text-gray-500 ml-1 items-center flex">
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
                                                {reply.replyTo.name}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xxs md:text-xs">
                                            {reply.content}
                                          </p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <div className="text-xxs md:text-xs text-gray-500 mt-1">
                                            {formatPostTime(reply.createdAt)}
                                          </div>
                                          <button
                                            className="opacity-0 group-hover:opacity-100 text-xxs text-gray-500 hover:text-gray-700"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedComment(reply);
                                              setShowCommentOptions(true);
                                            }}
                                          >
                                            <Ellipsis size={12} />
                                          </button>
                                        </div>
                                        <button
                                          className="text-xxs text-blue-500 mt-1 md:text-xs"
                                          onClick={() => {
                                            setReplyingTo(comment.id);
                                            setReplyToUser(reply.user);
                                          }}
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 md:p-4 border-t">
              <div className="flex items-center mb-2">
                <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-xxs md:text-xs mr-2 md:mr-3">
                  PE
                </div>
                <input
                  type="text"
                  className="flex-1 border rounded-lg p-2 text-xs md:text-sm"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
              </div>
              {commentError && (
                <span className="text-red-500 text-center text-xs  font-medium mb-4 ">
                  {commentError}
                </span>
              )}
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 text-white px-3 md:px-4 py-1 rounded-lg text-xs md:text-sm"
                  onClick={handleAddComment}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed top-5 right-5 z-50">
        {alertInfo.show && (
          <Alert
            type={alertInfo.type}
            message={alertInfo.message}
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          />
        )}
      </div>
    </div>
  );
}
