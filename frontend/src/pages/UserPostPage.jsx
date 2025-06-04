import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Users,
  Facebook,
  Twitter as TwitterIcon,
  Linkedin,
  Github,
  Instagram as InstagramIcon,
  MapPin,
  RefreshCw,
  UserPlus,
  Ellipsis,
  Globe,
  SquarePen,
  NotebookPen,
  ImageIcon,
  LockKeyhole,
  MessageCircle,
  Share2,
  ThumbsUp,
  Check,
  X,
  Copy,
  Instagram,
  Twitter,
  MoreHorizontal,
  TriangleAlert,
  MoreVertical,
} from "lucide-react";
import Case from "../components/Case.jsx";
import axios from "axios";
import { toast } from "sonner";
import dayjs from "dayjs";

const PostPage = () => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const clientUrl =
    import.meta.env.VITE_APP_CLIENT_URL || "http://localhost:5173";
  const { username } = useParams();

  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [sharePostId, setSharePostId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isPostOptionsOpen, setIsPostOptionsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [postVisibility, setPostVisibility] = useState("public");
  const [customReason, setCustomReason] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [allReplies, setAllReplies] = useState({});
  const [allRepliesLoaded, setAllRepliesLoaded] = useState({});
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [loadingComments, setLoadingComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [reportTargetUserId, setReportTargetUserId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [user, setUser] = useState({
    id: "",
    name: "",
    headline: "",
    photo: null,
    skills: [],
    socials: {},
  });

  const socialPlatforms = [
    {
      name: "instagram",
      icon: <InstagramIcon className="w-5 h-5" />,
      color: "text-pink-500",
    },
    {
      name: "facebook",
      icon: <Facebook className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      name: "twitter",
      icon: <TwitterIcon className="w-5 h-5" />,
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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserId(parsedUser.id);
    }
  }, []);

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

    if (diffInSeconds < 0) return "Just now";

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return postTime.format("MMM D, YYYY");
  };

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
    } finally {
      setLoadingSuggested(false);
    }
  };

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
      toast.error("Failed to load connections");
    } finally {
      setIsLoading(false);
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
      isLiked: post.is_liked || false,
      likes_count: post.likes_count || 0,
      visibility: post.visibility || "public",
      group: post.group || null, // Make sure group data is included
      user: post.user || {
        id: post.user_id,
        name: "Unknown User",
        headline: "",
        photo: null
      }
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
      const response = await axios.get(
        apiUrl + "/api/user-profile/" + username,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const socialsObject = {};
      if (
        response.data.data.socials &&
        Array.isArray(response.data.data.socials)
      ) {
        response.data.data.socials.forEach((social) => {
          socialsObject[social.platform] = social.username;
        });
      }

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
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user.id) {
      fetchConnections();
      fetchUserPosts();
      fetchSuggestedConnections();
    }
  }, [user.id]);

  const handleOpenPostOptions = (post) => {
    setSelectedPost(post);
    setIsPostOptionsOpen(true);
  };

  const handleClosePostOptions = () => {
    setIsPostOptionsOpen(false);
    setSelectedPost(null);
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

  const handleReportClick = (targetUserId, targetType, id) => {
    // Validate parameters first
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

    // Set report target information
    setReportTargetUserId(targetUserId);

    if (targetType === "comment") {
      setSelectedComment({
        id: id,
        userId: targetUserId,
        targetType: targetType,
      });
      setSelectedPostId(null); // Clear post ID when reporting a comment
    } else if (targetType === "post") {
      setSelectedPostId(id);
      setSelectedComment(null); // Clear comment data when reporting a post
    }

    setShowReportModal(true);
    setShowPostOptions(false);
    setShowCommentOptions(false);
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
      .slice(0, 3)
      .map((word) => word[0].toUpperCase())
      .join("");

    return initials || "UU";
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const isCurrentUserReply = selectedReply?.user?.id === currentUserId;

  return (
    <div className="bg-[#EDF3F7] min-h-screen">
      {/* Navbar would be here if you have one */}
      <Case />

      {/* Content */}
      <div className="w-full mx-auto py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Narrower */}
          <div className="w-full md:w-1/4 lg:w-1/5 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
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
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="font-bold text-xl mt-4">{user.name}</h2>
              <p className="text-base text-gray-500">
                {user.headline || "No headline yet"}
              </p>

              <div className="mt-5 space-y-2 text-left">
                <Link
                  to={`/list-connection/${username}`}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <span className="flex items-center gap-2 text-base">
                    <Users size={18} /> Connections
                  </span>
                  <span className="font-bold text-lg">{connectionsCount}</span>
                </Link>
              </div>

              <button className="text-blue-600 text-sm mt-5">Log Out</button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-base">Skills</h3>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500 mt-1">
                  No skills added yet
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-base mb-2">Social Media</h3>
              {Object.keys(user.socials).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(user.socials).map(([platform, username]) => {
                    const platformInfo = socialPlatforms.find(
                      (p) => p.name === platform
                    );
                    return (
                      <div
                        key={platform}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
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
            <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border rounded-lg shadow-sm p-4 mb-4"
                  >
                    {/* Header */}
                     <div className="border-b border-gray-200 pb-3 mb-3 relative">
                                          {/* Group info - as background element */}
                                          {post.group && (
                                            <Link to={`/groups/${post.group.id}`}>
                                              {/* Group photo */}
                                              <div className="absolute left-0 top-0 bottom-2 z-0">
                                                {post.group.image ? (
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
                                                  <div className="rounded-lg border-2 border-white w-12 h-12 bg-gray-300 flex items-center justify-center shadow-md">
                                                    <span className="text-xs font-bold text-gray-600">
                                                      {getInitials(post.group?.name)}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </Link>
                                          )}
                    
                                          <div className="flex justify-between items-start mb-2">
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
                                                        e.target.parentElement.classList.add(
                                                          "bg-gray-300"
                                                        );
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
                                                    fetchUserProfile(
                                                      post.user.username,
                                                      post.user.id
                                                    )
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
                    <div className="mt-3 text-sm">
                      <div
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      {post.images && renderPhotoGrid(post.images)}
                    </div>

                    {/* Footer */}
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
                  </div>
                ))
              ) : (
                <div className="bg-white border rounded-lg shadow-sm p-4 mb-4 text-center">
                  <p className="text-gray-500">No posts yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Narrower */}
          <div className="w-full md:w-1/4 lg:w-1/5 space-y-4">
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
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-2">
                <img src="/" alt="Premium" className="w-full rounded" />
              </div>
              <h3 className="font-bold text-sm text-yellow-500 text-center mb-1">
                EVOConnect Premium
              </h3>
              <p className="text-gray-600 text-xs text-center mb-3">
                Grow & nurture your network
              </p>
              <button className="w-full border border-yellow-500 text-yellow-500 py-1.5 rounded-lg font-medium text-xs">
                ACTIVATE
              </button>
            </div>

            {/* Jobs */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-sm mb-3">Jobs</h3>
              <div className="mb-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-sm">Product Director</h3>
                    <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
                      <img
                        src="/api/placeholder/24/24"
                        alt="Company Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-blue-500 text-sm">Spotify Inc.</p>
                  <div className="flex items-center text-gray-600 text-xs">
                    <MapPin size={12} className="mr-1" />
                    <span>India, Punjab</span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white"></div>
                      <div className="w-5 h-5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-white"></div>
                    </div>
                    <span className="text-gray-600 text-xs ml-2">
                      18 connections
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Modal Opsi Post */}
      {/* Modal Opsi Post */}
      {isPostOptionsOpen && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xs mx-4">
            <div className="p-4">
              <h3 className="font-medium text-lg mb-3">Post Options</h3>

              {/* Options for user's own post */}
              {selectedPost.user_id === currentUserId ? (
                <>
                  <button
                    className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                    onClick={() => {
                      handleEditPost(selectedPost);
                      handleClosePostOptions();
                    }}
                  >
                    <SquarePen size={16} className="mr-2" />
                    Edit Post
                  </button>
                  <button
                    className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
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
                    className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                    onClick={() => {
                      setShowReportModal(true);
                      handleClosePostOptions();
                    }}
                  >
                    <TriangleAlert size={16} className="mr-2" />
                    Report Post
                  </button>
                  {!connections.some(
                    (conn) => conn.id === selectedPost.user_id
                  ) && (
                    <button
                      className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-blue-500"
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

      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
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
                                  e.target.parentElement.classList.add(
                                    "bg-gray-300"
                                  );
                                }}
                              />
                            </Link>
                          ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full border-2 border-white">
                              <span className="text-sm font-medium text-gray-600">
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
                                placeholder={`Reply to ${
                                  replyToUser?.name || comment.user.name
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
                                          <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full border-2 border-white">
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
                                              {reply.user?.id ===
                                                currentUserId && (
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

                                              {reply.user?.id !==
                                                currentUserId && (
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
      )}

      {showCommentOptions && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xs mx-4">
            <div className="p-4">
              <h3 className="font-medium text-lg mb-3">Comment Options</h3>

              {selectedComment.user?.id === user.id ? (
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
                      // Handle report comment
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

              {/* Perbaikan: Gunakan currentUserId untuk memeriksa kepemilikan reply */}
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
      )}

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

      {showCommentOptions && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xs mx-4">
            <div className="p-4">
              <h3 className="font-medium text-lg mb-3">Comment Options</h3>

              {selectedComment.user?.id === user.id ? (
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
                      // Handle report comment
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

              {/* Perbaikan: Gunakan currentUserId untuk memeriksa kepemilikan reply */}
              {selectedReply.user?.id === currentUserId ? (
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
          targetUserId={selectedComment?.user?.id || selectedPost?.user?.id}
          selectedPostId={selectedPostId || selectedComment?.id}
          selectedComment={selectedComment}
          setAlertInfo={setAlertInfo}
        />
      )}
    </div>
  );
};

export default PostPage;
