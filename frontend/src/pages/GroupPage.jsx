import { useState, useEffect } from "react";
import Case from "../components/Case";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
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
} from "lucide-react";
import GroupCover from "../assets/img/cover.jpg";

export default function GroupPage() {
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const clientUrl = import.meta.env.VITE_APP_CLIENT_URL || "http://localhost:5173";
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
  const [user, setUser] = useState({
    name: "",
    photo: "",
    following_count: 42,
  });
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postError, setPostError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        await axios.delete(
          `${apiUrl}/api/post-actions/${postId}/like`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
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
        `${apiUrl}/api/post-comments/${postId}?limit=10&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const commentsWithUser = (response.data?.data?.comments || []).map(
        (comment) => ({
          ...comment,
          user: comment.user || {
            name: "Unknown User",
            initials: "UU",
          },
        })
      );

      setComments((prev) => ({
        ...prev,
        [postId]: commentsWithUser,
      }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setCommentError("Failed to load comments");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
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
      setCommentError(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
      setCommentError(
        error.response?.data?.message ||
          "Failed to add comment. Please try again."
      );
    }
  };

  // Open comment modal
  const openCommentModal = (postId) => {
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

  // Share post handlers
  const handleOpenShareModal = (postId) => {
    setSharePostId(postId);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharePostId(null);
  };

  const copyToClipboard = () => {
    const urlToCopy = `${clientUrl}/post/${sharePostId}`;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post. Please try again.");
    }
  };

  // Format post time
  const formatPostTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return postTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPostActions = (post) => (
    <div className="border-t px-4 py-2 flex justify-between">
      <button
        className={`flex items-center justify-center w-1/3 py-2 rounded-lg ${
          post.isLiked
            ? "text-blue-600 bg-blue-50"
            : "text-blue-600 hover:bg-blue-50"
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

      const response = await axios.get(
        `${apiUrl}/api/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      toast.success(`Successfully updated user role to ${selectedRole}`);
      setShowRoleModal(false);
      setEditingMemberId(null);
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error(
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

      toast.success(
        `Successfully removed ${memberToRemove.user.name} from the group`
      );
      setShowRemoveModal(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(
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

      toast.success("Post created successfully");
      fetchGroupPosts(); // Refresh posts
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
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
      toast.success(`Invitation sent to ${invitedUser?.name || "user"}`);
    } catch (error) {
      console.error("Error inviting user:", error);
      if (error.response) {
        if (
          error.response.status === 400 &&
          error.response.data?.data === "invitation already sent to this user"
        ) {
          toast.error("An invitation has already been sent to this user");
        } else {
          toast.error(
            error.response.data?.message || `Error: ${error.response.status}`
          );
        }
      } else {
        toast.error("Network error - please check your connection");
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
        {showInviteSuccess && (
          <div className="fixed top-5 right-5 z-50">
                  {alertInfo.show && (
                    <Alert
                      type={alertInfo.type}
                      message={alertInfo.message}
                      onClose={() => setAlertInfo({ ...alertInfo, show: false })}
                    />
                  )}
                </div>
        )}

        {/* Main Content Area */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Left Sidebar */}
            <aside className="lg:block lg:w-1/4">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 text-center">
                  <div className="profile-photo-container">
                    {group.creator.photo ? (
                      <img
                        src={`${apiUrl}/${group.creator.photo}`}
                        alt="avatar"
                        className="rounded-full w-20 h-20 mx-auto object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-sm font-bold text-gray-600">
                          {group.creator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <h5 className="font-bold text-gray-800 mt-3">
                      {group.creator?.name || "Admin"}
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
                        className="rounded-full w-16 h-16 border-4 border-white"
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
                <div className="pt-10 px-4 pb-4">
                  <div className="ml-4">
                    <h5 className="font-bold text-gray-800">{group.name}</h5>
                    <p className="text-gray-500 text-sm">{group.description}</p>
                    <p className="text-gray-500 text-sm">
                      {group.members_count || 0} Members
                    </p>
                  </div>
                </div>
              </div>
              {/* Create Post Box */}
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
                              <img
                                className="rounded-full w-8 h-8 object-cover mr-2"
                                src={
                                  comment.user.profile_photo ||
                                  "/default-user.png"
                                }
                                alt={comment.user.name}
                              />
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                                  <div className="font-semibold text-xs md:text-sm">
                                    {comment.user.name}
                                  </div>
                                  <p className="text-xs md:text-sm">
                                    {comment.content}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatPostTime(comment.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 md:p-4 border-t">
                      <div className="flex items-center mb-2">
                        <img
                          className="rounded-full w-8 h-8 bg-gray-200 flex items-center justify-center text-xxs md:text-xs mr-2 md:mr-3"
                          src={currentUser?.photo || "/default-user.png"}
                          alt="You"
                        />
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
                        console.log(member)
                        return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={
                              member.user.photo
                                ? member.user.photo.startsWith("http")
                                  ? member.user.photo
                                  : `${apiUrl}/${member.user.photo.replace(
                                      /^\/+/,
                                      ""
                                    )}`
                                : "/default-user.png"
                            }
                            className="rounded-full w-10 h-10 object-cover"
                            alt={member.user.name}
                          />
                        </div>
                      )
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
                                    src={apiUrl + '/'+friend.photo || "/default-user.png"}
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
    </Case>
  );
}
