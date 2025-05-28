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
} from "lucide-react";
import GroupCover from "../assets/img/cover.jpg";

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
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentModalPostId, setCommentModalPostId] = useState(null);
  const [sharePostId, setSharePostId] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
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
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [showcaseReplies, setShowcaseReplies] = useState([]);
  const [showShowcase, setShowShowcase] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postError, setPostError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    image: null,
    imagePreview: "",
  });

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
      privacy_level: group.privacy_level,
      invite_policy: group.invite_policy,
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

      if (editFormData.image) {
        formData.append("image", editFormData.image);
      }

      console.log("Updating group with ID:", groupId);

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
      console.log("Update response:", response.data);

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
                ? Math.max(post.likes_count - 1, 0)
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
                : Math.max(post.likes_count - 1, 0),
              isLiked: isCurrentlyLiked,
            };
          }
          return post;
        })
      );
      toast.error("Failed to like post. Please try again.");
    }
  };

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
      setLoadingComments((prev) => ({ ...prev, [commentId]: true }));

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/comments/${commentId}/replies`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: response.data.data.comments || [],
      }));
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      setCommentError("Failed to load replies");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [commentId]: false }));
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
        ? response.data.data
        : [];

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: replies,
      }));

      setComments((prev) => {
        const updated = { ...prev };
        if (updated[commentModalPostId]) {
          // Changed from currentPostId to commentModalPostId
          updated[commentModalPostId] = updated[commentModalPostId].map((c) => {
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
      const userToken = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/comments/${commentId}/replies`,
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

      const updatedReplies = [...(allReplies[commentId] || []), newReply];

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: updatedReplies,
      }));

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
    if (!allReplies[commentId] || allReplies[commentId].length === 0) {
      await fetchReplies(commentId);
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
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
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Replies</h3>
            <button onClick={() => setShowShowcase(false)}>
              <X size={20} />
            </button>
          </div>

          {repliesToRender.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No replies yet.</p>
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

  const renderPostActions = (post) => (
    <div>
      {/* Likes & Comments Info */}
      <div className="flex items-center space-x-4 px-4 py-1 text-xs text-gray-500 justify-between">
        <div className="flex items-center space-x-1 pt-1">
          <span className="text-black flex">
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
  );

  // Update the post rendering in the return statement to include options button
  const renderPost = (post) => (
    <div key={post.id} className="border-b p-3 relative">
      <div className="flex items-center mb-3">
        <Link to={`/user-profile/${post.user.username}`}>
          <img
            className="rounded-full w-10 h-10 object-cover"
            src={
              post.user.photo
                ? post.user.photo.startsWith("http")
                  ? post.user.photo
                  : `${apiUrl}/${post.user.photo}`
                : "/default-user.png"
            }
            alt={post.user.name}
          />
        </Link>
        <div className="ml-3">
          <h6 className="font-bold">{post.user.name}</h6>
          <small className="text-gray-500">
            {formatPostTime(post.created_at)}
          </small>
        </div>
        {post.user.id === currentUserId && (
          <button
            className="ml-auto text-gray-500 hover:text-gray-700"
            onClick={() => handleOpenPostOptions(post.id)}
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>
      <p className="mb-3 text-sm sm:text-base">{post.content}</p>

      {post.images && <>{renderPhotoGrid(post.images)}</>}

      {renderPostActions(post)}
    </div>
  );

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
        },
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        created_at: post.created_at || new Date().toISOString(),
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching group posts:", error);
      setPostError("Failed to load group posts");
      toast.error("Failed to load group posts");
    } finally {
      setIsLoadingPosts(false);
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
    } else {
      toast.error("Invalid group ID.");
    }
  }, [groupId]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
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
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  return (
    <Case>
      <div className="flex flex-col md:flex-row bg-gray-50 px-4 md:px-6 lg:px-12 xl:px-32 py-2 md:py-4">
        <div className="fixed top-5 right-5 z-50">
          {alertInfo.show && (
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Left Sidebar */}
            {/* Left Sidebar */}
            <aside className="lg:block lg:w-1/4">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 text-center">
                  <div className="profile-photo-container">
                    {group.image ? (
                      <img
                        src={`${apiUrl}/${group.image}`}
                        alt="avatar"
                        className="rounded-full w-20 h-20 mx-auto object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-sm font-bold text-gray-600">
                          {group.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <h5 className="font-bold text-gray-800 mt-3">
                      {group.name}
                    </h5>
                  </div>

                  <div className="mt-4 p-2">
                    <div className="flex items-center justify-between py-2">
                      <p className="text-gray-500">Members</p>
                      <p className="font-bold text-gray-800">
                        {group.members_count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Tambahkan bagian Rules di sini */}
                  {group.rule && (
                    <div className="mt-4 p-2 border-t">
                      <h6 className="font-semibold text-left mb-2">
                        Group Rules
                      </h6>
                      <div className="text-left text-sm text-gray-600 whitespace-pre-line">
                        {group.rule}
                      </div>
                    </div>
                  )}

                  {/* Join button */}
                  {!isGroupMember && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full mt-3"
                      onClick={handleJoinGroup}
                    >
                      Join Group
                    </button>
                  )}

                  {isGroupMember && !isCurrentUserAdmin && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full mt-3"
                      onClick={handleLeaveGroup}
                    >
                      Leave Group
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="w-full lg:w-2/4">
              {/* Group Info */}
              <div className="rounded-lg border bg-white shadow-sm mb-4 relative">
                <div className="h-14 sm:h-24 w-full bg-gray-300 relative">
                  <img
                    className="h-full w-full object-cover"
                    src={GroupCover}
                    alt="Cover"
                  />
                  <div className="absolute -bottom-8 left-4">
                    <div className="relative">
                      <img
                        className="rounded-full object-cover w-16 h-16 border-4 border-white"
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
                <div className="pt-10 px-4 pb-4 justify-between flex items-start">
                  <div className="ml-4">
                    <h5 className="font-bold text-gray-800">{group.name}</h5>
                    <p className="text-gray-500 text-sm">{group.description}</p>
                    <p className="text-gray-500 text-sm">
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
                  </div>)}
                </div>
              </div>
              {/* Create Post Box */}
              {isGroupMember && (
                <div className="rounded-lg border bg-white shadow-sm mb-4">
                  <div className="border-b p-3">
                    <h6 className="font-medium">Create New Post</h6>
                  </div>
                  <div className="p-3">
                    <form onSubmit={handleSubmitPost}>
                      <div className="mb-3">
                        <textarea
                          className="w-full p-2 border rounded text-sm sm:text-base"
                          rows="3"
                          placeholder="What's on your mind?"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Multiple image preview */}
                      {imagePreviews.length > 0 && (
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                onClick={() => removeImage(index)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="flex gap-3 w-full sm:w-auto">
                          <label
                            htmlFor="post-image"
                            className="text-blue-500 cursor-pointer flex items-center text-sm"
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
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
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

              <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-3">
                  <h6 className="font-medium">Recent Posts</h6>
                </div>
                <div>
                  {isLoadingPosts ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  {renderCommentOptionsModal()}
                  {renderShowcase()}
                  <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                    <div className="p-3 md:p-4 border-b flex justify-between items-center">
                      <h3 className="text-base md:text-lg font-semibold">
                        Comments
                      </h3>
                      <button onClick={closeCommentModal}>
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-3 md:p-4 overflow-y-auto flex-1">
                      {loadingComments[commentModalPostId] ? (
                        <div className="text-center py-4">
                          Loading comments...
                        </div>
                      ) : !Array.isArray(comments[commentModalPostId]) ||
                        comments[commentModalPostId].length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      ) : (
                        comments[commentModalPostId].map((comment) => (
                          <div key={comment.id} className="mb-4">
                            <div className="flex items-start mb-2">
                              {comment.user.profile_photo ? (
                                <Link
                                  to={`/user-profile/${comment.user.username}`}
                                >
                                  <img
                                    className="rounded-full w-8 h-8 object-cover mr-2"
                                    src={
                                      comment.user.profile_photo.startsWith(
                                        "http"
                                      )
                                        ? comment.user.profile_photo
                                        : `${apiUrl}/${comment.user.profile_photo}`
                                    }
                                    alt={comment.user.name}
                                  />
                                </Link>
                              ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full mr-2">
                                  <span className="text-xs font-bold text-gray-600">
                                    {comment.user.initials || "UU"}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                                  <div className="flex justify-between items-center">
                                    <Link
                                      to={`/user-profile/${comment.user.username}`}
                                      className="font-semibold text-xs md:text-sm hover:underline"
                                    >
                                      {comment.user.name}
                                    </Link>
                                    <button
                                      onClick={(e) =>
                                        handleOpenCommentOptions(comment, e)
                                      }
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <MoreHorizontal size={14} />
                                    </button>
                                  </div>
                                  {editingCommentId === comment.id ? (
                                    <div className="mt-2 flex">
                                      <input
                                        type="text"
                                        className="flex-1 border rounded-l-lg p-2 text-xs md:text-sm"
                                        value={commentText}
                                        onChange={(e) =>
                                          setCommentText(e.target.value)
                                        }
                                      />
                                      <button
                                        className="bg-blue-500 text-white px-2 md:px-3 rounded-r-lg text-xs md:text-sm"
                                        onClick={() =>
                                          handleUpdateComment(comment.id)
                                        }
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
                                <div className="flex justify-start items-center mt-1">
                                  <div className="text-xs mr-2 text-gray-500">
                                    {formatPostTime(comment.created_at)}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      className="text-xs text-blue-500 hover:text-blue-700"
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
                              </div>
                            </div>

                            {replyingTo === comment.id && (
                              <div className="mt-2 ml-10 flex">
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
                              <div className="mt-2 ml-10 pl-2 border-l-2 border-gray-200">
                                {loadingComments[comment.id] ? (
                                  <div className="text-center py-2">
                                    Loading replies...
                                  </div>
                                ) : (
                                  (allReplies[comment.id] || []).map(
                                    (reply) => (
                                      <div key={reply.id} className="mb-3">
                                        <div className="flex items-start">
                                          {reply.user?.profile_photo ? (
                                            <Link
                                              to={`/user-profile/${reply.user.username}`}
                                            >
                                              <img
                                                className="rounded-full w-6 h-6 object-cover mr-2"
                                                src={
                                                  reply.user.profile_photo.startsWith(
                                                    "http"
                                                  )
                                                    ? reply.user.profile_photo
                                                    : `${apiUrl}/${reply.user.profile_photo}`
                                                }
                                                alt={reply.user.name}
                                              />
                                            </Link>
                                          ) : (
                                            <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full mr-2">
                                              <span className="text-xs font-bold text-gray-600">
                                                {reply.user.initials || "UU"}
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex-1">
                                            <div className="bg-gray-100 rounded-lg p-1 md:p-2">
                                              <div className="font-semibold text-xxs md:text-xs flex items-center">
                                                {reply.user?.name ||
                                                  "Unknown User"}
                                                {reply.replyTo && (
                                                  <span className="text-gray-500 ml-1 flex items-center">
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
                                            <div className="flex justify-start items-center mt-1">
                                              <div className="text-xs text-gray-500 mr-2">
                                                {formatPostTime(
                                                  reply.created_at
                                                )}
                                              </div>
                                              <button
                                                className="text-xs text-blue-500 hover:text-blue-700"
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
                                      </div>
                                    )
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 md:p-4 border-t">
                      <div className="flex items-center mb-2">
                        {currentUser?.photo ? (
                          <img
                            className="rounded-full w-8 h-8 object-cover mr-2"
                            src={
                              currentUser.photo.startsWith("http")
                                ? currentUser.photo
                                : `${apiUrl}/${currentUser.photo}`
                            }
                            alt="You"
                          />
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full mr-2">
                            <span className="text-xs font-bold text-gray-600">
                              {currentUser?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2) || "UU"}
                            </span>
                          </div>
                        )}
                        <input
                          type="text"
                          className="flex-1 border rounded-lg p-2 text-xs md:text-sm"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            handleAddComment(commentModalPostId)
                          }
                        />
                      </div>
                      {commentError && (
                        <span className="text-red-500 text-xs font-medium">
                          {commentError}
                        </span>
                      )}
                      <div className="flex justify-end">
                        <button
                          className="bg-blue-500 text-white px-3 md:px-4 py-1 rounded-lg text-xs md:text-sm"
                          onClick={() => handleAddComment(commentModalPostId)}
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
                          <div className="bg-pink-100 p-3 rounded-full mb-1">
                            <Image size={24} className="text-pink-600" />
                          </div>
                          <span className="text-xs">Instagram</span>
                        </button>

                        <button
                          onClick={shareToTwitter}
                          className="flex flex-col items-center"
                        >
                          <div className="bg-blue-100 p-3 rounded-full mb-1">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg w-full max-w-xs mx-4">
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-3">Post Options</h3>

                      <button
                        className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                        onClick={() => handleDeletePost(selectedPostId)}
                      >
                        <X size={16} className="mr-2" />
                        Delete Post
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

              {/* Role Update Modal */}
              {showRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-bold">Change Member Role</h5>
                      <button
                        onClick={() => {
                          setShowRoleModal(false);
                          setEditingMemberId(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {editingMemberId === currentUser?.id ? (
                      <div className="text-red-500 mb-4">
                        You cannot change your own role.
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Role
                          </label>
                          <select
                            className="w-full p-2 border rounded"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            className="px-4 py-2 border rounded text-gray-700"
                            onClick={() => {
                              setShowRoleModal(false);
                              setEditingMemberId(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() =>
                              handleUpdateMemberRole(editingMemberId)
                            }
                          >
                            Update Role
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Remove Member Confirmation Modal */}
              {showRemoveModal && memberToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
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
                        <p className="text-yellow-600 mt-2">
                          This user is an admin. Removing them will revoke their
                          admin privileges.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 border rounded text-gray-700"
                        onClick={() => {
                          setShowRemoveModal(false);
                          setMemberToRemove(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded"
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
              <div className="rounded-xl border bg-white shadow mb-6">
                <div className="border-b p-4 flex items-center justify-between">
                  <h6 className="font-semibold text-gray-800">
                    {group.members?.length || 0} Members
                  </h6>
                </div>
                <div className="space-y-4 p-4">
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
                                className="rounded-full w-10 h-10 object-cover"
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
                          <div className="rounded-full w-10 h-10 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              +{group.members.length - 3}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No members found.</p>
                  )}

                  {isCurrentUserAdmin && (
                    <button
                      className="text-sm font-medium px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                      onClick={handleOpenInviteModal}
                    >
                      + Invite Connection
                    </button>
                  )}
                </div>

                <Link
                  to={`/groups/${groupId}/members`}
                  className="w-full text-sm font-medium px-4 py-2 border text-blue-600 hover:bg-blue-50 transition flex items-center justify-center"
                >
                  Show All
                </Link>
              </div>

              {/* Invite Modal */}
              {inviteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center border-b p-4">
                      <h5 className="font-bold text-gray-800">
                        Invite Connection
                      </h5>
                      <button
                        onClick={() => setInviteModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
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
                                className="p-4 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      apiUrl + "/" + friend.photo ||
                                      "/default-user.png"
                                    }
                                    className="w-10 h-10 rounded-full object-cover"
                                    alt={friend.name}
                                  />
                                  <span className="text-gray-800 font-medium">
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
                <div className="rounded-lg border bg-white shadow-sm mb-4">
                  <div className="border-b p-3">
                    <h6 className="font-medium">Group Admin</h6>
                  </div>
                  <div className="p-4 text-center">
                    <img
                      src={
                        apiUrl + "/" + group.creator.photo ||
                        "/default-user.png"
                      }
                      className="rounded-full w-20 h-20 mx-auto mb-2"
                      alt={group.creator.name}
                    />
                    <h5 className="font-bold text-gray-800">
                      {group.creator.name}
                    </h5>
                    <p className="text-gray-500 text-sm mt-1">
                      {group.creator.headline || "No headline available"}
                    </p>
                    {group.creator.about && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">
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

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Edit Group</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rules</label>
                <textarea
                  name="rule"
                  value={editFormData.rule}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Privacy Level
                </label>
                <select
                  name="privacy_level"
                  value={editFormData.privacy_level}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Invite Policy
                </label>
                <select
                  name="invite_policy"
                  value={editFormData.invite_policy}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="all_members">All Members</option>
                  <option value="admins_only">Admins Only</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Group Image
                </label>
                <div className="flex items-center gap-4">
                  {editFormData.imagePreview && (
                    <img
                      src={editFormData.imagePreview}
                      className="w-16 h-16 rounded-full object-cover"
                      alt="Group preview"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Case>
  );
}
