import { useState, useEffect } from "react";
import Case from "../components/Case";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Alert from "../components/Auth/alert";
import {
  MoreHorizontal,
  Image,
  Video,
  ThumbsUp,
  MessageCircle,
  Share,
  ArrowRight,
  ArrowDown,
  X,
  Copy,
  Check,
  UserPlus,
  UserMinus,
  Share2,
  SquarePen,
  Pencil,
  ChevronDown,
  ChevronUp,
  Pin,
  TriangleAlert,
} from "lucide-react";
import GroupCover from "../assets/img/cover.jpg";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime"; // <- Tambahkan ini

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export default function GroupPage() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const clientUrl =
    import.meta.env.VITE_APP_CLIENT_URL || "http://localhost:5173";
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [postContent, setPostContent] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [invitedUserName, setInvitedUserName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { groupId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentError, setCommentError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentModalPostId, setCommentModalPostId] = useState(null);
  const [sharePostId, setSharePostId] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [isLoadingPendingPosts, setIsLoadingPendingPosts] = useState(false);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [isLoadingPinnedPosts, setIsLoadingPinnedPosts] = useState(false);
  const [memberPendingPosts, setMemberPendingPosts] = useState([]);
  const [isLoadingMemberPendingPosts, setIsLoadingMemberPendingPosts] =
    useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [selectedReply, setSelectedReply] = useState(null);

  const [user, setUser] = useState({
    name: "",
    photo: "",
    following_count: 42,
  });
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [allReplies, setAllReplies] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [showcaseReplies, setShowcaseReplies] = useState([]);
  const [showShowcase, setShowShowcase] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postError, setPostError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openPostId, setOpenPostId] = useState(null);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostId, setEditPostId] = useState(null);
  const [editPostImages, setEditPostImages] = useState([]);
  const [editPostImagePreviews, setEditPostImagePreviews] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTargetUserId, setReportTargetUserId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = useState(false);

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    rule: "",
    privacy_level: "public",
    invite_policy: "all_members",
    post_approval: false,
    image: null,
    imagePreview: "",
  });

  // Add this function to fetch join requests
  const fetchJoinRequests = async () => {
    if (!isCurrentUserAdmin) return;

    setIsLoadingJoinRequests(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/join-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Format the join requests data
      const formattedRequests = response.data.data.map((request) => ({
        id: request.id,
        user: request.user || {
          id: request.user_id,
          name: "Unknown User",
          photo: null,
          username: "unknown",
        },
        created_at: request.created_at,
      }));

      setJoinRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    } finally {
      setIsLoadingJoinRequests(false);
    }
  };

  // Add this function to handle approving join requests
  const handleApproveJoinRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/api/join-requests/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the approved request from the list
        setJoinRequests(
          joinRequests.filter((request) => request.id !== requestId)
        );
        showAlert("success", "Join request approved successfully");

        // Update group members count
        setGroup((prevGroup) => ({
          ...prevGroup,
          members_count: (prevGroup.members_count || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Error approving join request:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to approve join request"
      );
    }
  };

  // Add this function to handle rejecting join requests
  const handleRejectJoinRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/api/join-requests/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the rejected request from the list
        setJoinRequests(
          joinRequests.filter((request) => request.id !== requestId)
        );
        showAlert("success", "Join request rejected successfully");
      }
    } catch (error) {
      console.error("Error rejecting join request:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to reject join request"
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

  const showAlert = (type, message) => {
    setAlertInfo({
      show: true,
      type,
      message,
    });
    setTimeout(() => {
      setAlertInfo((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      name: group.name,
      description: group.description,
      rule: group.rule,
      privacy_level: group.privacy_level || "public",
      invite_policy: group.invite_policy || "all_members",
      post_approval: group.post_approval === true, // Explicitly convert to boolean
      image: null,
      imagePreview: group.image ? `${apiUrl}/${group.image}` : "",
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Add all form fields to FormData
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("rule", editFormData.rule);
      formData.append("privacy_level", editFormData.privacy_level);
      formData.append("invite_policy", editFormData.invite_policy);
      formData.append("post_approval", editFormData.post_approval); // Pastikan ini ditambahkan

      if (editFormData.image) {
        formData.append("image", editFormData.image);
      }

      const response = await axios.put(
        `${apiUrl}/api/groups/${groupId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.data) {
        setGroup(response.data.data);
        setShowEditModal(false);
        showAlert("success", "Group updated successfully");
        fetchGroupData();
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      let errorMessage = "Failed to update group";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Group not found (404)";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      showAlert("error", errorMessage);
    }
  };
  const openImageModal = (post, index) => {
    // Ensure post.images is an array of full URLs
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

  const renderPhotoGrid = (images) => {
    if (!images || !Array.isArray(images)) return null;

    const validImages = images
      .map((img) => {
        if (typeof img === "string") {
          return img.startsWith("http") ? img : `${apiUrl}/${img}`;
        }
        return "";
      })
      .filter((img) => img);

    if (validImages.length === 0) return null;

    if (validImages.length === 1) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <img
            src={validImages[0]}
            className="object-cover w-full h-48 cursor-pointer md:h-64 lg:h-96"
            alt="Post"
            onClick={() => openImageModal({ images: validImages }, 0)}
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
                  onClick={() => openImageModal({ images: validImages }, index)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (validImages.length === 3) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            <div className="relative row-span-2 aspect-square">
              <img
                src={validImages[0]}
                className="object-cover w-full h-full cursor-pointer"
                alt="Post 1"
                onClick={() => openImageModal({ images: validImages }, 0)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={validImages[1]}
                className="object-cover w-full h-full cursor-pointer"
                alt="Post 2"
                onClick={() => openImageModal({ images: validImages }, 1)}
              />
            </div>
            <div className="relative aspect-square">
              <img
                src={validImages[2]}
                className="object-cover w-full h-full cursor-pointer"
                alt="Post 3"
                onClick={() => openImageModal({ images: validImages }, 2)}
              />
            </div>
          </div>
        </div>
      );
    } else if (validImages.length >= 4) {
      return (
        <div className="mb-3 overflow-hidden border rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            {validImages.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={photo}
                  className="object-cover w-full h-full cursor-pointer"
                  alt={`Post ${index + 1}`}
                  onClick={() => openImageModal({ images: validImages }, index)}
                />
                {index === 3 && validImages.length > 4 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white bg-black bg-opacity-50 cursor-pointer"
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
    return null;
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setCurrentUserId(userData.id);
    }
  }, []);

  // Like/Unlike post handler
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

      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to like post. Please try again.",
      });
    }
  };

  // ...existing code...

  const handleDeleteReply = async (replyId) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found");
      }

      // Cari parent commentId dari replyId
      let parentCommentId = null;
      Object.keys(allReplies).forEach((commentId) => {
        if (allReplies[commentId]?.some((reply) => reply.id === replyId)) {
          parentCommentId = commentId;
        }
      });

      if (!parentCommentId) {
        showAlert("error", "Parent comment not found");
        return;
      }

      // Optimistic update: hapus reply dari state
      setAllReplies((prev) => ({
        ...prev,
        [parentCommentId]: prev[parentCommentId].filter(
          (reply) => reply.id !== replyId
        ),
      }));

      // Update repliesCount pada comment
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

      // Request ke backend
      await axios.delete(`${apiUrl}/api/comments/${replyId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setShowReplyOptions(false);
      setSelectedReply(null);
      showAlert("success", "Reply deleted successfully!");
    } catch (error) {
      console.error("Failed to delete reply:", error);
      showAlert(
        "error",
        error.response?.data?.message ||
          "Failed to delete reply. Please try again."
      );
    }
  };

  // ...existing code...

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      setCommentError(null);

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/post-comments/${postId}?limit=10&offset=0&includeReplies=true`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
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

      setAllReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((commentId) => {
          updated[commentId] = updated[commentId].map((reply) =>
            reply.id === replyId ? { ...reply, content: replyText } : reply
          );
        });
        return updated;
      });

      setEditingReplyId(null);
      setReplyText("");
      showAlert("success", "Reply updated successfully");
    } catch (error) {
      console.error("Failed to update reply:", error);
      showAlert("error", "Failed to update reply. Please try again.");
    }
  };

  // Add comment handler
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    try {
      const userToken = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/post-comments/${postId}`,
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
          if (post.id === postId) {
            return {
              ...post,
              comments_count: (post.comments_count || 0) + 1,
            };
          }
          return post;
        })
      );

      fetchComments(postId);
      setCommentText("");
      showAlert("success", "Comment added successfully");
    } catch (error) {
      showAlert("error", "Failed to add comment");
      setCommentError(
        error.response?.data?.message ||
          "Failed to add comment. Please try again."
      );
    }
  };

  // Open comment modal
  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setCommentModalPostId(postId);
    setShowCommentModal(true);
    fetchComments(postId);
  };

  // Close comment modal
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCommentModalPostId(null);
    setCommentText("");
  };

  const handleOpenCommentOptions = (comment, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedComment(comment);
    setShowCommentOptions(true);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found");
      }

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
        setComments((prev) => {
          const updatedComments = { ...prev };
          if (updatedComments[commentModalPostId]) {
            updatedComments[commentModalPostId] = updatedComments[
              commentModalPostId
            ].filter((comment) => comment.id !== commentId);
          }
          return updatedComments;
        });

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === commentModalPostId) {
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
        showAlert("success", "Comment deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      let errorMessage = "Failed to delete comment. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      showAlert("error", errorMessage);
    }
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

      setComments((prev) => {
        const updatedComments = { ...prev };
        if (updatedComments[commentModalPostId]) {
          updatedComments[commentModalPostId] = updatedComments[
            commentModalPostId
          ].map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                content: commentText,
              };
            }
            return comment;
          });
        }
        return updatedComments;
      });

      setEditingCommentId(null);
      setCommentText("");
      showAlert("success", "Comment updated successfully");
    } catch (error) {
      console.error("Failed to update comment:", error);
      showAlert("error", "Failed to update comment. Please try again.");
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

      const replies = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      setShowcaseReplies(replies);
      setShowShowcase(true);
    } catch (error) {
      console.error("Failed to load replies:", error);
      showAlert("error", "Failed to load replies. Please try again.");
      setShowcaseReplies([]);
    }
  };

  const renderShowcase = () => {
    if (!showShowcase) return null;

    const repliesToRender = Array.isArray(showcaseReplies)
      ? showcaseReplies
      : [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">All Replies</h3>
            <button onClick={() => setShowShowcase(false)}>
              <X size={20} />
            </button>
          </div>

          {repliesToRender.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No replies yet.</p>
          ) : (
            <div className="space-y-3">
              {repliesToRender.map((reply) => (
                <div key={reply.id} className="flex items-start pb-3 border-b">
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

  const renderCommentOptionsModal = () => {
    if (!showCommentOptions || !selectedComment) return null;

    const isCurrentUserComment = selectedComment?.user?.id === currentUserId;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-xs mx-4 bg-white rounded-lg">
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Comment Options</h3>

            {isCurrentUserComment ? (
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
                  handleReportClick(
                    selectedComment.user?.id,
                    "comment",
                    selectedComment.id
                  );
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
    );
  };

  // Share post handlers
  const handleOpenShareModal = (postId) => {
    setSharePostId(postId);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharePostId(null);
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

  // Post options handlers
  const handleOpenPostOptions = (postId) => {
    setSelectedPostId(postId);
    setShowPostOptions(true);
  };

  const handleClosePostOptions = () => {
    setShowPostOptions(false);
    setSelectedPostId(null);
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
      showAlert("success", "Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete post:", error);
      showAlert("error", "Failed to delete post. Please try again.");
    }
  };

  // Format post time
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

  const renderPostActions = (post) => (
    <div>
      {/* Likes & Comments Info */}
      <div className="flex items-center justify-between px-4 py-1 space-x-4 text-xs text-gray-500">
        <div className="flex items-center pt-1 space-x-1">
          <span className="flex text-black">
            <ThumbsUp size={14} className="mr-1" /> {post.likes_count || 0}
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
  );

  // Update the post rendering in the return statement to include options button
  const renderPost = (post) => (
    <div key={post.id} className="relative p-3 border-b">
      {post.is_pinned && (
        <div className="flex items-center px-4 py-2 text-xs text-blue-600 rounded ">
          <Pin size={14} className="mr-1" />
          Pinned
        </div>
      )}
      <div className="flex items-center mb-3">
        <Link
          to={`/user-profile/${post.user?.username || "unknown"}`}
          className="relative w-10 h-10 overflow-hidden rounded-full"
        >
          {post.user?.photo ? (
            <img
              className="object-cover w-full h-full"
              src={
                post.user.photo.startsWith("http")
                  ? post.user.photo
                  : `${apiUrl}/${post.user.photo}`
              }
              alt={post.user?.name || "Unknown user"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
                e.target.parentElement.classList.add("bg-gray-300");
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-300">
              <span className="text-sm font-bold text-gray-600">
                {getInitials(post.user?.name || "Unknown")}
              </span>
            </div>
          )}
        </Link>

        <div className="ml-3">
          <h6 className="font-bold">{post.user?.name || "Unknown user"}</h6>
          <small className="text-gray-500">
            {formatPostTime(post.created_at)}
          </small>
        </div>

        <button
          className="ml-auto text-gray-500 hover:text-gray-700"
          onClick={() => handleOpenPostOptions(post.id)}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
      <p className="mb-3">{renderPostContent(post)}</p>

      {post.images && <>{renderPhotoGrid(post.images)}</>}

      {renderPostActions(post)}
    </div>
  );

  const fetchPinnedPosts = async () => {
    try {
      setIsLoadingPinnedPosts(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/pinned-posts?limit=3&include_likes=true`, // Tambahkan include_likes=true
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedPosts = response.data.data.map((post) => ({
        ...post,
        user: post.user || {
          name: "Unknown User",
          photo: null,
          username: "unknown",
        },
        images:
          post.images?.map((img) =>
            img.startsWith("http") ? img : `${apiUrl}/${img}`
          ) || [],
        isLiked: post.is_liked || false, // Pastikan status like diambil dari respons API
      }));

      setPinnedPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching pinned posts:", error);
    } finally {
      setIsLoadingPinnedPosts(false);
    }
  };

  const createGroupPost = async (postData) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("content", postData.content);

      // Pastikan ini adalah File object, bukan URL
      if (postData.imageFile) {
        formData.append("images", postData.imageFile); // Gunakan nama field yang sesuai dengan backend
      }

      const response = await axios.post(
        `${apiUrl}/api/groups/${groupId}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Pastikan response.data.data.images ada dan berupa array
      const newPost = {
        ...response.data.data,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          photo: user.photo,
        },
        images: response.data.data.images
          ? response.data.data.images.map((img) =>
              img.startsWith("http") ? img : `${apiUrl}/${img}`
            )
          : [],
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      };

      setPosts([newPost, ...posts]);
      return true;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
      return false;
    }
  };
  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.get(`${apiUrl}/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const groupData = response.data.data;
      setGroup(groupData);

      if (groupData.creator && user && groupData.creator.id === user.id) {
        setIsCurrentUserAdmin(true);
      } else if (groupData.members) {
        const currentUserMember = groupData.members.find(
          (member) => member.user.id === user.id && member.role === "admin"
        );
        setIsCurrentUserAdmin(!!currentUserMember);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to load group data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found for fetching members");
        return;
      }

      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/members`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
          timeout: 5000,
        }
      );

      const members = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setGroup((prevGroup) => ({
        ...prevGroup,
        members: members,
      }));

      setIsGroupMember(
        members.some((member) => member.user.id === currentUser?.id) || false
      );

      console.log(
        "Group members fetched successfully:",
        members.some((member) => member.user.id === currentUser?.id) || false
      );
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const fetchUserConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        console.warn("No authentication token or user data found");
        setConnections([
          {
            id: 1,
            user: {
              id: 3,
              name: "Alice Cooper",
              profile_photo: "/api/placeholder/40/40",
            },
          },
          {
            id: 2,
            user: {
              id: 4,
              name: "Bob Johnson",
              profile_photo: "/api/placeholder/40/40",
            },
          },
        ]);
        return;
      }

      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/connections`,
        {
          params: {
            limit: 10,
            offset: 0,
          },
          headers: {
            Authorization: "Bearer " + token,
          },
          timeout: 5000,
        }
      );

      setConnections(response.data.data.connections || []);
    } catch (error) {
      console.error("Error fetching user connections:", error);
      setConnections([
        {
          id: 1,
          user: {
            id: 3,
            name: "Alice Cooper",
            profile_photo: "/api/placeholder/40/40",
          },
        },
        {
          id: 2,
          user: {
            id: 4,
            name: "Bob Johnson",
            profile_photo: "/api/placeholder/40/40",
          },
        },
      ]);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
      fetchGroupPosts();
      fetchPinnedPosts();
      if (isGroupMember) {
        fetchMemberPendingPosts();
      }
      if (isCurrentUserAdmin) {
        fetchPendingPosts();
        fetchJoinRequests(); // Add this line
      }
    }
  }, [groupId, isGroupMember, isCurrentUserAdmin]);

  useEffect(() => {
    if (groupId && !isLoading && group) {
      fetchGroupMembers(groupId);
    }
  }, [groupId, isLoading]);

  const handleOpenInviteModal = () => {
    fetchUserConnections();
    setInviteModalOpen(true);
  };

  const handleUpdateMemberRole = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${apiUrl}/api/groups/${groupId}/members/${userId}/role`,
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setGroup((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.map((member) =>
          member.user.id === userId ? { ...member, role: selectedRole } : member
        ),
      }));

      showAlert("success", `Successfully updated user role to ${selectedRole}`);
      setShowRoleModal(false);
      setEditingMemberId(null);
    } catch (error) {
      console.error("Error updating member role:", error);
      showAlert(
        "error",
        error.response?.data?.message ||
          "Failed to update role. Please try again."
      );
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${apiUrl}/api/groups/${groupId}/members/${memberToRemove.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroup((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter(
          (m) => m.user.id !== memberToRemove.user.id
        ),
        members_count: prevGroup.members_count - 1,
      }));

      showAlert(
        "success",
        `Successfully removed ${memberToRemove.user.name} from the group`
      );
      setShowRemoveModal(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      showAlert(
        "error",
        error.response?.data?.message ||
          "Failed to remove member. Please try again."
      );
    }
  };

  const openRemoveConfirmation = (member) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(userData);
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate files
    const validFiles = files.filter((file) => {
      if (!file.type.match("image.*")) {
        toast.error(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    // Create preview URLs
    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...validFiles]);
  };

  // Update the removeImage function
  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmitReport = async (
    targetUserId,
    targetType,
    targetId,
    reason
  ) => {
    console.log("Submitting report with params:", {
      targetUserId,
      targetType,
      targetId,
      reason,
    });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/reports/${targetUserId}/${targetType}/${targetId}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlertInfo({
        show: true,
        type: "success",
        message: "Report submitted successfully",
      });

      // Reset state
      setShowReportModal(false);
      setSelectedReason("");
      setCustomReason("");
    } catch (error) {
      console.error("Failed to submit report:", error);
      setAlertInfo({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to submit report",
      });
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && imageFiles.length === 0) {
      toast.error("Post content or image is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();

      formData.append("content", postContent);

      // Append all image files
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(
        `${apiUrl}/api/groups/${groupId}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Reset form after successful post
      setPostContent("");
      setImagePreviews([]);
      setImageFiles([]);
      e.target.elements["post-image"].value = "";

      showAlert("success", "Post created successfully");
      fetchGroupPosts();
      fetchGroupPosts;
    } catch (error) {
      console.error("Error creating post:", error);
      showAlert("error", "Failed to create post");
    }
  };

  const handleJoinGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token || !user) {
        toast.error("You need to be logged in to join a group");
        return;
      }
      const response = await axios.post(
        `${apiUrl}/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setIsGroupMember(true);
        setGroup((prevGroup) => ({
          ...prevGroup,
          members: [
            ...(prevGroup.members || []),
            { user: { id: user.id, name: user.name, photo: user.photo } },
          ],
          members_count: (prevGroup.members_count || 0) + 1,
        }));
        showAlert("success", "Successfully joined the group");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      if (error.response) {
        showAlert(
          "error",
          error.response.data?.message || `Error: ${error.response.status}`
        );
      } else {
        showAlert("error", "Network error - please check your connection");
      }
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token || !user) {
        toast.error("You need to be logged in to leave a group");
        return;
      }
      const response = await axios.delete(
        `${apiUrl}/api/groups/${groupId}/leave`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setIsGroupMember(false);
        setGroup((prevGroup) => ({
          ...prevGroup,
          members: prevGroup.members.filter(
            (member) => member.user.id !== user.id
          ),
          members_count: (prevGroup.members_count || 0) - 1,
        }));
        showAlert("success", "Successfully left the group");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      if (error.response) {
        showAlert(
          "error",
          error.response.data?.message || `Error: ${error.response.status}`
        );
      } else {
        showAlert("error", "Network error - please check your connection");
      }
    }
  };

  const handleInvite = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!token || !currentUser) {
        toast.error("You need to be logged in to invite users");
        return;
      }

      if (!isCurrentUserAdmin) {
        toast.error("Only group admins can invite members");
        return;
      }

      const isAlreadyMember = group.members?.some(
        (member) => member.user.id === userId
      );
      if (isAlreadyMember) {
        toast.error("This user is already a group member");
        return;
      }

      const hasPendingInvite = group.invitations?.some(
        (inv) => inv.user_id === userId && inv.status === "pending"
      );
      if (hasPendingInvite) {
        toast.error("An invitation has already been sent to this user");
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/groups/${groupId}/invitations/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const invitedUser = connections.find(
        (conn) => conn.user.id === userId
      )?.user;
      if (invitedUser) {
        setInvitedUserName(invitedUser.name);
        setShowInviteSuccess(true);
        setTimeout(() => setShowInviteSuccess(false), 3000);

        setGroup((prevGroup) => ({
          ...prevGroup,
          invitations: [
            ...(prevGroup.invitations || []),
            {
              user_id: userId,
              status: "pending",
              user: invitedUser,
            },
          ],
        }));
      }
      showAlert("success", `Invitation sent to ${invitedUser?.name || "user"}`);
    } catch (error) {
      console.error("Error inviting user:", error);
      if (error.response) {
        if (
          error.response.status === 400 &&
          error.response.data?.data === "invitation already sent to this user"
        ) {
          showAlert(
            "error",
            "An invitation has already been sent to this user"
          );
        } else {
          showAlert(
            "error",
            error.response.data?.message || `Error: ${error.response.status}`
          );
        }
      } else {
        showAlert("error", "Network error - please check your connection");
      }
    }
  };

  const fetchPendingPosts = async () => {
    if (!isCurrentUserAdmin) return;

    setIsLoadingPendingPosts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/pending-posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure user data is properly formatted
      const formattedPosts = response.data.data.map((data) => ({
        ...data,
        user: data.post.user || {
          name: "Unknown User",
          photo: null,
          username: "unknown",
        },
        images:
          data.post.images?.map((img) =>
            img.startsWith("http") ? img : `${apiUrl}/${img}`
          ) || [],
        content: data.post.content || "",
      }));

      console.log("Pending posts fetched:", response.data.data[0]);

      setPendingPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
    } finally {
      setIsLoadingPendingPosts(false);
    }
  };
  const handleApprovePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/api/posts/${postId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Hapus dari pending posts admin
        setPendingPosts(pendingPosts.filter((post) => post.id !== postId));
        // Hapus dari pending posts member jika ada
        setMemberPendingPosts(
          memberPendingPosts.filter((post) => post.id !== postId)
        );
        showAlert("success", "Post approved successfully");
        fetchGroupPosts(); // Refresh the main posts list
      }
    } catch (error) {
      console.error("Error approving post:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to approve post"
      );
    }
  };
  const fetchGroupPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/posts`,
        {
          params: {
            limit: 10,
            offset: 0,
            exclude_pinned: true,
            include_likes: true, // Tambahkan parameter ini untuk mendapatkan status like
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedPosts = response.data.data.map((post) => ({
        ...post,
        images:
          post.images?.map((img) =>
            img.startsWith("http") ? img : `${apiUrl}/${img}`
          ) || [],
        user: post.user || {
          name: "Unknown User",
          initials: "UU",
          username: "unknown",
          photo: null,
          id: null,
        },
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        created_at: post.created_at || new Date().toISOString(),
        isLiked: post.is_liked || false, // Pastikan status like diambil dari respons API
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching group posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const renderPostContent = (post) => {
    if (!post.content) return null;

    const isExpanded = expandedPosts[post.id];
    const textContent = post.content.replace(/<[^>]+>/g, "");
    const shouldTruncate = textContent.length > 150;

    const toggleExpanded = () => {
      setExpandedPosts((prev) => ({
        ...prev,
        [post.id]: !prev[post.id],
      }));
    };

    if (!shouldTruncate || isExpanded) {
      return (
        <div>
          <div
            className="prose text-gray-700 max-w-none ck-content custom-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {shouldTruncate && (
            <button
              onClick={toggleExpanded}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Lihat Lebih Sedikit
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        <div
          className="prose text-gray-700 max-w-none ck-content custom-post-content"
          dangerouslySetInnerHTML={{
            __html: post.content.substring(0, 150) + "...",
          }}
        />
        <button
          onClick={toggleExpanded}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Lihat Selengkapnya
        </button>
      </div>
    );
  };

  const handleRejectPost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/api/posts/${postId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPendingPosts(pendingPosts.filter((post) => post.id !== postId));
        showAlert("success", "Post rejected successfully");
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to reject post"
      );
    }
  };
  const handlePinPost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/posts/${postId}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showAlert("success", "Post pinned successfully");

        // Hapus postingan yang dipin dari daftar postingan biasa
        setPosts(posts.filter((post) => post.id !== postId));

        // Set postingan yang dipin
        setPinnedPosts([response.data.data]);

        handleClosePostOptions();
      }
    } catch (error) {
      console.error("Error pinning post:", error);
      showAlert("error", error.response?.data?.message || "Failed to pin post");
    }
  };
  const handleUnpinPost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/posts/${postId}/unpin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showAlert("success", "Post unpinned successfully");

        // Tambahkan postingan yang diunpin ke daftar postingan biasa
        setPosts([response.data.data, ...posts]);

        // Hapus dari daftar pinned posts
        setPinnedPosts([]);

        handleClosePostOptions();
      }
    } catch (error) {
      console.error("Error unpinning post:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to unpin post"
      );
    }
  };

  const fetchMemberPendingPosts = async () => {
    if (!isGroupMember) return;

    setIsLoadingMemberPendingPosts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}/my-pending-posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter hanya yang statusnya masih pending
      const formattedPosts = response.data.data
        .filter((data) => data.status === "pending")
        .map((data) => ({
          ...data,
          user: data.post.user || {
            name: "Unknown User",
            photo: null,
            username: "unknown",
          },
          images:
            data.post.images?.map((img) =>
              img.startsWith("http") ? img : `${apiUrl}/${img}`
            ) || [],
          content: data.post.content || "",
        }));

      setMemberPendingPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching member pending posts:", error);
    } finally {
      setIsLoadingMemberPendingPosts(false);
    }
  };

  const handleEditPost = (postId) => {
    const post =
      posts.find((p) => p.id === postId) ||
      pinnedPosts.find((p) => p.id === postId);
    if (post) {
      setEditPostContent(post.content);
      setEditPostId(postId);
      setEditPostImagePreviews(
        post.images
          ? post.images.map((img) => ({
              url: img.startsWith("http") ? img : `${apiUrl}/${img}`,
              isExisting: true,
            }))
          : []
      );
      setEditPostImages([]);
      setShowEditPostModal(true);
    }
  };

  const handleEditPostImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.match("image.*")) {
        showAlert("error", `File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert("error", `Image ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }));

    setEditPostImagePreviews((prev) => [...prev, ...newPreviews]);
    setEditPostImages((prev) => [...prev, ...validFiles]);
  };

  const removeEditPostImage = (index) => {
    const preview = editPostImagePreviews[index];

    if (preview.isExisting) {
      // Mark existing image for removal
      setEditPostImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove new image
      setEditPostImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setEditPostImages((prev) =>
        prev.filter(
          (_, i) =>
            i !==
            editPostImages.findIndex(
              (_, idx) =>
                idx ===
                index - editPostImagePreviews.filter((p) => p.isExisting).length
            )
        )
      );
    }
  };

  const handleSaveEditedPost = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("content", editPostContent);
      formData.append("visibility", "public"); // Add the required visibility field

      // Add new images
      editPostImages.forEach((file) => {
        formData.append("images", file);
      });

      // Add existing images to keep
      const existingImages = editPostImagePreviews
        .filter((img) => img.isExisting)
        .map((img) => img.url.replace(`${apiUrl}/`, ""));

      if (existingImages.length > 0) {
        formData.append("existing_images", JSON.stringify(existingImages));
      }

      const response = await axios.put(
        `${apiUrl}/api/posts/${editPostId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update posts state with response data
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editPostId ? response.data.data : post
        )
      );

      // Update pinned posts if needed
      setPinnedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editPostId ? response.data.data : post
        )
      );

      setShowEditPostModal(false);
      showAlert("success", "Post updated successfully");
      fetchGroupPosts(); // Refresh posts to ensure data consistency
    } catch (error) {
      console.error("Error updating post:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to update post"
      );
    }
  };

  const handleReportClick = (targetUserId, targetType, id) => {
    console.log("Report clicked with params:", {
      targetUserId,
      targetType,
      id,
    });

    // Validasi parameter
    if (!targetUserId) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Cannot identify the content owner",
      });
      return;
    }

    // Set report target information
    setReportTargetUserId(targetUserId);
    setSelectedPostId(id);

    // Tampilkan modal report
    setShowReportModal(true);
  };

  // Fungsi untuk menangani submit report
  const handleReportSubmit = async (
    targetUserId,
    targetType,
    targetId,
    reason
  ) => {
    // Validasi semua parameter yang diperlukan
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

    // Mencegah melaporkan konten sendiri
    if (targetUserId === currentUserId) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "You cannot report your own content",
      });
      return;
    }

    try {
      const userToken = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/reports/${targetUserId}/${targetType}/${targetId}`,
        { reason, reporterId: currentUserId },
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

  // Komponen modal report
  const ReportModal = () => {
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
                const contentType = selectedComment ? "comment" : "post";
                const contentId = selectedComment
                  ? selectedComment.id
                  : selectedPostId;

                if (reportTargetUserId && contentId && reasonText) {
                  handleReportSubmit(
                    reportTargetUserId,
                    contentType,
                    contentId,
                    reasonText
                  );
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

  const renderReplyOptionsModal = () => {
    if (!showReplyOptions || !selectedReply) return null;

    const isCurrentUserReply = selectedReply?.user?.id === currentUserId;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-xs mx-4 bg-white rounded-lg">
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Reply Options</h3>
            {isCurrentUserReply ? (
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
    );
  };
  // ...existing code...

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded"
            onClick={() => fetchGroupData(groupId)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  return (
    <Case>
      <div className="flex flex-col px-4 py-2 md:flex-row bg-gray-50 md:px-6 lg:px-12 xl:px-32 md:py-4">
        <div className="fixed z-50 top-5 right-5">
          {alertInfo.show && (
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="container px-2 mx-auto sm:px-4">
          <div className="flex flex-col gap-4 mt-4 lg:flex-row">
            {/* Left Sidebar */}
            <aside className="lg:block lg:w-1/4">
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 text-center">
                  <div className="profile-photo-container">
                    {group.image ? (
                      <img
                        src={`${apiUrl}/${group.image}`}
                        alt="avatar"
                        className="object-cover w-20 h-20 mx-auto rounded-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-300">
                        <span className="text-sm font-bold text-gray-600">
                          {group.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <h5 className="mt-3 font-bold text-gray-800">
                      {group.name}
                    </h5>
                  </div>

                  <div className="p-2 mt-4">
                    <div className="flex items-center justify-between py-2">
                      <p className="text-gray-500">Members</p>
                      <p className="font-bold text-gray-800">
                        {group.members_count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Tambahkan bagian Rules di sini */}
                  {group.rule && (
                    <div className="p-2 mt-4 border-t">
                      <h6 className="mb-2 font-semibold text-left">
                        Group Rules
                      </h6>
                      <div className="text-sm text-left text-gray-600 whitespace-pre-line">
                        {group.rule}
                      </div>
                    </div>
                  )}

                  {/* Join button */}
                  {!isGroupMember && (
                    <button
                      className="w-full px-4 py-2 mt-3 text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={handleJoinGroup}
                    >
                      Join Group
                    </button>
                  )}

                  {isGroupMember && !isCurrentUserAdmin && (
                    <button
                      className="w-full px-4 py-2 mt-3 text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={handleLeaveGroup}
                    >
                      Leave Group
                    </button>
                  )}
                </div>
              </div>

              {isGroupMember && !isCurrentUserAdmin && (
                <div className="mt-4 mb-4 bg-white border rounded-lg shadow-sm">
                  <div className="p-3 border-b">
                    <h6 className="font-medium">Your Pending Posts</h6>
                  </div>
                  <div>
                    {isLoadingMemberPendingPosts ? (
                      <div className="p-4 text-center">
                        <div className="w-6 h-6 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : memberPendingPosts.length > 0 ? (
                      memberPendingPosts.slice(0, 3).map((post) => {
                        const isPostOpen = openPostId === post.id;

                        return (
                          <div key={post.id} className="p-3 border-b">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {post.user?.photo ? (
                                  <img
                                    className="object-cover w-8 h-8 mr-2 rounded-full"
                                    src={
                                      post.user.photo.startsWith("http")
                                        ? post.user.photo
                                        : `${apiUrl}/${post.user.photo}`
                                    }
                                    alt={post.user.name}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-300 rounded-full">
                                    <span className="text-xs font-bold text-gray-600">
                                      {post.user?.name?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                )}
                                <span className="font-medium">
                                  {post.user?.name || "Unknown User"}
                                </span>
                              </div>
                              <button
                                className="text-sm text-blue-500"
                                onClick={() =>
                                  setOpenPostId((prevId) =>
                                    prevId === post.id ? null : post.id
                                  )
                                }
                              >
                                {isPostOpen ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>

                            {isPostOpen && (
                              <>
                                <p className="mb-2 text-sm">{post.content}</p>
                                {post.images && post.images.length > 0 && (
                                  <div className="mb-2">
                                    {renderPhotoGrid(post.images)}
                                  </div>
                                )}
                                <div className="text-xs text-yellow-600">
                                  Pending for admin approval
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No posts pending approval
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isCurrentUserAdmin && (
                <div className="mt-4 mb-4 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h6 className="font-medium">Posts Pending Approval</h6>
                    <Link
                      to={`/groups/${groupId}/approve-posts`}
                      className="text-sm text-blue-500"
                    >
                      View All
                    </Link>
                  </div>
                  <div>
                    {isLoadingPendingPosts ? (
                      <div className="p-4 text-center">
                        <div className="w-6 h-6 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : pendingPosts.length > 0 ? (
                      pendingPosts.slice(0, 3).map((post) => {
                        const isPostOpen = openPostId === post.id;

                        return (
                          <div key={post.id} className="p-3 border-b">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {post.user?.photo ? (
                                  <img
                                    className="object-cover w-8 h-8 mr-2 rounded-full"
                                    src={
                                      post.user.photo.startsWith("http")
                                        ? post.user.photo
                                        : `${apiUrl}/${post.user.photo}`
                                    }
                                    alt={post.user.name}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-300 rounded-full">
                                    <span className="text-xs font-bold text-gray-600">
                                      {post.user?.name?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                )}
                                <span className="font-medium">
                                  {post.user?.name || "Unknown User"}
                                </span>
                              </div>
                              <button
                                className="text-sm text-blue-500"
                                onClick={() =>
                                  setOpenPostId((prevId) =>
                                    prevId === post.id ? null : post.id
                                  )
                                }
                              >
                                {isPostOpen ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>

                            {isPostOpen && (
                              <>
                                <p className="mb-2 text-sm">{post.content}</p>
                                {post.images && post.images.length > 0 && (
                                  <div className="mb-2">
                                    {renderPhotoGrid(post.images)}
                                  </div>
                                )}
                                <div className="flex justify-start gap-2">
                                  <button
                                    onClick={() => handleApprovePost(post.id)}
                                    className="px-3 py-2 text-xs text-white rounded bg-gradient-to-r from-blue-500 to-cyan-400"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectPost(post.id)}
                                    className="px-3 py-1 text-xs text-white rounded bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No posts pending approval
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isCurrentUserAdmin && (
                <div className="mt-4 mb-4 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h6 className="font-medium">Join Requests</h6>
                    {joinRequests.length > 3 && (
                      <Link
                        to={`/groups/${groupId}/join-requests`}
                        className="text-sm text-blue-500"
                      >
                        View All
                      </Link>
                    )}
                  </div>
                  <div>
                    {isLoadingJoinRequests ? (
                      <div className="p-4 text-center">
                        <div className="w-6 h-6 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : joinRequests.length > 0 ? (
                      joinRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="p-3 border-b">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {request.user?.photo ? (
                                <img
                                  className="object-cover w-8 h-8 mr-2 rounded-full"
                                  src={
                                    request.user.photo.startsWith("http")
                                      ? request.user.photo
                                      : `${apiUrl}/${request.user.photo}`
                                  }
                                  alt={request.user.name}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-300 rounded-full">
                                  <span className="text-xs font-bold text-gray-600">
                                    {request.user?.name?.charAt(0) || "U"}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="block font-medium">
                                  {request.user?.name || "Unknown User"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatPostTime(request.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-start gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleApproveJoinRequest(request.id)
                              }
                              className="px-3 py-2 text-xs text-white rounded bg-gradient-to-r from-blue-500 to-cyan-400"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleRejectJoinRequest(request.id)
                              }
                              className="px-3 py-1 text-xs text-white rounded bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No pending join requests
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content */}
            <main className="w-full lg:w-2/4">
              {/* Group Info */}
              <div className="relative mb-4 bg-white border rounded-lg shadow-sm">
                <div className="relative w-full bg-gray-300 h-14 sm:h-24">
                  <img
                    className="object-cover w-full h-full"
                    src={GroupCover}
                    alt="Cover"
                  />
                  <div className="absolute -bottom-8 left-4">
                    <div className="relative">
                      <img
                        className="object-cover w-16 h-16 border-4 border-white rounded-lg"
                        src={
                          group.image
                            ? `${apiUrl}/${group.image}`
                            : "/default-group.png"
                        }
                        alt={group.name}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between px-4 pt-10 pb-4">
                  <div className="ml-4">
                    <h5 className="font-bold text-gray-800">{group.name}</h5>
                    <p className="text-sm text-gray-500">{group.description}</p>
                    <p className="text-sm text-gray-500">
                      {group.members_count || 0} Members
                    </p>
                  </div>
                  {isCurrentUserAdmin && (
                    <div className="top-2 right-2">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={handleOpenEditModal}
                      >
                        <Pencil size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Create Post Box */}
              {isGroupMember && (
                <div className="mb-4 bg-white border rounded-lg shadow-sm">
                  <div className="p-3 border-b">
                    <h6 className="font-medium">Create New Post</h6>
                  </div>
                  <div className="p-3">
                    <form onSubmit={handleSubmitPost}>
                      <div className="mb-3">
                        <textarea
                          className="w-full p-2 text-sm border border-gray-300 resize-none rounded-xl "
                          rows="2"
                          placeholder="What's on your mind?"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Multiple image preview */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className="object-cover w-full h-full rounded"
                              />
                              <button
                                type="button"
                                className="absolute p-1 text-white bg-red-500 rounded-full top-1 right-1"
                                onClick={() => removeImage(index)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="flex w-full gap-3 sm:w-auto">
                          <label
                            htmlFor="post-image"
                            className="flex items-center text-sm cursor-pointer text-sky-500"
                          >
                            <Image size={16} className="mr-1" /> Photo
                            <input
                              type="file"
                              id="post-image"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full px-4 py-2 text-white rounded bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 sm:w-auto"
                          disabled={
                            !postContent.trim() && imageFiles.length === 0
                          }
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {pinnedPosts.length > 0 && (
                <div className="mb-4 bg-white border rounded-lg shadow-sm">
                  <div className="p-3 border-b">
                    <div className="flex items-center mb-2">
                      <Pin size={16} className="mr-2 text-blue-500" />
                      <span className="font-semibold text-blue-600">
                        Pinned Post
                      </span>
                    </div>
                    {pinnedPosts.map((post) => (
                      <div key={post.id} className="mb-4">
                        <div className="flex items-center mb-3">
                          <Link
                            to={`/user-profile/${
                              post.user?.username || "unknown"
                            }`}
                            className="relative w-10 h-10 overflow-hidden rounded-full"
                          >
                            {post.user?.photo ? (
                              <img
                                className="object-cover w-full h-full"
                                src={
                                  post.user.photo.startsWith("http")
                                    ? post.user.photo
                                    : `${apiUrl}/${post.user.photo}`
                                }
                                alt={post.user?.name || "Unknown user"}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                  e.target.parentElement.classList.add(
                                    "bg-gray-300"
                                  );
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                <span className="text-sm font-bold text-gray-600">
                                  {getInitials(post.user?.name || "Unknown")}
                                </span>
                              </div>
                            )}
                          </Link>
                          <div className="ml-3">
                            <h6 className="font-bold">
                              {post.user?.name || "Unknown user"}
                            </h6>
                            <small className="text-gray-500">
                              {formatPostTime(post.created_at)}
                            </small>
                          </div>
                          <button
                            className="ml-auto text-gray-500 hover:text-gray-700"
                            onClick={() => handleOpenPostOptions(post.id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        <p className="mb-3">{renderPostContent(post)}</p>
                        {/* GUNAKAN renderPhotoGrid AGAR RESPONSIF */}
                        {post.images && <>{renderPhotoGrid(post.images)}</>}
                        {renderPostActions(post)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-3 border-b">
                  <h6 className="font-medium">Recent Posts</h6>
                </div>
                <div>
                  {isLoadingPosts ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : postError ? (
                    <div className="p-4 text-center text-red-500">
                      {postError}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No posts yet
                    </div>
                  ) : (
                    posts.map(renderPost)
                  )}
                </div>
              </div>

              {/* Comment Modal */}
              {showCommentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  {renderShowcase()}

                  {/* Main Comment Modal */}
                  <div
                    className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col shadow-xl"
                    style={{ zIndex: showReportModal ? 40 : 50 }}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Comments
                      </h3>
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
                        comments[currentPostId]
                          .filter(Boolean)
                          .map((comment) => {
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
                                      <Link
                                        to={`/user-profile/${commentUser.username}`}
                                      >
                                        <img
                                          className="object-cover w-10 h-10 transition-colors border-2 border-white rounded-full hover:border-blue-200"
                                          src={
                                            commentUser.profile_photo.startsWith(
                                              "http"
                                            )
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
                                          {comment.user?.id ===
                                            currentUserId && (
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

                                          {comment.user?.id !==
                                            currentUserId && (
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
                                          allReplies[comment.id]?.length >
                                            0) && (
                                          <button
                                            className="text-xs text-gray-500 hover:text-blue-500"
                                            onClick={() =>
                                              toggleReplies(comment.id)
                                            }
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
                                            replyToUser?.name ||
                                            comment.user.name
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
                                          (allReplies[comment.id] || []).map(
                                            (reply) => (
                                              <div
                                                key={reply.id}
                                                className="group"
                                              >
                                                <div className="flex gap-2">
                                                  {/* Reply User Avatar */}
                                                  <div className="flex-shrink-0">
                                                    {reply.user
                                                      ?.profile_photo ? (
                                                      <Link
                                                        to={`/user-profile/${reply.user.username}`}
                                                      >
                                                        <img
                                                          className="object-cover w-8 h-8 transition-colors border-2 border-white rounded-full hover:border-blue-200"
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
                                                            e.target.onerror =
                                                              null;
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
                                                          {getInitials(
                                                            reply.user?.name
                                                          )}
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
                                                                  {
                                                                    reply
                                                                      .reply_to
                                                                      .name
                                                                  }
                                                                </Link>
                                                              </span>
                                                            )}
                                                        </div>

                                                        {/* Reply Actions */}

                                                        <div className="flex items-center space-x-2 transition-opacity opacity-0 group-hover:opacity-100">
                                                          {reply.user?.id ===
                                                          currentUserId ? (
                                                            <button
                                                              className="text-gray-500 hover:text-gray-700"
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
                                                          ) : (
                                                            <button
                                                              className="text-gray-500 hover:text-red-500"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                  reply.user?.id
                                                                ) {
                                                                  handleReportClick(
                                                                    reply.user
                                                                      .id,
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
                                                        <div className="flex gap-2 mt-1">
                                                          <input
                                                            type="text"
                                                            className="flex-1 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                            value={replyText}
                                                            onChange={(e) =>
                                                              setReplyText(
                                                                e.target.value
                                                              )
                                                            }
                                                            autoFocus
                                                          />
                                                          <button
                                                            className="px-2 py-1 text-xs text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                                                            onClick={() =>
                                                              handleUpdateReply(
                                                                reply.id
                                                              )
                                                            }
                                                          >
                                                            Update
                                                          </button>
                                                          <button
                                                            className="px-2 py-1 text-xs text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
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
                                                        <p className="mt-1 text-xs text-gray-700">
                                                          {reply.content}
                                                        </p>
                                                      )}
                                                    </div>

                                                    {/* Reply Meta */}
                                                    <div className="flex items-center justify-between px-1 mt-1">
                                                      <span className="text-xs text-gray-500">
                                                        {formatPostTime(
                                                          reply.created_at
                                                        )}
                                                      </span>

                                                      <div className="flex items-center space-x-3">
                                                        <button
                                                          className="text-xs text-blue-500 hover:text-blue-700"
                                                          onClick={() => {
                                                            setReplyingTo(
                                                              reply.id
                                                            );
                                                            setReplyToUser(
                                                              reply.user
                                                            );
                                                          }}
                                                        >
                                                          Reply
                                                        </button>
                                                      </div>
                                                    </div>
                                                    {replyingTo ===
                                                      reply.id && (
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
                                                            setReplyText(
                                                              e.target.value
                                                            )
                                                          }
                                                          autoFocus
                                                        />
                                                        <button
                                                          className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                                                          onClick={() =>
                                                            handleReply(
                                                              reply.id,
                                                              replyToUser ||
                                                                reply.user
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
                                            )
                                          )
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

                    {renderCommentOptionsModal()}
                    {renderReplyOptionsModal()}

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
                                e.target.parentElement.classList.add(
                                  "bg-gray-300"
                                );
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
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleAddComment()
                            }
                          />
                          {commentError && (
                            <p className="mt-1 text-xs text-red-500">
                              {commentError}
                            </p>
                          )}
                        </div>

                        <button
                          className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                          onClick={() => handleAddComment(currentPostId)}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Share Modal */}
              {showShareModal && (
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
                            <MessageCircle
                              size={24}
                              className="text-green-600"
                            />
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
                            <Image size={24} className="text-pink-600" />
                          </div>
                          <span className="text-xs">Instagram</span>
                        </button>

                        <button
                          onClick={shareToTwitter}
                          className="flex flex-col items-center"
                        >
                          <div className="p-3 mb-1 bg-blue-100 rounded-full">
                            <Share size={24} className="text-blue-600" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-full max-w-xs mx-4 bg-white rounded-lg">
                    <div className="p-4">
                      <h3 className="mb-3 text-lg font-medium">Post Options</h3>

                      {/* Options for current user's post */}
                      {posts.find((p) => p.id === selectedPostId)?.user?.id ===
                        currentUserId && (
                        <>
                          {/* Admin can pin/unpin any post including their own */}
                          {isCurrentUserAdmin && (
                            <>
                              {posts.find((p) => p.id === selectedPostId)
                                ?.is_pinned ? (
                                <button
                                  className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                                  onClick={() =>
                                    handleUnpinPost(selectedPostId)
                                  }
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
                                      d="M5 15l7-7 7 7"
                                    />
                                  </svg>
                                  Unpin Post
                                </button>
                              ) : (
                                <button
                                  className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                                  onClick={() => handlePinPost(selectedPostId)}
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
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                  </svg>
                                  Pin Post
                                </button>
                              )}
                            </>
                          )}

                          <button
                            className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                            onClick={() => {
                              // Handle edit post
                              // You'll need to implement this function
                              handleEditPost(selectedPostId);
                              handleClosePostOptions();
                            }}
                          >
                            <SquarePen size={16} className="mr-2" />
                            Edit Post
                          </button>

                          <button
                            className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
                            onClick={() => handleDeletePost(selectedPostId)}
                          >
                            <X size={16} className="mr-2" />
                            Delete Post
                          </button>
                        </>
                      )}

                      {/* Options for admin viewing other users' posts */}
                      {isCurrentUserAdmin &&
                        posts.find((p) => p.id === selectedPostId)?.user?.id !==
                          currentUserId && (
                          <>
                            {posts.find((p) => p.id === selectedPostId)
                              ?.is_pinned ? (
                              <button
                                className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                                onClick={() => handleUnpinPost(selectedPostId)}
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
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                                Unpin Post
                              </button>
                            ) : (
                              <button
                                className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                                onClick={() => handlePinPost(selectedPostId)}
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
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                  />
                                </svg>
                                Pin Post
                              </button>
                            )}

                            <button
                              className="flex items-center w-full px-3 py-2 text-left text-red-500 rounded-md hover:bg-gray-100"
                              onClick={() => handleDeletePost(selectedPostId)}
                            >
                              <X size={16} className="mr-2" />
                              Delete Post
                            </button>
                          </>
                        )}

                      {/* Options for regular users viewing others' posts */}
                      {!isCurrentUserAdmin &&
                        posts.find((p) => p.id === selectedPostId)?.user?.id !==
                          currentUserId && (
                          <>
                            <button
                              className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                              onClick={() => {
                                // Handle connect with user
                                // You'll need to implement this function
                                handleConnectWithUser(
                                  posts.find((p) => p.id === selectedPostId)
                                    .user.id
                                );
                                handleClosePostOptions();
                              }}
                            >
                              <UserPlus size={16} className="mr-2" />
                              Connect With User
                            </button>

                            <button
                              className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-100"
                              onClick={() => {
                                const post = posts.find(
                                  (p) => p.id === selectedPostId
                                );
                                if (post && post.user) {
                                  console.log(
                                    "Reporting post:",
                                    post.id,
                                    "by user:",
                                    post.user.id
                                  );
                                  handleReportClick(
                                    post.user.id,
                                    "post",
                                    post.id
                                  );
                                } else {
                                  console.error(
                                    "Post or user not found:",
                                    selectedPostId
                                  );
                                }
                                handleClosePostOptions();
                              }}
                            >
                              <TriangleAlert size={16} className="mr-2" />
                              Report Post
                            </button>
                          </>
                        )}
                    </div>

                    <div className="p-3 border-t">
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

              {/* Remove Member Confirmation Modal */}
              {showRemoveModal && memberToRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                  <div className="w-full max-w-md p-6 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-bold">Remove Member</h5>
                      <button
                        onClick={() => {
                          setShowRemoveModal(false);
                          setMemberToRemove(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <p>
                        Are you sure you want to remove{" "}
                        <span className="font-semibold">
                          {memberToRemove.user.name}
                        </span>{" "}
                        from this group?
                      </p>
                      {memberToRemove.role === "admin" && (
                        <p className="mt-2 text-yellow-600">
                          This user is an admin. Removing them will revoke their
                          admin privileges.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 text-gray-700 border rounded"
                        onClick={() => {
                          setShowRemoveModal(false);
                          setMemberToRemove(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 text-white bg-red-500 rounded"
                        onClick={handleRemoveMember}
                      >
                        Remove Member
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="lg:block lg:w-1/4">
              {/* Members Box */}
              <div className="mb-6 bg-white border shadow rounded-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h6 className="font-semibold text-gray-800">
                    {group.members?.length || 0} Members
                  </h6>
                </div>
                <div className="p-4 space-y-4">
                  {group?.members?.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {/* Tampilkan maksimal 3 anggota pertama */}
                      {group.members.slice(0, 3).map((member) => {
                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3"
                          >
                            {member.user.photo ? (
                              <img
                                src={
                                  member.user.photo.startsWith("http")
                                    ? member.user.photo
                                    : `${apiUrl}/${member.user.photo}`
                                }
                                className="object-cover w-10 h-10 rounded-full"
                                alt={member.user.name}
                              />
                            ) : (
                              <div
                                className={`rounded-full w-10 h-10 flex items-center justify-center font-semibold text-base bg-gray-200 uppercase ${
                                  member.user.id === currentUserId
                                }`}
                              >
                                {member.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Jika anggota lebih dari 3, tampilkan angka tambahan */}
                      {group.members.length > 3 && (
                        <div className="relative">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                            <span className="font-medium text-gray-600">
                              +{group.members.length - 3}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No members found.</p>
                  )}

                  {isCurrentUserAdmin && (
                    <button
                      className="px-4 py-2 text-sm font-medium text-blue-600 transition border border-blue-500 rounded-lg hover:bg-blue-50"
                      onClick={handleOpenInviteModal}
                    >
                      + Invite Connection
                    </button>
                  )}
                </div>

                <Link
                  to={`/groups/${groupId}/members`}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 transition border hover:bg-blue-50"
                >
                  Show All
                </Link>
              </div>

              {/* Invite Modal */}
              {inviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h5 className="font-bold text-gray-800">
                        Invite Connection
                      </h5>
                      <button
                        onClick={() => setInviteModalOpen(false)}
                        className="text-gray-400 transition hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {connections.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No connections found
                        </div>
                      ) : (
                        <ul className="divide-y">
                          {connections.map((connection) => {
                            const friend = connection.user;
                            const isActiveMember = group.members?.some(
                              (member) => member.user.id === friend.id
                            );
                            const isInvited = group.invitations?.some(
                              (inv) =>
                                inv.user_id === friend.id &&
                                inv.status === "pending"
                            );

                            return (
                              <li
                                key={friend.id}
                                className="flex items-center justify-between p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      apiUrl + "/" + friend.photo ||
                                      "/default-user.png"
                                    }
                                    className="object-cover w-10 h-10 rounded-full"
                                    alt={friend.name}
                                  />
                                  <span className="font-medium text-gray-800">
                                    {friend.name}
                                  </span>
                                </div>
                                {isActiveMember ? (
                                  <span className="text-sm text-gray-400">
                                    Already a member
                                  </span>
                                ) : isInvited ? (
                                  <span className="text-sm text-yellow-500">
                                    Invitation sent
                                  </span>
                                ) : (
                                  <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition"
                                    onClick={() => handleInvite(friend.id)}
                                  >
                                    Invite
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {group.creator && (
                <div className="mb-4 bg-white border rounded-lg shadow-sm">
                  <div className="p-3 border-b">
                    <h6 className="font-medium">Group Admin</h6>
                  </div>
                  <div className="p-4 text-center">
                    {group.creator.photo ? (
                      <img
                        src={apiUrl + "/" + group.creator.photo}
                        className="object-cover w-20 h-20 mx-auto mb-2 rounded-full"
                        alt={group.creator.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                          e.target.parentElement.classList.add("bg-gray-200");
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-2 bg-gray-200 rounded-full">
                        <span className="text-lg font-bold text-gray-600">
                          {group.creator.name
                            ? group.creator.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "?"}
                        </span>
                      </div>
                    )}
                    <h5 className="font-bold text-gray-800">
                      {group.creator.name}
                    </h5>
                    <p className="mt-1 text-sm text-gray-500">
                      {group.creator.headline || "No headline available"}
                    </p>
                    {group.creator.about && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {group.creator.about}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
      {/* Image Modal */}
      {showImageModal && selectedPost && (
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
                src={selectedPost.images[selectedImageIndex]}
                className="w-full max-h-[80vh] object-contain"
                alt={`Post ${selectedImageIndex + 1}`}
              />

              {selectedPost.images.length > 1 && (
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

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-blue-200/50 shadow-2xl shadow-blue-500/10 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-blue-200/50 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-t-2xl backdrop-blur-sm">
              <h3 className="text-lg font-bold text-transparent bg-white bg-clip-text">
                Edit Group
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white transition-colors duration-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Group Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full p-2 text-gray-800 placeholder-gray-400 transition-all duration-300 border border-blue-200 rounded-lg bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Privacy Level
                  </label>
                  <select
                    name="privacy_level"
                    value={editFormData.privacy_level}
                    onChange={handleEditInputChange}
                    className="w-full p-2 text-gray-800 transition-all duration-300 border border-blue-200 rounded-lg cursor-pointer bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Invite Policy
                  </label>
                  <select
                    name="invite_policy"
                    value={editFormData.invite_policy}
                    onChange={handleEditInputChange}
                    className="w-full p-2 text-gray-800 transition-all duration-300 border border-blue-200 rounded-lg cursor-pointer bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="all_members">All Members</option>
                    <option value="admins_only">Admins Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Post Approval
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="post_approval"
                      checked={editFormData.post_approval}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          post_approval: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {editFormData.post_approval ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="w-full p-2 text-gray-800 placeholder-gray-400 transition-all duration-300 border border-blue-200 rounded-lg resize-none bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Rules
                </label>
                <textarea
                  name="rule"
                  value={editFormData.rule}
                  onChange={handleEditInputChange}
                  className="w-full p-2 text-gray-800 placeholder-gray-400 transition-all duration-300 border border-blue-200 rounded-lg resize-none bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Group Image
                </label>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 border-blue-200/50">
                  {editFormData.imagePreview && (
                    <img
                      src={editFormData.imagePreview}
                      className="object-cover w-12 h-12 rounded-full ring-2 ring-blue-400/50"
                      alt="Group preview"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-sky-500 file:to-cyan-400 file:text-white hover: file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-200/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 font-medium text-gray-700 transition-all duration-300 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-500 "
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {/* Edit Post Modal */}
      {showEditPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Edit Post</h3>
              <button
                onClick={() => setShowEditPostModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[120px] text-sm"
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              placeholder="What's on your mind?"
            ></textarea>

            {/* Image previews */}
            {editPostImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {editPostImagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full rounded"
                    />
                    <button
                      type="button"
                      className="absolute p-1 text-white bg-red-500 rounded-full top-1 right-1"
                      onClick={() => removeEditPostImage(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <label
                htmlFor="edit-post-image"
                className="flex items-center text-sm cursor-pointer text-sky-500"
              >
                <Image size={16} className="mr-1" /> Add Photo
                <input
                  type="file"
                  id="edit-post-image"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditPostImageUpload}
                />
              </label>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-gray-700 border rounded"
                  onClick={() => setShowEditPostModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-white bg-blue-500 rounded"
                  onClick={handleSaveEditedPost}
                  disabled={!editPostContent.trim()}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
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
                  console.log("Report button clicked with params:", {
                    reportTargetUserId,
                    targetType: "post",
                    selectedPostId,
                    reasonText,
                  });
                  handleSubmitReport(
                    reportTargetUserId,
                    "post",
                    selectedPostId,
                    reasonText
                  );
                }}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Case>
  );
}
