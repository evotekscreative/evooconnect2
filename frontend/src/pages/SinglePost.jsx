import { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Tooltip as ChartTooltip } from "chart.js";
import { Link, useParams } from "react-router-dom";
import Case from "../components/Case.jsx";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import {
  SquarePen,
  ThumbsUp,
  MessageCircle,
  Share,
  Globe,
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
  UserPlus,
  Check,
  RefreshCw,
  NotebookPen,
  Share2,
  MoreHorizontal,
  TriangleAlert,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
} from "chart.js";
import Alert from "../components/Auth/alert";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend
);

export default function SocialNetworkFeed() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const clientUrl =
    import.meta.env.VITE_APP_CLIENT_URL || "http://localhost:5173";
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { postId } = useParams();
  const [connections, setConnections] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editArticleContent, setEditArticleContent] = useState("");
  const [editPostImages, setEditPostImages] = useState([]);
  const [newEditImages, setNewEditImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [postVisibility, setPostVisibility] = useState("public");
  const [editActiveTab, setEditActiveTab] = useState("update");
  const [likeLoading, setLikeLoading] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [allReplies, setAllReplies] = useState({});
  const [allRepliesLoaded, setAllRepliesLoaded] = useState({});
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [loadingComments, setLoadingComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentError, setCommentError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTargetUserId, setReportTargetUserId] = useState(null);

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const showAlert = (type, message) => {
    setAlertInfo({
      show: true,
      type,
      message,
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setAlertInfo((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // Fetch suggested connections
  const fetchSuggestedConnections = async () => {
    try {
      setLoadingSuggested(true);
      const userToken = localStorage.getItem("token");
      const response = await axios.get(apiUrl + "/api/user-peoples", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data?.data) {
        const connectedIds = connections.map((conn) => conn.id);
        const filtered = response.data.data.filter(
          (person) => !connectedIds.includes(person.id)
        );

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
      showAlert("error", "Failed to load suggested connections");
    } finally {
      setLoadingSuggested(false);
    }
  };

  // Handle connecting with a user
  const handleConnectWithUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/users/${currentUserId}/connections/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showAlert("success", "Connection request sent successfully");
      fetchConnections();
      fetchSuggestedConnections();
    } catch (error) {
      console.error("Failed to connect with user:", error);
      showAlert("error", "Failed to send connection request");
    }
  };

  // Fetch user connections
  const fetchConnections = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${currentUserId}/connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const connectionsData = response.data.data.connections || [];
      setConnections(connectionsData);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      showAlert("error", "Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserId(parsedUser.id);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConnections();
      fetchSuggestedConnections();
    }
  }, [currentUserId]);

  const handleOpenPostOptions = (postId) => {
    setSelectedPostId(postId);
    setShowPostOptions(true);
  };

  const handleClosePostOptions = () => {
    setShowPostOptions(false);
    setSelectedPostId(null);
  };

  const handlePostAction = (action) => {
    const post = posts.find((p) => p.id === selectedPostId);

    if (!post) {
      console.error("Post not found");
      return;
    }

    switch (action) {
      case "report":
        console.log("Report post:", post.id);
        break;
      case "connect":
        console.log("Connect with user:", post.user?.id);
        break;
      default:
        console.error("Unknown action:", action);
    }

    handleClosePostOptions();
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoadingPosts(true);
        const userToken = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/api/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.data?.data) {
          const postData = response.data.data;
          const commentsCount =
            postData.comments_count ??
            (postData.comments ? postData.comments.length : 0) ??
            0;

          setPosts([
            {
              ...postData,
              comments_count: commentsCount,
              showComments: true,
            },
          ]);

          setCurrentPostId(postData.id);
          fetchComments(postData.id);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post. Please try again later.");
      } finally {
        setLoadingPosts(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const openPremiumModal = () => {
    setShowPremiumModal(true);
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const openImageModal = (post, index) => {
    setSelectedPost(post);
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

    let postTime;
    try {
      postTime = dayjs(timestamp);
      if (!postTime.isValid()) {
        postTime = dayjs(new Date(timestamp));
      }
    } catch (e) {
      console.error("Error parsing timestamp:", timestamp, e);
      return "Just now";
    }

    if (!postTime.isValid()) {
      return "Just now";
    }

    const now = dayjs();
    const diffInSeconds = now.diff(postTime, "second");
    const diffInMinutes = now.diff(postTime, "minute");
    const diffInHours = now.diff(postTime, "hour");
    const diffInDays = now.diff(postTime, "day");

    // Handle future dates or timezone issues by showing "Just now" instead of negative values
    if (diffInSeconds < 0) return "Just now";

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    // For older dates, return formatted date (e.g. "MMM D, YYYY")
    return postTime.format("MMM D, YYYY");
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      setCommentError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/post-comments/${postId}?limit=10&offset=0&includeReplies=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const commentsWithReplies = (response.data?.data?.comments || []).map(
        (comment) => {
          return {
            id: comment.id || Math.random().toString(36).substr(2, 9),
            content: comment.content || "",
            user: comment.user || {
              name: "Unknown User",
              initials: "UU",
              username: "unknown",
              profile_photo: null,
            },
            replies: Array.isArray(comment.replies) ? comment.replies : [],
            repliesCount: comment.replies_count || 0,
            created_at: comment.created_at,
          };
        }
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
        reply_to: response.data.data.reply_to,
      };

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), newReply],
      }));

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
      showAlert("success", "Successfully added reply!");
    } catch (error) {
      showAlert("error", "Failed to add reply");
      setCommentError(
        error.response?.data?.message ||
          "Failed to add reply. Please try again."
      );
    }
  };

  const toggleReplies = async (commentId) => {
    setEditingReplyId(null);
    setEditingCommentId(null);
    setCommentText("");
    setReplyText("");

    if (!allReplies[commentId] || allReplies[commentId].length === 0) {
      await fetchReplies(commentId);
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleUpdateReply = async (replyId) => {
    if (!replyId || !replyText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/comments/${replyId}`,
        { content: replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      setEditingReplyId(null);
      setReplyText("");
      showAlert("success", "Reply updated successfully!");
    } catch (error) {
      console.error("Failed to update reply:", error);
      showAlert("error", "Failed to update reply. Please try again.");
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let parentCommentId = null;
      Object.keys(allReplies).forEach((commentId) => {
        if (allReplies[commentId].some((reply) => reply.id === replyId)) {
          parentCommentId = commentId;
        }
      });

      if (!parentCommentId) {
        throw new Error("Parent comment not found");
      }

      setAllReplies((prev) => ({
        ...prev,
        [parentCommentId]: prev[parentCommentId].filter(
          (reply) => reply.id !== replyId
        ),
      }));

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

      await axios.delete(`${apiUrl}/api/comments/${replyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowReplyOptions(false);
      setSelectedReply(null);
      showAlert("success", "Reply deleted successfully!");
    } catch (error) {
      console.error("Failed to delete reply:", error);

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

      showAlert(
        "error",
        error.response?.data?.message || "Failed to delete reply"
      );
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!commentId || !commentText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/comments/${commentId}`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
                  content: commentText,
                };
              }
              return comment;
            }
          );
        }
        return updatedComments;
      });

      setEditingCommentId(null);
      setCommentText("");
      showAlert("success", "Comment updated successfully!");
    } catch (error) {
      console.error("Failed to update post:", error);
      showAlert("error", "Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        `${apiUrl}/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setComments((prev) => {
          const updatedComments = { ...prev };
          if (updatedComments[currentPostId]) {
            updatedComments[currentPostId] = updatedComments[
              currentPostId
            ].filter((comment) => comment.id !== commentId);
          }
          return updatedComments;
        });

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
        setCommentError(null);
      }
      showAlert("success", "Comment deleted successfully!");
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
  const renderPhotoGrid = (images) => {
    if (images.length === 1) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden border">
          <img
            src={apiUrl + "/" + images[0]}
            className="w-full h-48 md:h-64 lg:h-96 object-cover cursor-pointer"
            alt="Post"
            onClick={() => openImageModal({ images }, 0)}
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
                  src={apiUrl + "/" + photo}
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
                src={apiUrl + "/" + images[0]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 1"
                onClick={() => openImageModal({ images }, 0)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={apiUrl + "/" + images[1]}
                className="w-full h-full object-cover cursor-pointer"
                alt="Post 2"
                onClick={() => openImageModal({ images }, 1)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={apiUrl + "/" + images[2]}
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
                  src={apiUrl + "/" + photo}
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

  const copyToClipboard = async () => {
    try {
      const urlToCopy = `${clientUrl}/post/${sharePostId}`;

      return;
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

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const getImageUrl = (path) => {
    if (!path) return "/placeholder-user.png";
    if (path.startsWith("http")) return path;
    return `${apiUrl}/${path}`;
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setEditArticleContent(post.content);
    setEditPostImages(post.images || []);
    setNewEditImages([]);
    setRemovedImages([]);
    setPostVisibility(post.visibility || "public");
    setEditActiveTab("update");
    setShowEditModal(true);
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewEditImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveExistingImage = (index) => {
    const imageToRemove = editPostImages[index];
    setRemovedImages((prev) => [...prev, imageToRemove]);
    setEditPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(newEditImages[index].preview);
    setNewEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Add content based on active tab
      formData.append(
        "content",
        editActiveTab === "update" ? editPostContent : editArticleContent
      );
      formData.append("visibility", postVisibility);

      // Add new images
      newEditImages.forEach((image) => {
        formData.append("images", image.file);
      });

      // Add removed images IDs if needed
      removedImages.forEach((image) => {
        if (typeof image === "object" && image.id) {
          formData.append("removedImages[]", image.id);
        }
      });

      const response = await axios.put(
        `${apiUrl}/api/posts/${editingPost.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        showAlert("success", "Post updated successfully");
        // Tutup modal edit terlebih dahulu
        setShowEditModal(false);

        // Kemudian refresh data
        if (postId) {
          // Jika melihat single post, reload
          const fetchResponse = await axios.get(
            `${apiUrl}/api/posts/${postId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPosts([fetchResponse.data.data]);
        } else {
          // Jika di feed, refetch posts
          fetchPosts();
        }
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      showAlert("error", "Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
    try {
      const token = localStorage.getItem("token");
      setLikeLoading((prev) => ({ ...prev, [postId]: true }));

      // Optimistic update untuk semua state yang relevan
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

      setUserPosts((prevPosts) =>
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

      // API call
      const response = await (isCurrentlyLiked
        ? axios.delete(`${apiUrl}/api/post-actions/${postId}/like`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : axios.post(
            `${apiUrl}/api/post-actions/${postId}/like`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ));

      // Update dengan data aktual dari server
      const updatedPost = response.data.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: updatedPost.likes_count,
              isLiked: updatedPost.is_liked,
            };
          }
          return post;
        })
      );

      setUserPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: updatedPost.likes_count,
              isLiked: updatedPost.is_liked,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to like post:", error);

      // Rollback jika error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isCurrentlyLiked
                ? post.likes_count
                : post.likes_count - 1,
              isLiked: isCurrentlyLiked,
            };
          }
          return post;
        })
      );

      setUserPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isCurrentlyLiked
                ? post.likes_count
                : post.likes_count - 1,
              isLiked: isCurrentlyLiked,
            };
          }
          return post;
        })
      );

      showAlert("error", "Failed to update like status");
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setCommentError("Komentar tidak boleh kosong");
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
          "Terjadi kesalahan saat menambahkan komentar. Silakan coba lagi."
      );
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "UU";

    const names = name.trim().split(/\s+/); // Pisahkan berdasarkan spasi

    // Ambil maksimal 3 huruf pertama dari nama depan, tengah, dan belakang
    const initials = names
      .slice(0, 3)
      .map((word) => word[0].toUpperCase())
      .join("");

    return initials || "UU";
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
    setCommentText("");
    setReplyingTo(null);
    setReplyText("");
  };

  const handleReportClick = (targetUserId, targetType, id) => {
    if (!targetUserId) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Cannot identify the content owner",
      });
      return;
    }

    if (!id) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Cannot identify the content to report",
      });
      return;
    }

    setReportTargetUserId(targetUserId);
    setSelectedPostId(id); // Untuk post
    setSelectedComment(null); // Clear comment data jika melaporkan post

    setShowReportModal(true);
    setShowPostOptions(false);
    setShowCommentOptions(false);
  };

  const ReportModal = ({
    showReportModal,
    setShowReportModal,
    selectedReason,
    setSelectedReason,
    customReason,
    setCustomReason,
    handleReportComment,
    targetUserId,
    selectedPostId,
    selectedComment,
    setAlertInfo, // Add this prop
  }) => {
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] ${
          showReportModal ? "block" : "hidden"
        }`}
      >
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
                className={`py-2 px-3 text-sm border rounded-full ${
                  selectedReason === reason
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
                const reasonText =
                  selectedReason === "Other" ? customReason : selectedReason;

                // Determine the correct content type and ID
                const contentType = selectedComment ? "comment" : "post";
                const contentId = selectedComment
                  ? selectedComment.id
                  : selectedPostId;

                // Ensure all parameters are defined
                if (targetUserId && contentId && reasonText) {
                  handleReportComment(
                    targetUserId,
                    contentType,
                    contentId,
                    reasonText
                  );
                } else {
                  console.error("Report parameters:", {
                    targetUserId,
                    contentType,
                    contentId,
                    reasonText,
                  });
                  setAlertInfo({
                    show: true,
                    type: "error",
                    message: "Missing information needed to submit report",
                  });
                }
              }}
            >
              Report
            </button>
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <Case>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          isVisible={alertInfo.show}
          onClose={() => setAlertInfo((prev) => ({ ...prev, show: false }))}
        />
      </div>

      <div className="flex flex-col md:flex-row bg-gray-50 px-4 md:px-6 lg:px-12 xl:px-32 py-4 md:py-6">
        {/* Notification Alert */}
        {showNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Link copied to clipboard!
          </div>
        )}

        {/* Left Sidebar - Profile Section */}
        <div className=" md:block w-full md:w-1/4 lg:w-1/4 mb-4 md:mb-0 md:pr-2 lg:pr-4">
          <div className="bg-white rounded-lg shadow mb-4 p-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="relative w-28 h-28 mx-auto bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {posts[0]?.user?.photo ? (
                  <img
                    src={apiUrl + "/" + posts[0].user.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-lg font-bold text-gray-600">
                      {posts[0]?.user?.name
                        ? posts[0].user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "UU"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold mb-4">
              {posts[0]?.user?.name || "Unknown User"}
            </h2>

            <Link to={`/profile/${posts[0]?.user?.username}`}>
              <button className="mt-3 text-blue-500 text-sm font-medium">
                View profile
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content - Feed */}
        <div
          className={`w-full ${
            showMobileMenu ? "hidden" : "block"
          } md:block md:w-full lg:w-1/2 px-0 md:px-1`}
        >
          {/* Posts */}
          <div className="p-0">
            {loadingPosts ? (
              <div className="text-center py-4">Memuat post...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow mb-4 border-b p-3"
                >
                  {/* Post Header */}
                  <div className="border-b pb-3 flex items-center mb-3">
                    <div className="rounded-full bg-gray-200 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-xs md:text-sm mr-2">
                      {posts[0]?.user?.photo ? (
                  <img
                    src={apiUrl + "/" + posts[0].user.photo}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-lg font-bold text-gray-600">
                     {getInitials(post.user?.name)}
                    </span>
                  </div>
                )}
                      
                    </div>
                    <div className="ml-1 mt-2">
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
                          {formatPostTime(
                            post.created_at || new Date().toISOString()
                          )}
                        </small>
                        <span className="text-gray-400 mx-1 text-xs">•</span>
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
                        {post.visibility === "connection" && (
                          <Users size={14} />
                        )}
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
                  <div>
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

                    <div className="border-t border-gray-200 px-4 py-2 flex justify-between">
                      <button
                        className={`flex items-center justify-center w-1/3 py-2 rounded-lg ${
                          post.isLiked
                            ? "text-blue-600 bg-blue-50"
                            : "text-black hover:bg-gray-100"
                        }`}
                        onClick={() => handleLikePost(post.id, post.isLiked)}
                      >
                        <ThumbsUp size={14} className="mr-2" />
                        Like
                      </button>
                      <button
                        className="flex items-center justify-center w-1/3 py-2 rounded-lg text-black hover:bg-gray-100"
                        onClick={() => openCommentModal(post.id)}
                      >
                        <MessageCircle size={14} className="mr-2" />
                        Comment
                      </button>

                      <button
                        className="flex items-center justify-center w-1/3 py-2 rounded-lg text-black hover:bg-gray-100"
                        onClick={() => handleOpenShareModal(post.id)}
                      >
                        <Share2 size={14} className="mr-2" />
                        Share
                      </button>
                    </div>
                  </div>
                  {/* Comment Form */}
                  <div className="border-t px-4 py-3">
                    <div className="flex items-center mb-2">
                      <div className="rounded-full bg-gray-200 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-xs md:text-sm mr-2">
                      {posts[0]?.user?.photo ? (
                  <img
                    src={apiUrl + "/" + posts[0].user.photo}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-lg font-bold text-gray-600">
                     {getInitials(post.user?.name)}
                    </span>
                  </div>
                )}
                      </div>
                      <input
                        type="text"
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddComment()
                        }
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        className="bg-blue-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors duration-200"
                      >
                        Post
                      </button>
                    </div>
                    {commentError && (
                      <span className="text-red-500 text-xs">
                        {commentError}
                      </span>
                    )}
                  </div>

                  {/* Comments Section */}
                  {comments[currentPostId]?.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 rounded-b-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Comments ({comments[currentPostId]?.length || 0})
                      </h4>
                      <div className="space-y-4">
                        {comments[currentPostId].map((comment) => (
                          <div key={comment.id} className="group">
                            <div className="flex items-start gap-3">
                              {/* Comment Avatar */}
                              <div className="flex-shrink-0">
                                {comment.user?.profile_photo ? (
                                  <Link
                                    to={`/user-profile/${comment.user.username}`}
                                  >
                                    <img
                                      className="rounded-full w-9 h-9 object-cover border-2 border-white hover:border-blue-200 transition-colors"
                                      src={
                                        comment.user.profile_photo.startsWith(
                                          "http"
                                        )
                                          ? comment.user.profile_photo
                                          : `${apiUrl}/${comment.user.profile_photo}`
                                      }
                                      alt="Profile"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "";
                                        e.target.parentElement.classList.add(
                                          "bg-gray-200"
                                        );
                                      }}
                                    />
                                  </Link>
                                ) : (
                                  <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-full text-xs font-medium text-gray-700">
                                    {getInitials(comment.user?.name)}
                                  </div>
                                )}
                              </div>

                              {/* Comment Content */}
                              <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <Link
                                        to={`/user-profile/${comment.user.username}`}
                                        className="font-semibold text-sm text-gray-800 hover:text-blue-600 hover:underline"
                                      >
                                        {comment.user?.name || "Unknown User"}
                                      </Link>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {formatPostTime(comment.created_at)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {comment.user?.id === currentUserId && (
                                        <button
                                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
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
                                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
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
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                                        value={commentText}
                                        onChange={(e) =>
                                          setCommentText(e.target.value)
                                        }
                                        autoFocus
                                      />
                                      <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                        onClick={() =>
                                          handleUpdateComment(comment.id)
                                        }
                                      >
                                        Update
                                      </button>
                                      <button
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors"
                                        onClick={() =>
                                          setEditingCommentId(null)
                                        }
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                                      {comment.content}
                                    </p>
                                  )}

                                  {/* Comment Actions */}
                                  <div className="flex justify-between items-center mt-3">
                                    <div className="flex gap-4">
                                      <button
                                        onClick={() => {
                                          setReplyingTo(comment.id);
                                          setReplyToUser(comment.user);
                                        }}
                                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 mr-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                          />
                                        </svg>
                                        Reply
                                      </button>
                                      {(comment.repliesCount > 0 ||
                                        allReplies[comment.id]?.length > 0) && (
                                        <button
                                          onClick={() =>
                                            toggleReplies(comment.id)
                                          }
                                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                          {expandedReplies[comment.id]
                                            ? "Hide replies"
                                            : `Show replies (${comment.repliesCount})`}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Reply Input */}
                                {replyingTo === comment.id && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                                      placeholder={`Reply to ${
                                        replyToUser?.name || "user"
                                      }...`}
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        handleReply(
                                          comment.id,
                                          replyToUser || comment.user
                                        )
                                      }
                                      autoFocus
                                    />
                                    <button
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition-colors"
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
                                  <div className="mt-3 ml-3 pl-5 border-l-2 border-gray-100 space-y-3">
                                    {loadingComments[comment.id] ? (
                                      <div className="flex justify-center py-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                      </div>
                                    ) : (
                                      (allReplies[comment.id] || []).map(
                                        (reply) => (
                                          <div key={reply.id} className="group">
                                            <div className="flex gap-3">
                                              {/* Reply Avatar */}
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
                                                          ? reply.user
                                                              .profile_photo
                                                          : `${apiUrl}/${reply.user.profile_photo}`
                                                      }
                                                      alt="Profile"
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "";
                                                        e.target.parentElement.classList.add(
                                                          "bg-gray-200"
                                                        );
                                                      }}
                                                    />
                                                  </Link>
                                                ) : (
                                                  <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-full text-xs font-medium text-gray-600">
                                                    {getInitials(
                                                      reply.user?.name
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Reply Content */}
                                              <div className="flex-1 min-w-0">
                                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
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
                                                              {
                                                                reply.reply_to
                                                                  .name
                                                              }
                                                            </Link>
                                                          </span>
                                                        )}
                                                      <span className="text-xs text-gray-500 ml-2">
                                                        {formatPostTime(
                                                          reply.created_at
                                                        )}
                                                      </span>
                                                    </div>

                                                    {/* Reply Actions */}
                                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      {reply.user?.id ===
                                                        currentUserId && (
                                                        <button
                                                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedReply(
                                                              reply
                                                            );
                                                            setShowReplyOptions(
                                                              true
                                                            );
                                                          }}
                                                        >
                                                          <MoreHorizontal
                                                            size={14}
                                                          />
                                                        </button>
                                                      )}

                                                      {reply.user?.id !==
                                                        currentUserId && (
                                                        <button
                                                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                              reply.user?.id
                                                            ) {
                                                              handleReportClick(
                                                                reply.user.id,
                                                                "comment",
                                                                reply.id
                                                              );
                                                            }
                                                          }}
                                                        >
                                                          <TriangleAlert
                                                            size={14}
                                                          />
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Reply Text */}
                                                  {editingReplyId ===
                                                  reply.id ? (
                                                    <div className="mt-2 flex gap-2">
                                                      <input
                                                        type="text"
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                                                        value={replyText}
                                                        onChange={(e) =>
                                                          setReplyText(
                                                            e.target.value
                                                          )
                                                        }
                                                        autoFocus
                                                      />
                                                      <button
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                                                        onClick={() =>
                                                          handleUpdateReply(
                                                            reply.id
                                                          )
                                                        }
                                                      >
                                                        Update
                                                      </button>
                                                      <button
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs transition-colors"
                                                        onClick={() => {
                                                          setEditingReplyId(
                                                            null
                                                          );
                                                          setReplyText("");
                                                        }}
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                                                      {reply.content}
                                                    </p>
                                                  )}

                                                  {/* Reply Actions */}
                                                  <div className="flex items-center mt-2">
                                                    <button
                                                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                                                      onClick={() => {
                                                        setReplyingTo(reply.id);
                                                        setReplyToUser(
                                                          reply.user
                                                        );
                                                      }}
                                                    >
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3 w-3 mr-1"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth={2}
                                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                        />
                                                      </svg>
                                                      Reply
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Nested Reply Input */}
                                            {replyingTo === reply.id && (
                                              <div className="mt-3 ml-11 flex gap-2">
                                                <input
                                                  type="text"
                                                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                                                  placeholder={`Reply to ${
                                                    replyToUser?.name ||
                                                    reply.user.name
                                                  }...`}
                                                  value={replyText}
                                                  onChange={(e) =>
                                                    setReplyText(e.target.value)
                                                  }
                                                  autoFocus
                                                />
                                                <button
                                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition-colors"
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
                                        )
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
        )}

        {/* Post Options Modal */}
        {showPostOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xs mx-4">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-3">Post Options</h3>

                {/* Cek apakah post ini milik user yang sedang login */}
                {posts.find((p) => p.id === selectedPostId)?.user?.id ===
                currentUserId ? (
                  <>
                    {/* Options for user's own post */}
                    <button
                      className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                      onClick={() => {
                        handleEditPost(
                          posts.find((p) => p.id === selectedPostId)
                        );
                        handleClosePostOptions();
                      }}
                    >
                      <SquarePen size={16} className="mr-2" />
                      Edit Post
                    </button>
                  </>
                ) : (
                  <>
                    {/* Options for other user's post */}
                    <button
                      className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                      onClick={() => {
                        // setShowReportModal(true);
                        showAlert("info", "Report feature coming soon");
                        handleClosePostOptions();
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
                      Report Post
                    </button>
                    {!connections.some(
                      (conn) =>
                        conn.id ===
                        posts.find((p) => p.id === selectedPostId)?.user?.id
                    ) && (
                      <button
                        className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-blue-500"
                        onClick={() => {
                          handleConnectWithUser(
                            posts.find((p) => p.id === selectedPostId)?.user?.id
                          );
                          handleClosePostOptions();
                        }}
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
        )}

        {showCommentOptions && selectedComment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xs mx-4">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-3">Comment Options</h3>

                {/* Check if the comment belongs to the current user */}
                {selectedComment.user?.id === currentUserId ? (
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
                      if (selectedComment.user?.id) {
                        handleReportClick(
                          selectedComment.user.id,
                          "comment",
                          selectedComment.id
                        );
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
        )}

        {showReplyOptions && selectedReply && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xs mx-4">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-3">Reply Options</h3>

                {selectedReply.user?.id === user.id ? (
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
                      if (selectedReply.user?.id) {
                        // Handle report reply
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
        )}

        {/* Right Sidebar */}
        <div
          className={`${
            showMobileMenu ? "block" : "hidden"
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
                  className={`w-4 h-4 ${
                    loadingSuggested ? "animate-spin" : ""
                  }`}
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
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-500">
                              {person.initials}
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
                  src={apiUrl + "/" + selectedPost.images[selectedImageIndex]}
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
                        selectedImageIndex === index
                          ? "bg-white"
                          : "bg-gray-500"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <h3 className="text-lg font-medium mb-4">Edit Post</h3>

              {/* Tabs for edit modal */}
              <div className="flex border-b pb-2 space-x-1 mb-4">
                <button
                  className={`flex-1 flex items-center justify-center text-sm font-medium py-2 rounded-t-lg transition ${
                    editActiveTab === "update"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setEditActiveTab("update")}
                >
                  <SquarePen size={16} className="mr-2" />
                  Simple Text
                </button>
                <button
                  className={`flex-1 flex items-center justify-center text-sm font-medium py-2 rounded-t-lg transition ${
                    editActiveTab === "article"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setEditActiveTab("article")}
                >
                  <NotebookPen size={16} className="mr-2" />
                  Rich Text Editor
                </button>
              </div>

              {/* Editor content based on active tab */}
              {editActiveTab === "update" ? (
                <textarea
                  className="w-full border rounded-lg p-2 mb-4"
                  rows="4"
                  value={editPostContent.replace(/<[^>]+>/g, "")}
                  onChange={(e) => setEditPostContent(e.target.value)}
                />
              ) : (
                <div className="border rounded-md overflow-hidden text-black ck-editor-mode mb-4">
                  <CKEditor
                    editor={ClassicEditor}
                    data={editArticleContent}
                    onChange={(e, editor) =>
                      setEditArticleContent(editor.getData())
                    }
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
              )}

              {/* Existing Images */}
              {editPostImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Current Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {editPostImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={
                            typeof img === "string"
                              ? img.startsWith("http")
                                ? img
                                : `${apiUrl}/${img}`
                              : img.preview
                          }
                          className="w-full h-24 object-cover rounded-md border"
                          alt={`Current image ${index + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
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
              {newEditImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">New Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {newEditImages.map((img, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={img.preview}
                          className="w-full h-24 object-cover rounded-md border"
                          alt={`New image ${index + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
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
                    ["connections", <Users size={14} />, "Connections"],
                  ].map(([type, icon, label]) => (
                    <button
                      key={type}
                      onClick={() => setPostVisibility(type)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm ${
                        postVisibility === type
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

        {showReportModal && (
          <ReportModal
            showReportModal={showReportModal}
            setShowReportModal={setShowReportModal}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            customReason={customReason}
            setCustomReason={setCustomReason}
            handleReportComment={handleReportComment}
            targetUserId={reportTargetUserId}
            selectedPostId={selectedPostId}
            selectedComment={selectedComment}
            setAlertInfo={setAlertInfo} // Pass this prop
          />
        )}
      </div>
    </Case>
  );
}
