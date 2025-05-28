import { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Tooltip as ChartTooltip } from "chart.js";
import { Link, useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Case from "../components/Case.jsx";
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
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
} from "chart.js";
import { toast } from "sonner";

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
  const [postContent, setPostContent] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("update");
  const [articleImages, setArticleImages] = useState([]);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const { postId } = useParams();
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showcaseReplies, setShowcaseReplies] = useState([]);
  const [showShowcase, setShowShowcase] = useState(false);
  const [allReplies, setAllReplies] = useState({});
  const [connections, setConnections] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [user, setUser] = useState(null);
  const [profileViews, setProfileViews] = useState({
    thisWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
    dailyViews: [],
  });

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
      toast.error("Failed to load suggested connections");
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

      toast.success("Connection request sent successfully");
      fetchConnections();
      fetchSuggestedConnections();
    } catch (error) {
      console.error("Failed to connect with user:", error);
      toast.error("Failed to send connection request");
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
      setConnectionsCount(response.data.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile views
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
      toast.error("Failed to load profile views");
    }
  };

  // Initialize user data and fetch connections/views
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserId(parsedUser.id);
      setUser(parsedUser);
    }
  }, []);

  // Fetch data when currentUserId changes
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

  const getLast7DaysData = () => {
    const { labels, data } = profileViews.chartData || { labels: [], data: [] };
    if (labels.length > 0 && data.length > 0) {
      return { labels, data };
    }

    // Fallback to default data
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [0, 0, 0, 0, 0, 0, 0],
    };
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
        backgroundColor: "#06b6d4",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
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
          precision: 0,
        },
      },
    },
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

      // Separate top-level comments and replies
      const commentsData = response.data?.data?.comments || [];
      const topLevelComments = commentsData.filter(
        (comment) => !comment.parent_id
      );
      const replies = commentsData.filter((comment) => comment.parent_id);

      // Organize replies under their parent comments
      const commentsWithReplies = topLevelComments.map((comment) => {
        return {
          ...comment,
          user: comment.user || {
            name: "Unknown User",
            initials: "UU",
            username: "unknown",
            profile_photo: null,
          },
          replies: replies.filter((reply) => reply.parent_id === comment.id),
          repliesCount: comment.replies_count || 0,
        };
      });

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
  const fetchAllReplies = async (commentId) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [commentId]: true }));

      const userToken = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/comments/${commentId}/replies?limit=100`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const replies = Array.isArray(response.data?.data?.comments)
        ? response.data.data.comments
        : [];

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: replies,
      }));

      // Update the replies count in the main comments
      setComments((prev) => {
        const updated = { ...prev };
        if (updated[currentPostId]) {
          updated[currentPostId] = updated[currentPostId].map((c) =>
            c.id === commentId ? { ...c, repliesCount: replies.length } : c
          );
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      setAllReplies((prev) => ({
        ...prev,
        [commentId]: [],
      }));
    } finally {
      setLoadingComments((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleReplies = async (commentId) => {
    if (!allReplies[commentId] || allReplies[commentId].length === 0) {
      await fetchAllReplies(commentId);
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
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
              comments_count: (post.comments_count || 0) + 1,
            };
          }
          return post;
        })
      );

      fetchComments(currentPostId);
      setCommentText("");
      setCommentError(null);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      setCommentError(
        error.response?.data?.message ||
          "Failed to add comment. Please try again."
      );
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
        replyTo: replyToUser,
      };

      setAllReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), newReply],
      }));

      setComments((prev) => {
        const updated = { ...prev };
        if (updated[currentPostId]) {
          updated[currentPostId] = updated[currentPostId].map((c) =>
            c.id === commentId
              ? { ...c, repliesCount: (c.repliesCount || 0) + 1 }
              : c
          );
        }
        return updated;
      });

      setReplyText("");
      setReplyingTo(null);
      setReplyToUser(null);
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Failed to add reply:", error);
      setCommentError(
        error.response?.data?.message ||
          "Failed to add reply. Please try again."
      );
    }
  };

  const handleOpenShowcase = async (commentId) => {
    if (!commentId) return;

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

      setShowcaseReplies(response.data?.data || []);
      setShowShowcase(true);
    } catch (error) {
      console.error("Failed to load replies:", error);
      setCommentError("Failed to load replies. Please try again.");
    }
  };

  const renderShowcase = () => {
    if (!showShowcase) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Replies</h3>
            <button onClick={() => setShowShowcase(false)}>
              <X size={20} />
            </button>
          </div>

          {showcaseReplies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No replies yet.</p>
          ) : (
            <div className="space-y-3">
              {showcaseReplies.map((reply) => (
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
                  onClick={() => {
                    handleDeleteComment(selectedComment.id);
                    setShowCommentOptions(false);
                  }}
                >
                  <X size={16} className="mr-2" />
                  Delete Comment
                </button>
              </>
            ) : (
              <button
                className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center text-red-500"
                onClick={() => {
                  console.log("Report comment");
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

  const ReplyItem = ({ reply }) => {
    return (
      <div className="flex items-start group">
        {reply.user?.profile_photo ? (
          <img
            src={getImageUrl(reply.user.profile_photo)}
            className="rounded-full mr-2 w-6 h-6"
            alt={reply.user?.name || "User"}
          />
        ) : (
          <div className="rounded-full bg-gray-200 w-6 h-6 flex items-center justify-center text-xxs mr-2">
            {reply.user?.initials || "UU"}
          </div>
        )}
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <h4 className="font-semibold text-xs">
                  {reply.user?.name || "Unknown User"}
                </h4>
                {reply.parent_id && (
                  <span className="text-gray-500 text-xxs ml-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="8"
                      fill="currentColor"
                      className="mr-1"
                      viewBox="0 0 16 16"
                    >
                      <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                    </svg>
                    Replying to{" "}
                  </span>
                )}
              </div>
              <small className="text-gray-500 text-xs">
                {formatPostTime(reply.createdAt || new Date().toISOString())}
              </small>
            </div>
            <p className="text-xs mt-1">{reply.content}</p>
          </div>
          <div className="flex justify-between items-center mt-1">
            {/* <button
              className="text-blue-500 text-xxs hover:underline"
              onClick={() => {
                setReplyingTo(reply.parentCommentId);
                setReplyToUser(reply.user);
              }}
            >
              Reply
            </button> */}
            <button
              className="opacity-0 group-hover:opacity-100 text-gray-500 text-xxs"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComment(reply);
                setShowCommentOptions(true);
              }}
            >
              <Ellipsis size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const userToken = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

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
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setCommentError("Failed to delete comment. Please try again.");
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
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Failed to update comment:", error);
      setCommentError("Failed to update comment. Please try again.");
    }
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
    try {
      const userToken = localStorage.getItem("token");

      if (isCurrentlyLiked) {
        await axios.delete(`${apiUrl}/api/post-actions/${postId}/like`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
      } else {
        await axios.post(
          `${apiUrl}/api/post-actions/${postId}/like`,
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
      await axios.delete(`${apiUrl}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setPosts(posts.filter((post) => post.id !== postId));
      handleClosePostOptions();

      if (selectedPostId === postId) {
        setSelectedPostId(null);
        setPostContent("");
        setArticleImages([]);
      }
      toast.success("Post deleted successfully");
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

      let uploadedImageUrls = [];
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((file) => {
          formData.append("images", file);
        });

        const uploadResponse = await axios.post(apiUrl + "/images", formData, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        uploadedImageUrls = uploadResponse.data.data.filenames || [];
      }

      const updatedPost = {
        content: postContent,
        images: [...articleImages, ...uploadedImageUrls],
        removedImages: removedImages,
        visibility: postVisibility,
      };

      const response = await axios.put(
        `${apiUrl}/api/posts/${editingPost.id}`,
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
      toast.success("Post updated successfully");
    } catch (error) {
      console.error("Failed to update post:", error);
      setError("Failed to update post. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm flex items-center ${
        post.isLiked
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

  const saveExpandedRepliesToLocalStorage = (replies) => {
    localStorage.setItem("expandedReplies", JSON.stringify(replies));
  };

  const getImageUrl = (path) => {
    if (!path) return "/placeholder-user.png";
    if (path.startsWith("http")) return path;
    return `${apiUrl}/${path}`;
  };

  // Fungsi untuk memuat expanded replies dari localStorage
  const loadExpandedRepliesFromLocalStorage = () => {
    const saved = localStorage.getItem("expandedReplies");
    return saved ? JSON.parse(saved) : {};
  };

  // Di dalam komponen, gunakan useEffect untuk load saat mount
  useEffect(() => {
    const savedReplies = loadExpandedRepliesFromLocalStorage();
    setExpandedReplies(savedReplies);
  }, []);

  // Update localStorage setiap kali expandedReplies berubah
  useEffect(() => {
    saveExpandedRepliesToLocalStorage(expandedReplies);
  }, [expandedReplies]);

  return (
    <Case>
      <div className="flex flex-col md:flex-row bg-gray-50 px-4 md:px-6 lg:px-12 xl:px-32 py-4 md:py-6">
        {renderCommentOptionsModal()}
        {renderShowcase()}
        {/* Mobile Menu Button */}

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
                    {post.user?.photo ? (
                      <img
                        src={getImageUrl(post.user.photo)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-user.png";
                        }}
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
                  <div className="border-t px-4 py-2 flex justify-between">
                    <button
                      className={`flex items-center justify-center w-1/3 py-2 rounded-lg ${
                        post.isLiked
                          ? "text-blue-600 bg-blue-50"
                          : "text-blue-600 hover:bg-blue-100"
                      }`}
                      onClick={() => handleLikePost(post.id, post.isLiked)}
                    >
                      <ThumbsUp size={14} className="mr-2" />
                      Like ({post.likes_count || 0})
                    </button>

                    <button className="flex items-center justify-center w-1/3 py-2 rounded-lg text-blue-600 hover:bg-blue-50">
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

                  {/* Add Comment dengan Button Kirim */}
                  <div id="comments-section" className="flex items-start mb-6">
                    <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center text-xs mr-3">
                      {currentUserId ? "ME" : "UU"}
                    </div>
                    <div
                      className="flex-1 flex"
                      onClick={() => {
                        setCurrentPostId(post.id);
                        if (
                          !comments[post.id] ||
                          comments[post.id].length === 0
                        ) {
                          fetchComments(post.id);
                        }
                      }}
                    >
                      <input
                        type="text"
                        className="flex-1 border rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddComment()
                        }
                      />
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg text-sm"
                        onClick={handleAddComment}
                      >
                        Kirim
                      </button>
                    </div>
                  </div>
                  {commentError && (
                    <p className="text-red-500 text-xs mt-1 mb-4">
                      {commentError}
                    </p>
                  )}

                  {/* Comments List - Selalu Tampil */}
                  <div className="mt-4 border-t pt-4">
                    {loadingComments[post.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : !comments[post.id] || comments[post.id].length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex items-start">
                            {comment.user?.photo ? (
                              <img
                                src={comment.user.photo}
                                className="rounded-full mr-3 w-8 h-8"
                                alt={comment.user?.name || "User"}
                              />
                            ) : (
                              <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center text-xs mr-3">
                                {comment.user?.initials || "UU"}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-sm">
                                    {comment.user?.name || "Unknown User"}
                                  </h4>
                                  <span className="text-gray-500 text-xs">
                                    {formatPostTime(comment.createdAt)}
                                  </span>
                                </div>

                                {editingCommentId === comment.id ? (
                                  <div className="mt-2 flex">
                                    <input
                                      type="text"
                                      className="flex-1 border rounded-l-lg px-3 py-2 text-sm"
                                      value={commentText}
                                      onChange={(e) =>
                                        setCommentText(e.target.value)
                                      }
                                    />
                                    <button
                                      className="bg-blue-500 text-white px-3 py-2 rounded-r-lg text-sm"
                                      onClick={() =>
                                        handleUpdateComment(comment.id)
                                      }
                                    >
                                      Update
                                    </button>
                                    <button
                                      className="bg-gray-500 text-white px-3 py-2 rounded-r-lg text-sm ml-1"
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setCommentText("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm mt-1">
                                    {comment.content}
                                  </p>
                                )}
                              </div>

                              {/* Comment Actions */}
                              <div className="flex items-center mt-2 space-x-4">
                                <button
                                  className="text-blue-500 text-xs hover:underline"
                                  onClick={() => {
                                    setReplyingTo(comment.id);
                                    setReplyToUser(comment.user);
                                  }}
                                >
                                  Reply
                                </button>

                                <button
                                  className="text-gray-500 text-xs hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedComment(comment);
                                    setShowCommentOptions(true);
                                  }}
                                >
                                  <Ellipsis size={14} />
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

                              {/* Reply Form */}
                              {replyingTo === comment.id && (
                                <div className="mt-3 flex items-start">
                                  <div className="rounded-full bg-gray-200 w-6 h-6 flex items-center justify-center text-xxs mr-2">
                                    {currentUserId ? "ME" : "UU"}
                                  </div>
                                  <div className="flex-1 flex">
                                    <input
                                      type="text"
                                      className="flex-1 border rounded-l-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={`Reply to ${
                                        comment.user?.name || "user"
                                      }...`}
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                    />
                                    <button
                                      className="bg-blue-500 text-white px-3 py-1 rounded-r-lg text-xs"
                                      onClick={() =>
                                        handleReply(comment.id, replyToUser)
                                      }
                                    >
                                      Post
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Replies Section */}
                              {expandedReplies[comment.id] && (
                                <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-200 space-y-3">
                                  {(Array.isArray(allReplies[comment.id])
                                    ? allReplies[comment.id]
                                    : comment.replies || []
                                  ).map((reply) => (
                                    <ReplyItem key={reply.id} reply={reply} />
                                  ))}

                                  {comment.repliesCount >
                                    (allReplies[comment.id]?.length ||
                                      comment.replies?.length ||
                                      0) && (
                                    <button
                                      className="text-blue-500 text-xs"
                                      onClick={() =>
                                        fetchAllReplies(comment.id)
                                      }
                                    >
                                      Load more replies...
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

                {/* Report Option */}
                <button
                  className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex items-center"
                  onClick={() => handlePostAction("report")}
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
      </div>
    </Case>
  );
}
