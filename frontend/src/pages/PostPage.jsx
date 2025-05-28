import React from "react";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  Share2,
  Send,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";
import Case from "../components/Case.jsx";
import axios from "axios";
import { toast } from "sonner";

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
      toast.error("Failed to load connections");
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
      toast.error("Failed to load profile views");
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

  const fetchUserPosts = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${userId}/posts?limit=10&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserPosts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
      toast.error("Failed to load posts");
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
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
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
    }
  }, [user.id]);

  const scrollLeft = () => {
    document
      .getElementById("post-container")
      .scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    document
      .getElementById("post-container")
      .scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
    try {
      const userToken = localStorage.getItem("token");

      // Optimistic UI update
      setUserPosts((prevPosts) =>
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
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Failed to like post:", error);

      // Rollback on error
      setUserPosts((prevPosts) =>
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

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setShowCommentModal(true);
    fetchComments(postId);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
    setCommentText("");
  };

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

      setComments((prev) => ({
        ...prev,
        [postId]: response.data?.data?.comments || [],
      }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setCommentError("Failed to load comments");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
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

      setUserPosts((prevPosts) =>
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
      toast.success("Successfully added comment!");
    } catch (error) {
      toast.error("Failed to add comment");
      setCommentError(
        error.response?.data?.message ||
          "Failed to add comment. Please try again."
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

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
              {/* Di komponen gambar profil */}
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
                  to="/list-connection"
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <span className="flex items-center gap-2 text-base">
                    <Users size={18} /> Connections
                  </span>
                  <span className="font-bold text-lg">{connectionsCount}</span>
                </Link>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                  <span className="flex items-center gap-2 text-base">
                    <Eye size={18} /> Views
                  </span>
                  <span className="font-bold text-lg">
                    {profileViews.thisWeek}
                  </span>
                </div>
                <Link
                  to="/job-saved"
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Bookmark size={18} /> Job Saved
                  </span>
                  <span className="font-bold text-base">120</span>
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
              {/* Sample Post */}
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border rounded-lg shadow-sm p-4 mb-4"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      {/* Di bagian post */}
                      {user.photo ? (
                        <img
                          src={
                            user.photo.startsWith("http")
                              ? user.photo
                              : `${apiUrl}/${user.photo}`
                          }
                          alt="profile"
                          className="rounded-full w-12 h-12 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.className =
                              "rounded-full w-12 h-12 bg-gray-200 flex items-center justify-center";
                            e.target.outerHTML = `
        <div class="rounded-full w-12 h-12 bg-gray-200 flex items-center justify-center">
          <span class="text-lg font-bold">
            ${user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
      `;
                          }}
                        />
                      ) : (
                        <div className="rounded-full w-12 h-12 bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-sm">{user.name}</h2>
                        <p className="text-xs text-gray-500">
                          {user.headline || "No headline"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(post.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          • 🌐
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="mt-3 text-sm">
                                       <div
  className="prose max-w-none text-gray-700 ck-content custom-post-content"
  dangerouslySetInnerHTML={{ __html: post.content }}
/>
                      {post.images && post.images.length > 0 && (
                        <img
                          src={apiUrl + "/" + post.images[0]}
                          alt={`Post ${post.id}`}
                          className="mt-2 w-full rounded-lg border object-cover"
                        />
                      )}
                    </div>

                    {/* Footer */}
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
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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
                Array.isArray(comments[currentPostId]) &&
                comments[currentPostId].map((comment) => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex items-start mb-2">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full border-2 border-white ml-3 mt-2 relative z-10">
                        <span className="text-lg font-bold text-gray-600">
                          {comment.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "UU"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                          <div className="font-semibold text-xs md:text-sm">
                            {comment.user?.name || "Unknown User"}
                          </div>
                          <p className="text-xs md:text-sm">
                            {comment.content}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 md:p-4 border-t">
              <div className="flex items-center mb-2">
                <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-xxs md:text-xs mr-2 md:mr-3">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
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
                <span className="text-red-500 text-center text-xs font-medium mb-4">
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
    </div>
  );
};

export default PostPage;
