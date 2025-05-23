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
import { Link, useParams } from "react-router-dom";
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
} from "lucide-react";
import Case from "../components/Case.jsx";
import axios from "axios";
import { toast } from "sonner";

const PostPage = () => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const { username } = useParams();

  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
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

  const fetchUserPosts = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
 
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/posts?limit=10&offset=0`,
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
      const response = await axios.get(
        apiUrl + "/api/user-profile/" + username,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      if (response.data.data.skills && response.data.data.skills.Valid) {
        userSkills = Array.isArray(response.data.data.skills.String)
          ? response.data.data.skills.String
          : response.data.data.skills.String
          ? [response.data.data.skills.String]
          : [];
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
  }, []);

  useEffect(() => {
    if (user.id) {
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
              <div className="relative w-28 h-28 mx-auto bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={apiUrl + "/" + profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
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
                  <span className="flex items-center gap-2 text-sm">
                    <Users size={18} /> Connections
                  </span>
                  <span className="font-bold text-base">358</span>
                </Link>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                  <span className="flex items-center gap-2 text-sm">
                    <Clock size={18} /> Views
                  </span>
                  <span className="font-bold text-base">85</span>
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
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  No skills added yet.
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
                        <span className="text-sm">@{username}</span>
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
                      {profileImage ? (
                        <img
                          src={apiUrl + '/' + post.user.photo}
                          alt="profile"
                          className="rounded-full w-12 h-12 object-cover"
                        />
                      ) : (
                        <div className="rounded-full w-12 h-12 bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            { post.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-sm">{post.user.name}</h2>
                        <p className="text-xs text-gray-500">
                          {post.user.headline || "No headline"}
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
                      <p className="text-gray-700">
                        {post.content || "No content"}
                      </p>
                      {post.images && post.images.length > 0 && (
                        <img
                          src={apiUrl + "/" + post.images[0]}
                          alt={`Post ${post.id}`}
                          className="mt-2 w-full rounded-lg border object-cover"
                        />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-gray-600 text-sm mt-3">
                      <button className="flex items-center gap-1 hover:text-blue-600">
                        <ThumbsUp size={16} /> {post.likes_count || 0} Suka
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-600">
                        <MessageCircle size={16} /> {post.comments_count || 0}{" "}
                        Komentar
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-600">
                        <Share2 size={16} /> Bagikan
                      </button>
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
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-sm mb-3">
                People you might know
              </h3>

              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-2">
                  <img
                    src="/api/placeholder/40/40"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Bintang Asydqi</div>
                  <div className="text-gray-500 text-xs">
                    Student at Alexander
                  </div>
                </div>
                <div className="text-blue-500">
                  <svg
                    className="w-5 h-5"
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
    </div>
  );
};

export default PostPage;