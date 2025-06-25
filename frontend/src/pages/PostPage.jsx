import React from "react";
import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import dayjs from "dayjs";
import {
  MessageCircle,
  Share2,
  Send,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Users as UsersIcon,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  Bookmark,
  GraduationCap,
  Building,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  MapPin,
  RefreshCw,
  UserPlus,
  Eye,
  X,
  Copy,
  Check,
  Ellipsis,
  LockKeyhole,
  SquarePen,
  NotebookPen,
  ImageIcon,
  TriangleAlert,
  MoreHorizontal,
} from "lucide-react";
import Case from "../components/Case.jsx";
import axios from "axios";
import Alert from "../components/Auth/alert";

const PostPage = () => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [connections, setConnections] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentError, setCommentError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isPostOptionsOpen, setIsPostOptionsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editArticleContent, setEditArticleContent] = useState("");
  const [editPostImages, setEditPostImages] = useState([]);
  const [newEditImages, setNewEditImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [postVisibility, setPostVisibility] = useState("public");
  const [editActiveTab, setEditActiveTab] = useState("update");
  const [showEditModal, setShowEditModal] = useState(false);
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
  const [reportTargetUserId, setReportTargetUserId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "",
    message: "",
  });
  const clientUrl =
    import.meta.env.VITE_APP_CLIENT_URL || "http://localhost:5173";
  const [profileViews, setProfileViews] = useState({
    thisWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
    dailyViews: [],
  });
  const [user, setUser] = useState({
    id: "",
    name: "",
    headline: "",
    photo: null,
    skills: [],
    socials: {},
  });
  const [alerts, setAlerts] = useState([]);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPostForImage, setSelectedPostForImage] = useState(null);

  // Fungsi untuk membuka modal gambar
  const openImageModal = (post, index) => {
    // Pastikan semua gambar memiliki URL lengkap
    const images = post.images.map((img) =>
      img.startsWith("http") ? img : `${apiUrl}/${img}`
    );
    setSelectedPostForImage({ ...post, images });
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedPostForImage(null);
    setSelectedImageIndex(0);
  };

  const navigateImage = (direction) => {
    if (!selectedPostForImage) return;
    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedPostForImage.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === selectedPostForImage.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const addAlert = (type, message) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const socialPlatforms = [
    {
      name: "instagram",
      icon: <Instagram className="w-5 h-5" />,
      color: "text-pink-500",
    },
    {
      name: "facebook",
      icon: <Facebook className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      name: "twitter",
      icon: <Twitter className="w-5 h-5" />,
      color: "text-blue-400",
    },
    {
      name: "linkedin",
      icon: <Linkedin className="w-5 h-5" />,
      color: "text-blue-700",
    },
    {
      name: "github",
      icon: <Github className="w-5 h-5" />,
      color: "text-black",
    },
  ];

  const fetchConnections = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const connectionsData = response.data.data.connections || [];
      setConnections(connectionsData);
      setConnectionsCount(response.data.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      addAlert("error", "Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileViews = async () => {
    try {
      const token = localStorage.getItem("token");
      const [thisWeekResponse, lastWeekResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/user/profile/views/this-week`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/api/user/profile/views/last-week`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const thisWeekData = thisWeekResponse.data.data || {};
      const lastWeekData = lastWeekResponse.data.data || {};

      const days = [];
      const dailyCounts = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        days.push(formattedDate);

        const dailyViews =
          thisWeekData.viewers?.filter(
            (viewer) =>
              new Date(viewer.viewed_at).toISOString().split("T")[0] ===
              formattedDate
          ) || [];

        dailyCounts.push(dailyViews.length);
      }

      const thisWeekTotal = thisWeekData.count || 0;
      const lastWeekTotal = lastWeekData.count || 0;

      let percentageChange = 0;
      if (lastWeekTotal > 0) {
        percentageChange =
          ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      } else if (thisWeekTotal > 0) {
        percentageChange = 100;
      }

      setProfileViews({
        thisWeek: thisWeekTotal,
        lastWeek: lastWeekTotal,
        percentageChange: Math.round(percentageChange),
        dailyViews: thisWeekData.viewers || [],
      });
    } catch (error) {
      console.error("Failed to fetch profile views:", error);
      addAlert("error", "Failed to load profile views");
    }
  };
  const fetchSuggestedConnections = async () => {
    try {
      setLoadingSuggested(true);
      const userToken = localStorage.getItem("token");
      const response = await axios.get(apiUrl + "/api/user-peoples", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log("Response data:", response.data);

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

        console.log("Suggested connections:", suggestions);

        setSuggestedConnections(suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch suggested connections:", error);
    } finally {
      setLoadingSuggested(false);
      console.log("Suggested connections:", suggestedConnections);
    }
  };

  const fetchSimilarJobs = async () => {
    try {
      setLoadingJobs(true);
      const userToken = localStorage.getItem("token");
      const response = await axios.get(apiUrl + "/api/jobs/random", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data?.data?.jobs) {
        setSimilarJobs(response.data.data.jobs.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch similar jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleConnectWithUser = async (userId) => {
    try {
      const userToken = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/connections/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      fetchConnections();
      fetchSuggestedConnections();

      addAlert("success", "Connection request sent!");
    } catch (error) {
      console.error("Failed to connect with user:", error);
      addAlert("error", "Failed to send connection request");
    }
  };

  const fetchUserPosts = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/posts?limit=10&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const postsWithLikeStatus = response.data.data.map((post) => ({
        ...post,
        isLiked: post.is_liked || false, // Gunakan nilai dari server
        visibility: post.visibility || "public",
        group: post.group || null,
      }));

      setUserPosts(postsWithLikeStatus);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(apiUrl + "/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Convert socials array to object
      const socialsObject = {};
      if (
        response.data.data.socials &&
        Array.isArray(response.data.data.socials)
      ) {
        response.data.data.socials.forEach((social) => {
          socialsObject[social.platform] = social.username;
        });
      }

      // Handle skills data
      let userSkills = [];

      const skillsData = response?.data?.data?.skills;

      if (skillsData) {
        if (Array.isArray(skillsData)) {
          userSkills = skillsData;
        } else if (skillsData.String) {
          userSkills = [skillsData.String];
        }
      }

      setUser({
        id: response.data.data.id || "",
        name: response.data.data.name || "",
        headline: response.data.data.headline || "",
        photo: response.data.data.photo || null,
        skills: userSkills,
        socials: socialsObject,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      addAlert("error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
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
        return utcDate.format("h:mm A"); // hasil: 2:49 AM
      } else {
        return utcDate.format("MMM D [at] h:mm A"); // Misal: Jun 5 at 02:49
      }
    } catch (error) {
      console.error("Time formatting error:", error);
      return "";
    }
  };
  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, []);

  useEffect(() => {
    if (user.id) {
      fetchConnections();
      fetchSuggestedConnections();
      fetchUserPosts();
      fetchSimilarJobs();
    }
  }, [user.id]); // Add user.id as dependency

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

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      // Optimistic UI update
      setUserPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );

      // Close menus
      setUserPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          showOptions: false,
          showVisibilityMenu: false,
        }))
      );

      // API call to delete post
      await axios.delete(`${apiUrl}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      addAlert("success", "Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete post:", error);
      addAlert("error", "Failed to delete post");
      // You might want to re-fetch posts here to revert the UI
      fetchUserPosts();
    }
  };

  const handleOpenPostOptions = (post) => {
    setSelectedPost(post);
    setIsPostOptionsOpen(true);
  };

  const handleClosePostOptions = () => {
    setIsPostOptionsOpen(false);
    setSelectedPost(null);
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

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const content =
        editActiveTab === "update" ? editPostContent : editArticleContent;

      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", postVisibility);

      // Add existing images that weren't removed
      editPostImages.forEach((img) => {
        if (typeof img === "string") {
          formData.append("existingImages", img);
        }
      });

      // Add new images
      newEditImages.forEach((img) => {
        formData.append("images", img.file);
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

      // Update the posts list with the edited post
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPost.id ? response.data.data : post
        )
      );

      setShowEditModal(false);
      setEditingPost(null);
      addAlert("success", "Post updated successfully!");
    } catch (error) {
      console.error("Failed to update post:", error);
      addAlert("error", "Failed to update post. Please try again.");
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
    setRemovedImages([...removedImages, removed]);
    setEditPostImages(editPostImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    const newImagesCopy = [...newEditImages];
    URL.revokeObjectURL(newImagesCopy[index].preview);
    newImagesCopy.splice(index, 1);
    setNewEditImages(newImagesCopy);
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
    try {
      const token = localStorage.getItem("token");

      // Optimistic update - langsung update UI sebelum API call selesai
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

      // Update dengan data aktual dari server (fallback jika optimistic update tidak sesuai)
      setUserPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: response.data.data.likes_count, // Pastikan path response benar
              isLiked: response.data.data.is_liked,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to like post:", error);

      // Rollback jika error
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

      addAlert("error", "Failed to like post");
    }
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
          replyTo: replyingTo, // This should be the comment ID you're replying to
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
      addAlert("success", "Reply updated successfully!");
    } catch (error) {
      console.error("Failed to update reply:", error);
      addAlert("error", "Failed to update reply. Please try again.");
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
      addAlert("success", "Reply deleted successfully!");
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

      addAlert(
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
      addAlert("success", "Comment updated successfully!");
    } catch (error) {
      console.error("Failed to update post:", error);
      addAlert("error", "Failed to update comment. Please try again.");
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

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setShowCommentModal(true);
    fetchComments(postId);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
    setCommentText("");
    setReplyingTo(null);
    setReplyText("");
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
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");

    return initials || "UU";
  };
  const handleReportClick = (targetUserId, targetType, id) => {
    if (!targetUserId) {
      addAlert("error", "Cannot identify the content owner");
      return;
    }

    if (!id) {
      addAlert("error", "Cannot identify the content to report");
      return;
    }

    setReportTargetUserId(targetUserId);

    if (targetType === "comment") {
      setSelectedComment({
        id: id,
        userId: targetUserId,
        targetType: targetType,
      });
      setSelectedPostId(null);
    } else if (targetType === "post") {
      setSelectedPostId(id);
      setSelectedComment(null);
    }

    setShowReportModal(true);
    setIsPostOptionsOpen(false); // Tutup menu options jika terbuka
    setShowCommentOptions(false); // Tutup menu comment options jika terbuka
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
    setAlertInfo,
  }) => {
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] ${
          showReportModal ? "block" : "hidden"
        }`}
      >
        <div className="w-full max-w-md p-5 mx-4 bg-white rounded-lg">
          <h3 className="mb-4 text-lg font-semibold">Report this content</h3>
          <p className="mb-3 text-sm text-gray-600">
            Please select a reason for reporting
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              "Harassment",
              "Fraud",
              "Spam",
              "Missinformation",
              "Hate Speech",
              "Threats or violence",
              "self-harm",
              "Graphic or violent content",
              "Dangerous or extremist organizations",
              "Sexual Content",
              "Fake Account",
              "Child Exploitation",
              "Illegal products and services",
              "Infringement",
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
              className="w-full p-2 mb-3 text-sm border rounded"
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
    contentType,
    contentId,
    reason
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/reports`,
        {
          target_user_id: targetUserId,
          content_type: contentType,
          content_id: contentId,
          reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      addAlert("success", "Report submitted successfully");
      setShowReportModal(false);
    } catch (error) {
      console.error("Failed to submit report:", error);
      addAlert("error", "Failed to submit report");
    }
  };

  const renderPhotoGrid = (images, post) => {
    if (!images || images.length === 0) return null;
    const validImages = images.map((img) =>
      img.startsWith("http") ? img : `${apiUrl}/${img}`
    );
    if (validImages.length === 1) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <img
            src={validImages[0]}
            className="object-cover w-full h-48 cursor-pointer md:h-64 lg:h-96"
            alt="Post"
            onClick={() => openImageModal({ ...post, images: validImages }, 0)}
          />
        </div>
      );
    } else if (validImages.length === 2) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            {validImages.map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo}
                  className="object-cover w-full h-full cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() =>
                    openImageModal({ ...post, images: validImages }, index)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (images.length === 3) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            <div className="relative row-span-2 aspect-square">
              <img
                src={apiUrl + "/" + images[0]}
                className="object-cover w-full h-full cursor-pointer"
                alt="Post 1"
                onClick={() => openImageModal({ images }, 0)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={apiUrl + "/" + images[1]}
                className="object-cover w-full h-full cursor-pointer"
                alt="Post 2"
                onClick={() => openImageModal({ images }, 1)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={apiUrl + "/" + images[2]}
                className="object-cover w-full h-full cursor-pointer"
                alt="Post 3"
                onClick={() => openImageModal({ images }, 2)}
              />
            </div>
          </div>
        </div>
      );
    } else if (images.length >= 4) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            {images.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={apiUrl + "/" + photo}
                  className="object-cover w-full h-full cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ images }, index)}
                />
                {index === 3 && images.length > 4 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white bg-black bg-opacity-50 cursor-pointer"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#EDF3F7] min-h-screen">
      {/* Navbar would be here if you have one */}
      <Case />

      {/* Content */}
      <div className="w-full px-4 py-6 mx-auto sm:px-6">
        {/* Alerts container */}
        <div className="fixed z-50 space-y-2 top-4 right-4 w-80">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alert.type}
              message={alert.message}
              onClose={() => removeAlert(alert.id)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-6 mx-auto max-w-7xl md:flex-row">
          {/* Left Sidebar - Narrower */}
          <div className="w-full space-y-4 md:w-1/4 lg:w-1/5">
            <div className="p-4 text-center bg-white rounded-lg shadow-md">
              {/* Di komponen gambar profil */}
              <div className="relative flex items-center justify-center mx-auto overflow-hidden bg-gray-200 rounded-full w-28 h-28">
                {user.photo ? (
                  <img
                    src={
                      user.photo.startsWith("http")
                        ? user.photo
                        : `${apiUrl}/${user.photo}`
                    }
                    alt="Profile"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                      e.target.parentElement.classList.add("bg-gray-300");
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-300">
                    <span className="text-lg font-bold text-gray-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
              <p className="text-base text-gray-500">
                {user.headline || "No headline yet"}
              </p>

              <div className="mt-5 space-y-2 text-left">
                <Link
                  to="/list-connection"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2 text-base">
                    <Users size={18} /> Connections
                  </span>
                  <span className="text-lg font-bold">{connectionsCount}</span>
                </Link>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <span className="flex items-center gap-2 text-base">
                    <Eye size={18} /> Views
                  </span>
                  <span className="text-lg font-bold">
                    {profileViews.thisWeek}
                  </span>
                </div>
                <Link
                  to="/job-saved"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Bookmark size={18} /> Job Saved
                  </span>
                  <span className="text-base font-bold">120</span>
                </Link>
              </div>

              <button className="mt-5 text-sm text-blue-600">Log Out</button>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-base font-semibold">Skills</h3>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-base text-gray-500">
                  No skills added yet
                </p>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="mb-2 text-base font-semibold">Social Media</h3>
              {Object.keys(user.socials).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(user.socials).map(([platform, username]) => {
                    const platformInfo = socialPlatforms.find(
                      (p) => p.name === platform
                    );
                    return (
                      <div
                        key={platform}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                      >
                        {platformInfo && (
                          <div
                            className={`p-2 rounded-full ${platformInfo.color} bg-gray-50`}
                          >
                            {platformInfo.icon}
                          </div>
                        )}
                        <span className="text-sm truncate">@{username}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No social media added yet.
                </p>
              )}
            </div>
          </div>

          {/* Main Post Content - Wider */}
          <div className="w-full md:w-2/4 lg:w-3/5">
            <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm">
              {/* Sample Post */}
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 mb-6 space-y-4 bg-white rounded-lg shadow-md"
                  >
                    {/* Header */}
                    <div className="relative pb-3 mb-3 border-b border-gray-200">
                      {/* Group info - as background element */}
                      {post.group && (
                        <Link to={`/groups/${post.group.id}`}>
                          {/* Group photo */}
                          <div className="absolute top-0 left-0 z-0 bottom-2">
                            {post.group.image ? (
                              <img
                                className="object-cover w-12 h-12 border-2 border-gray-300 rounded-lg shadow-md"
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
                              <div className="flex items-center justify-center w-12 h-12 bg-gray-300 border-2 border-white rounded-lg shadow-md">
                                <span className="text-xs font-bold text-gray-600">
                                  {getInitials(post.group?.name)}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start">
                          {/* User photo */}
                          <div
                            className={`${
                              post?.group
                                ? "relative z-10 ml-4 mt-2 transform translate-y-2"
                                : ""
                            }`}
                          >
                            {post.user?.photo ? (
                              <Link to={`/user-profile/${post.user.username}`}>
                                <img
                                  className="object-cover w-10 h-10 border-2 border-gray-300 rounded-full"
                                  src={
                                    post.user.photo.startsWith("http")
                                      ? post.user.photo
                                      : `${apiUrl}/${post.user.photo}`
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
                              <div className="flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-200 rounded-full w-9 h-9">
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
                              className="mb-0 text-sm font-bold cursor-pointer hover:underline"
                              onClick={() =>
                                fetchUserProfile(
                                  post.user.username,
                                  post.user.id
                                )
                              }
                            >
                              {post.user?.name || "Unknown User"}
                            </h6>
                            <div className="flex items-center">
                              <small className="text-xs text-gray-500">
                                {formatPostTime(
                                  post.created_at || new Date().toISOString()
                                )}
                              </small>
                              <span className="mx-1 text-xs text-gray-400">
                                •
                              </span>
                              {post.group && (
                                <small className="text-xs text-gray-500">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <a
                                      href="#"
                                      className="text-blue-500 hover:underline"
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
                        <div className="relative ml-auto group">
                          <button
                            className="p-1 mr-2 bg-gray-100 rounded-full hover:bg-gray-200"
                            onClick={() => handleOpenPostOptions(post.id)}
                          >
                            <Ellipsis size={14} />
                          </button>
                          <button className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                            {post.visibility === "public" && (
                              <Globe size={14} />
                            )}
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

                    {/* Body */}
                    <div className="mt-3 mb-3 text-sm">
                      <div
                        className="prose text-gray-700 max-w-none ck-content custom-post-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      {post.images && renderPhotoGrid(post.images, post)}
                    </div>

                    {/* Footer */}
                    <div>
                      {/* Likes & Comments Info */}
                      <div className="flex items-center justify-between px-4 py-1 space-x-4 text-xs text-gray-500">
                        <div className="flex items-center pt-1 space-x-1">
                          <span className="flex text-black">
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
                      <div className="flex justify-between px-4 py-2 border-t border-gray-200">
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
                          className="flex items-center justify-center w-1/3 py-2 text-black rounded-lg hover:bg-gray-100"
                          onClick={() => openCommentModal(post.id)}
                        >
                          <MessageCircle size={14} className="mr-2" />
                          Comment
                        </button>

                        <button
                          className="flex items-center justify-center w-1/3 py-2 text-black rounded-lg hover:bg-gray-100"
                          onClick={() => handleOpenShareModal(post.id)}
                        >
                          <Share2 size={14} className="mr-2" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 mb-4 text-center bg-white border rounded-lg shadow-sm">
                  <p className="text-gray-500">No posts yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Narrower */}
          <div className="w-full space-y-4 md:w-1/4 lg:w-1/5">
            {/* People You Might Know */}
            <div className="p-4 mb-6 transition-all duration-300 bg-white border shadow-sm rounded-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  People you might know
                </h3>
                <button
                  onClick={fetchSuggestedConnections}
                  disabled={loadingSuggested}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 disabled:opacity-50"
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
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <span className="text-sm">Finding suggestions...</span>
                  </div>
                </div>
              ) : suggestedConnections.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full">
                    <UserPlus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No suggestions available at the moment
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Check back later for new connections
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestedConnections.map((person, index) => (
                    <div
                      key={person.id}
                      className="flex items-center p-3 transition-all duration-200 border border-transparent rounded-lg group hover:bg-gray-50 hover:border-gray-200"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "fadeInUp 0.5s ease-out forwards",
                      }}
                    >
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0 mr-3">
                        <div className="w-12 h-12 overflow-hidden bg-gray-200 rounded-full shadow-md ring-2 ring-white">
                          {person.photo ? (
                            <img
                              src={
                                person.photo.startsWith("http")
                                  ? person.photo
                                  : `${apiUrl}/${person.photo}`
                              }
                              alt="Profile"
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
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
                          <h4 className="text-sm font-semibold text-gray-900 truncate transition-colors duration-200 group-hover:text-blue-600">
                            {person.name}
                          </h4>
                        </Link>
                        <p className="text-gray-600 text-xs truncate mt-0.5">
                          {person.headline}
                        </p>
                      </div>

                      {/* Connect Button */}
                      <button
                        className="flex items-center justify-center w-8 h-8 text-blue-600 transition-all duration-200 rounded-full bg-blue-50 hover:bg-blue-100 hover:scale-110 group-hover:shadow-md"
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
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="mb-2">
                <img src="/" alt="Premium" className="w-full rounded" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-center text-yellow-500">
                EVOConnect Premium
              </h3>
              <p className="mb-3 text-xs text-center text-gray-600">
                Grow & nurture your network
              </p>
              <button className="w-full border border-yellow-500 text-yellow-500 py-1.5 rounded-lg font-medium text-xs">
                ACTIVATE
              </button>
            </div>

            {/* Jobs */}
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Similar Jobs</h3>
                <button
                  onClick={fetchSimilarJobs}
                  disabled={loadingJobs}
                  className="text-xs text-blue-600 transition-colors duration-200 hover:text-blue-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${loadingJobs ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {loadingJobs ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : similarJobs.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-gray-500">No jobs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {similarJobs.map((job, index) => (
                    <div
                      key={job.id || index}
                      className="p-3 bg-gray-100 rounded-lg"
                    >
                      <div className="flex justify-between mb-1">
                        <h4 className="text-sm font-semibold truncate">
                          {job.title || "Job Title"}
                        </h4>
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 p-1 bg-white rounded-full">
                          {job.company?.logo ? (
                            <img
                              src={
                                job.company.logo.startsWith("http")
                                  ? job.company.logo
                                  : `${apiUrl}/${job.company.logo}`
                              }
                              alt="Company Logo"
                              className="object-cover w-full h-full rounded-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                              <span className="text-xs font-bold text-gray-600">
                                {job.company?.name
                                  ? job.company.name.charAt(0).toUpperCase()
                                  : "C"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-blue-500 truncate">
                        {job.company?.name || "Company Name"}
                      </p>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin size={12} className="mr-1" />
                        <span className="truncate">
                          {job.location || "Location not specified"}
                        </span>
                      </div>
                      {(job.min_salary || job.max_salary) && (
                        <div className="mt-1 text-xs font-medium text-green-600">
                          {job.min_salary && job.max_salary
                            ? `$${job.min_salary} - $${job.max_salary}`
                            : job.min_salary
                            ? `From $${job.min_salary}`
                            : `Up to $${job.max_salary}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Main Comment Modal */}
          <div
            className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col shadow-xl"
            style={{ zIndex: showReportModal ? 40 : 50 }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
              <button
                onClick={closeCommentModal}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comments Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {loadingComments[currentPostId] ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : !Array.isArray(comments[currentPostId]) ||
                comments[currentPostId].length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No comments yet.</p>
                  <p className="mt-1 text-sm text-gray-400">
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
                                className="object-cover w-10 h-10 transition-colors border-2 border-white rounded-full hover:border-blue-200"
                                src={
                                  commentUser.profile_photo.startsWith("http")
                                    ? commentUser.profile_photo
                                    : `${apiUrl}/${commentUser.profile_photo}`
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
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 border-2 border-white rounded-full">
                              <span className="text-sm font-medium text-gray-600">
                                {getInitials(commentUser.name)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          <div className="p-3 rounded-lg bg-gray-50">
                            {/* User Info */}
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/user-profile/${commentUser.username}`}
                                className="text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline"
                              >
                                {commentUser.name}
                              </Link>

                              {/* Comment Actions */}
                              <div className="flex items-center space-x-2 transition-opacity opacity-0 group-hover:opacity-100">
                                {comment.user?.id === user.id && (
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

                                {comment.user?.id !== user.id && (
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
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  value={commentText}
                                  onChange={(e) =>
                                    setCommentText(e.target.value)
                                  }
                                  autoFocus
                                />
                                <button
                                  className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                                  onClick={() =>
                                    handleUpdateComment(comment.id)
                                  }
                                >
                                  Update
                                </button>
                                <button
                                  className="px-3 py-1 text-sm text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setCommentText("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-gray-700">
                                {comment.content}
                              </p>
                            )}
                          </div>

                          {/* Comment Meta */}
                          <div className="flex items-center justify-between px-1 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatPostTime(comment.created_at)}
                            </span>

                            <div className="flex items-center space-x-4">
                              <button
                                className="text-xs font-medium text-blue-500 hover:text-blue-700"
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
                            <div className="flex gap-2 mt-3">
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder={`Reply to ${
                                  replyToUser?.name || comment.user.name
                                }...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                              />
                              <button
                                className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
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
                            <div className="pl-4 mt-3 ml-4 space-y-3 border-l-2 border-gray-200">
                              {loadingComments[comment.id] ? (
                                <div className="flex justify-center py-2">
                                  <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
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
                                              className="object-cover w-8 h-8 transition-colors border-2 border-white rounded-full hover:border-blue-200"
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
                                          <div className="flex items-center justify-center w-8 h-8 bg-gray-200 border-2 border-white rounded-full">
                                            <span className="text-xs font-medium text-gray-600">
                                              {getInitials(reply.user?.name)}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Reply Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="p-2 rounded-lg bg-gray-50">
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
                                                  <span className="flex items-center ml-1 text-xs text-gray-500">
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
                                            <div className="flex items-center space-x-2 transition-opacity opacity-0 group-hover:opacity-100">
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
                                            <div className="flex gap-2 mt-1">
                                              <input
                                                type="text"
                                                className="flex-1 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                value={replyText}
                                                onChange={(e) =>
                                                  setReplyText(e.target.value)
                                                }
                                                autoFocus
                                              />
                                              <button
                                                className="px-2 py-1 text-xs text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                                                onClick={() =>
                                                  handleUpdateReply(reply.id)
                                                }
                                              >
                                                Update
                                              </button>
                                              <button
                                                className="px-2 py-1 text-xs text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                                                onClick={() => {
                                                  setEditingReplyId(null);
                                                  setReplyText("");
                                                }}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          ) : (
                                            <p className="mt-1 text-xs text-gray-700">
                                              {reply.content}
                                            </p>
                                          )}
                                        </div>

                                        {/* Reply Meta */}
                                        <div className="flex items-center justify-between px-1 mt-1">
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
                                          <div className="flex gap-2 mt-3">
                                            <input
                                              type="text"
                                              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                                              className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
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

            {/* Add Comment Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {user.photo ? (
                    <img
                      className="object-cover w-8 h-8 rounded-full"
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
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
                      <span className="text-xs font-bold text-gray-600">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  {commentError && (
                    <p className="mt-1 text-xs text-red-500">{commentError}</p>
                  )}
                </div>

                <button
                  className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                  onClick={handleAddComment}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCommentOptions && selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xs mx-4 bg-white rounded-lg">
            <div className="p-4">
              <h3 className="mb-3 text-lg font-medium">Comment Options</h3>

              {selectedComment.user?.id === user.id ? (
                <>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
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
                    className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
                    onClick={() => handleDeleteComment(selectedComment.id)}
                  >
                    <X size={16} className="mr-2" />
                    Delete Comment
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
                  onClick={() => {
                    if (selectedComment.user?.id) {
                      // Handle report comment
                    }
                    setShowCommentOptions(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 mr-2"
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

            <div className="p-3 border-t">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xs mx-4 bg-white rounded-lg">
            <div className="p-4">
              <h3 className="mb-3 text-lg font-medium">Reply Options</h3>

              {selectedReply.user?.id === user.id ? (
                <>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
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
                    className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
                    onClick={() => handleDeleteReply(selectedReply.id)}
                  >
                    <X size={16} className="mr-2" />
                    Delete Reply
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
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

            <div className="p-3 border-t">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Share this post</h3>
              <button
                onClick={handleCloseShareModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm text-gray-500">Copy link</p>
              <div className="flex items-center p-2 border rounded-lg">
                <input
                  type="text"
                  value={`${clientUrl}/post/${sharePostId}`}
                  readOnly
                  className="flex-grow mr-2 text-sm text-gray-700 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && (
                <p className="mt-1 text-xs text-green-600">
                  Link copied to clipboard!
                </p>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm text-gray-500">Share to</p>
              <div className="flex justify-around">
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center"
                >
                  <div className="p-3 mb-1 bg-green-100 rounded-full">
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
                  <div className="p-3 mb-1 bg-pink-100 rounded-full">
                    <Instagram size={24} className="text-pink-600" />
                  </div>
                  <span className="text-xs">Instagram</span>
                </button>

                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center"
                >
                  <div className="p-3 mb-1 bg-blue-100 rounded-full">
                    <Twitter size={24} className="text-blue-600" />
                  </div>
                  <span className="text-xs">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Opsi Post */}
      {isPostOptionsOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xs mx-4 bg-white rounded-lg">
            <div className="p-4">
              <h3 className="mb-3 text-lg font-medium">Post Options</h3>

              {/* Options for user's own post */}
              {selectedPost.user_id === user.id ? (
                <>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                    onClick={() => {
                      handleEditPost(selectedPost);
                      handleClosePostOptions();
                    }}
                  >
                    <SquarePen size={16} className="mr-2" />
                    Edit Post
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
                    onClick={() => {
                      handleDeletePost(selectedPost.id);
                      handleClosePostOptions();
                    }}
                  >
                    <X size={16} className="mr-2" />
                    Delete Post
                  </button>
                </>
              ) : (
                <>
                  {/* Options for other user's post */}
                  <button
                    className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                    onClick={() => {
                      // handleReportPost(selectedPost.id);
                      handleClosePostOptions();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 mr-2"
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
                    (conn) => conn.id === selectedPost.user_id
                  ) && (
                    <button
                      className="flex items-center w-full px-3 py-2 text-left text-blue-500 rounded-md hover:bg-gray-100"
                      onClick={() => {
                        handleConnectWithUser(selectedPost.user_id);
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
            <div className="p-3 border-t">
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

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-medium">Edit Post</h3>

            {/* Tabs for edit modal */}
            <div className="flex pb-2 mb-4 space-x-1 border-b">
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
                className="w-full p-2 mb-4 border rounded-lg"
                rows="4"
                value={editPostContent.replace(/<[^>]+>/g, "")}
                onChange={(e) => setEditPostContent(e.target.value)}
              />
            ) : (
              <div className="mb-4 overflow-hidden text-black border rounded-md ck-editor-mode">
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
                <h4 className="mb-2 text-sm font-medium">Current Images</h4>
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
                        className="object-cover w-full h-24 border rounded-md"
                        alt={`Current image ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                        }}
                      />
                      <button
                        className="absolute p-1 text-white rounded-full top-1 right-1 bg-black/50"
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
                <h4 className="mb-2 text-sm font-medium">New Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {newEditImages.map((img, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={img.preview}
                        className="object-cover w-full h-24 border rounded-md"
                        alt={`New image ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                        }}
                      />
                      <button
                        className="absolute p-1 text-white rounded-full top-1 right-1 bg-black/50"
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
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
              >
                <ImageIcon size={14} className="mr-2" />
                Add Images
              </label>
            </div>

            {/* Visibility Options */}
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium">Visibility</h4>
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
                className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg"
                onClick={handleUpdatePost}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          {showImageModal && selectedPostForImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
              <div className="relative w-full max-w-4xl mx-4">
                <button
                  className="absolute z-10 p-1 text-white bg-black bg-opacity-50 rounded-full top-2 md:top-4 right-2 md:right-4 md:p-2"
                  onClick={closeImageModal}
                >
                  <X size={20} />
                </button>
                <div className="relative">
                  <img
                    src={selectedPostForImage.images[selectedImageIndex]}
                    className="w-full max-h-[80vh] object-contain"
                    alt={`Post ${selectedImageIndex + 1}`}
                  />
                  {selectedPostForImage.images.length > 1 && (
                    <>
                      <button
                        className="absolute p-1 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full left-2 md:left-4 top-1/2 md:p-2"
                        onClick={() => navigateImage("prev")}
                      >
                        <svg
                          className="w-4 h-4 md:w-6 md:h-6"
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
                        className="absolute p-1 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full right-2 md:right-4 top-1/2 md:p-2"
                        onClick={() => navigateImage("next")}
                      >
                        <svg
                          className="w-4 h-4 md:w-6 md:h-6"
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
                <div className="absolute left-0 right-0 flex justify-center bottom-2 md:bottom-4">
                  <div className="flex space-x-1 md:space-x-2">
                    {selectedPostForImage.images.map((_, index) => (
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
          setAlertInfo={setAlertInfo}
        />
      )}
    </div>
  );
};

export default PostPage;
