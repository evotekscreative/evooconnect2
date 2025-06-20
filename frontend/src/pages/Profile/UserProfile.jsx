"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Link, useParams } from "react-router-dom";
import Case from "../../components/Case";
import {
  Briefcase,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bookmark,
  GraduationCap,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  ThumbsUp,
  MessageCircle,
  Share2,
  Mail,
  Phone,
  MapPin,
  Building,
  Link2,
  X,
  UserPlus,
  Check,
} from "lucide-react";
import Alert from "../../components/Auth/Alert";
import axios from "axios";

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
  { name: "github", icon: <Github className="w-5 h-5" />, color: "text-black" },
];

export default function UserProfile() {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditEducationModal, setEditShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [educations, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [editingExperience, setEditingExperience] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const { username } = useParams(); // Get username from URL
  const [userData, setUserData] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [profileViews, setProfileViews] = useState({
    thisWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
    dailyViews: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loadingConnection, setLoadingConnection] = useState(false);

  const [user, setUser] = useState({
    id: "",
    name: "",
    headline: "",
    about: "",
    skills: [],
    socials: {},
    photo: null,
    email: "",
    phone: "",
    location: "",
    organization: "",
    website: "",
    birthdate: "",
    gender: "",
  });

  // Education Form State
  const [educationForm, setEducationForm] = useState({
    major: "",
    institute_name: "",
    location: "",
    start_month: "Month",
    start_year: "Year",
    end_month: "Month",
    end_year: "Year",
    caption: "",
    schoolLogo: null,
  });

  // Experience Form State
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    start_month: "Month",
    start_year: "Year",
    end_month: "Month",
    end_year: "Year",
    caption: "",
    photo: null,
  });

  // Date options
  const months = [
    "Month",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showAlert = (type, message) => {
    setAlert({
      show: true,
      type,
      message,
    });
    setTimeout(() => {
      setAlert({ ...alert, show: false });
    }, 5000); // Auto-hide after 5 seconds
  };

  const years = [
    "Year",
    ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i),
  ];

  const handleConnectWithUser = async () => {
    if (!user.id) return;

    setLoadingConnection(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/users/${user.id}/connect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Periksa response untuk menentukan status baru
      const newStatus = response.data.data?.status || "connected";
      // setIsConnected(newStatus === "connected");
      setConnectionStatus(newStatus);

      // Refresh data koneksi
      await fetchConnections();

      showAlert(
        "success",
        newStatus === "connected"
          ? "Connected successfully!"
          : "Connection request sent!"
      );
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnected(false);
      setConnectionStatus(null);
      showAlert(
        "error",
        error.response?.data?.data || "Users are already connected"
      );
    } finally {
      setLoadingConnection(false);
    }
  };

  const fetchConnections = useCallback(async () => {
    if (!user.id) return;

    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/connections`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const connectionsData = response.data.data.connections || [];
      setConnections(connectionsData);
      setConnectionsCount(response.data.data.total || 0);

      // Periksa status koneksi yang lebih akurat
      const connectionStatus = response.data.data.connection_status;
      // setIsConnected(connectionStatus === "connected");
      setConnectionStatus(connectionStatus);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setIsConnected(false);
      setConnectionStatus(null);
    }
  }, [user.id, apiUrl]);

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
      showAlert("error", "Failed to load profile data");
    }
  };

  const fetchUserPosts = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const userId = user.id;
      const response = await axios.get(
        `${apiUrl}/api/users/${userId}/posts?limit=10&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure we always set an array, even if response.data.data is null/undefined
      setUserPosts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
      showAlert("error", "Failed to load posts");
      setUserPosts([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

        const data = response.data.data;

        // Convert socials array to object
        const socialsObject = {};
        if (data.socials && Array.isArray(data.socials)) {
          data.socials.forEach((social) => {
            socialsObject[social.platform] = social.username;
          });
        }

        // Handle skills data
        let userSkills = [];
        if (data.skills) {
          if (Array.isArray(data.skills)) {
            userSkills = data.skills;
          } else if (data.skills.String) {
            userSkills = [data.skills.String];
          }
        }

        setUser({
          id: data.id || "",
          name: data.name || "",
          headline: data.headline || "",
          about: data.about || "",
          skills: userSkills,
          socials: socialsObject,
          photo: data.photo || null,
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          organization: data.organization || "",
          website: data.website || "",
          birthdate: data.birthdate || "",
          gender: data.gender || "",
        });

        setProfileImage(data.photo || null);

        setIsConnected(data.is_connected);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        showAlert("error", "Failed to load profile views");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const fetchEducations = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/education`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEducation(response.data.data.educations);
    } catch (error) {
      console.error("Failed to fetch education:", error);
      showAlert("error", "Failed to load education data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExperiences = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/users/${user.id}/experience?limit=10&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExperiences(
        Array.isArray(response.data.data.experiences)
          ? response.data.data.experiences
          : []
      );
    } catch (error) {
      console.error("Failed to fetch experience:", error);
      showAlert("error", "Failed to load experience data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchConnections();
      fetchUserPosts();
      fetchEducations();
      fetchExperiences();
    }
  }, [user.id]);

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducationForm({
      ...educationForm,
      [name]: value,
    });
  };

  const handleExperienceFileChange = (e) => {
    setExperienceForm({
      ...experienceForm,
      photo: e.target.files[0],
    });
  };

  const handleEducationFileChange = (e) => {
    setEducationForm({
      ...educationForm,
      schoolLogo: e.target.files[0],
    });
  };

  // Format date for display
  const formatDate = (month, year) => {
    if (month === "Month" || year === "Year") return "";
    return `${month} ${year}`;
  };

  // Scroll handlers for post
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

  const deleteExperience = async (experienceId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/experience/${experienceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExperiences((prev) =>
        Array.isArray(prev) ? prev.filter((exp) => exp.id !== experienceId) : []
      );
      showAlert("success", "Experience deleted successfully!");
    } catch (error) {
      console.error("Failed to delete experience:", error);
      showAlert("error", "Failed to delete experience. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      <Case />

      <div className="w-full px-4 py-6 mx-auto sm:px-6">
        <div className="flex flex-col justify-center max-w-6xl gap-6 mx-auto md:flex-row">
          <div className="fixed top-4 right-4 z-50">
            <Alert
              type={alert.type}
              message={alert.message}
              isVisible={alert.show}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          </div>
          {/* Left Sidebar */}
          <div className="w-full space-y-4 md:w-1/3">
            <div className="p-6 text-center bg-white rounded-lg shadow-md">
              <div className="relative flex items-center justify-center mx-auto overflow-hidden bg-gray-200 rounded-full w-28 h-28">
                {profileImage ? (
                  <img
                    src={apiUrl + "/" + profileImage}
                    alt="Profile"
                    className="object-cover w-full h-full"
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
              <div className="mt-2">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Contact Information
                </button>
              </div>
              <div className="mt-5 space-y-2 text-left">
                <Link
                  to={`/list-connection/${username}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2 text-base">
                    <Users size={18} /> Connections
                  </span>
                  <span className="text-lg font-bold">{connectionsCount}</span>
                </Link>
              </div>

              {/* Replace the existing button with this one */}
              <div className="mt-2">
                <button
                  onClick={handleConnectWithUser}
                  disabled={
                    isConnected ||
                    connectionStatus === "pending" ||
                    loadingConnection
                  }
                  className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                    isConnected
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white"
                      : connectionStatus === "pending"
                      ? "bg-blue-100 text-blue-800 cursor-default"
                      : "border border-blue-500 text-blue-500 <hover:bg-sky-5></hover:bg-sky-5>00"
                  } flex items-center justify-center`}
                >
                  {loadingConnection ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Processing...
                    </>
                  ) : isConnected ? (
                    <>
                      <Check className="w-4 h-4 mr-1" /> Connected
                    </>
                  ) : connectionStatus === "pending" ? (
                    "Request Sent"
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" /> Connect
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Skills Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Skills</h3>
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

            {/* Social Media Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-2 text-lg font-semibold">Social Media</h3>
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
                        <span className="text-base truncate">@{username}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-base text-gray-500">
                  No social media added yet.
                </p>
              )}
            </div>
          </div>

          {/* Right Main Section */}
          <div className="w-full space-y-4 md:w-2/3">
            {/* About Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">About You</h3>
              <p className="mt-3 text-base text-gray-600">
                {user.about || "No information provided yet."}
              </p>
            </div>

            {/* Experience Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={20} className="text-[#00AEEF]" />
                  <h3 className="text-lg font-semibold">Experience</h3>
                </div>
              </div>

              {experiences?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="pb-6 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-4">
                        {exp.photo ? (
                          <img
                            src={apiUrl + "/" + exp.photo}
                            alt="Company logo"
                            className="object-cover w-12 h-12 rounded-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-md">
                            <Briefcase className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{exp.jobTitle}</h4>
                          <p className="text-gray-600">{exp.companyName}</p>
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{exp.job_title}</h4>
                          </div>
                          <p className="text-gray-600">{exp.company_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(exp.start_month, exp.start_year)} -{" "}
                            {exp.end_month === "Month" ||
                              exp.end_year === "Year"
                              ? "Present"
                              : formatDate(exp.end_month, exp.end_year)}
                          </p>
                          {exp.location && (
                            <p className="text-sm text-gray-500">
                              {exp.location}
                            </p>
                          )}
                          {exp.caption && (
                            <p className="mt-2 text-gray-600">{exp.caption}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 mt-4 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
                  <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-base text-gray-500">
                    No experience added yet.
                  </p>
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#00AEEF]" />
                  <h3 className="text-lg font-semibold">Education</h3>
                </div>
                <div className="flex items-center gap-3"></div>
              </div>

              {educations?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="pb-6 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-4">
                        {edu.photo ? (
                          <img
                            src={apiUrl + "/" + edu.photo}
                            alt="School logo"
                            className="object-cover w-12 h-12 rounded-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-md">
                            <GraduationCap className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{edu.major}</h4>
                          </div>
                          <p className="text-gray-600">{edu.institute_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(edu.start_month, edu.start_year)} -{" "}
                            {edu.end_month === "Month" ||
                              edu.end_year === "Year"
                              ? "Present"
                              : formatDate(edu.end_month, edu.end_year)}
                          </p>
                          {edu.location && (
                            <p className="text-sm text-gray-500">
                              {edu.location}
                            </p>
                          )}
                          {edu.caption && (
                            <p className="mt-2 text-gray-600">{edu.caption}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 mt-4 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
                  <GraduationCap
                    size={40}
                    className="mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-base text-gray-500">
                    No education added yet.
                  </p>
                </div>
              )}
            </div>

            {/* post Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-[#00AEEF]" />
                  <h3 className="text-lg font-semibold">POST</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={scrollLeft}
                    className="p-1 transition bg-gray-100 rounded-full hover:bg-gray-200"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="p-1 transition bg-gray-100 rounded-full hover:bg-gray-200"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable container */}
              <div
                id="post-container"
                className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide"
              >
                {userPosts?.length > 0 ? (
                  userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex-shrink-0 w-64 overflow-hidden bg-white border rounded-lg shadow-sm"
                    >
                      {/* Post header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                            {profileImage ? (
                              <img
                                src={apiUrl + "/" + profileImage}
                                alt="Profile"
                                className="object-cover w-full h-full"
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
                          <div>
                            <h4 className="text-sm font-semibold">
                              {user.name}
                            </h4>
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
                      </div>

                      {/* Post content */}
                      <div className="p-4">
                        <Link
                          to={`/post/${post.id}`}
                          className="mb-3 text-sm text-gray-700"
                        >
                          <div
                            className="prose max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          />

                          {/* Only show image if exists */}
                          {post.images && post.images.length > 0 && (
                            <div className="mb-3">
                              <img
                                src={apiUrl + "/" + post.images[0]}
                                alt={`Post ${post.id}`}
                                className="w-full rounded-md"
                              />
                            </div>
                          )}
                        </Link>

                        {/* Post footer */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <ThumbsUp size={14} />
                            <span>{post.likes_count || 0}</span>
                          </div>
                          <div className="flex gap-2">
                            <span>{post.comments_count || 0} comments</span>
                            <span>{post.shares_count || 0} shares</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <Link to={`/post-page/${username}`}>
                          <div className="flex pt-2 mt-3 border-t">
                            <button className="flex items-center justify-center flex-1 gap-1 py-1 text-sm text-gray-600 rounded hover:bg-gray-50">
                              <ThumbsUp size={16} /> Like
                            </button>
                            <button className="flex items-center justify-center flex-1 gap-1 py-1 text-sm text-gray-600 rounded hover:bg-gray-50">
                              <MessageCircle size={16} /> Comment
                            </button>
                            <button className="flex items-center justify-center flex-1 gap-1 py-1 text-sm text-gray-600 rounded hover:bg-gray-50">
                              <Share2 size={16} /> Share
                            </button>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center">
                    <p className="text-gray-500">No posts yet</p>
                  </div>
                )}
              </div>

              <style>{`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
              <div className="flex justify-center mt-4">
                <button className="text-[#00AEEF] text-asmibold font-semibold hover:underline">
                  <Link to={`/post-page/${username}`}> See All Post </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={20} className="text-[#00AEEF]" />
              <h2 className="text-xl font-bold">
                {editingExperience ? "Edit Experience" : "Add Experience"}
              </h2>
            </div>
            <form onSubmit={handleExperienceSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="job_title"
                    placeholder="Job Title *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={experienceForm.job_title}
                    onChange={handleExperienceChange}
                    required
                  />
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Company Name *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={experienceForm.company_name}
                    onChange={handleExperienceChange}
                    required
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location (City, Country)"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={experienceForm.location}
                    onChange={handleExperienceChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Start Date *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="start_month"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.start_month}
                        onChange={handleExperienceChange}
                        required
                      >
                        {months.map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="start_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.start_year}
                        onChange={handleExperienceChange}
                        required
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      End Date
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="end_month"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.end_month}
                        onChange={handleExperienceChange}
                      >
                        {months.map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="end_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.end_year}
                        onChange={handleExperienceChange}
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    name="caption"
                    placeholder="Description"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    rows={4}
                    value={experienceForm.caption}
                    onChange={handleExperienceChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    onChange={handleExperienceFileChange}
                  />
                  {experienceForm.photo &&
                    !(experienceForm.photo instanceof File) && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Current logo:</p>
                        <img
                          src={apiUrl + "/" + experienceForm.photo}
                          alt="Company logo"
                          className="object-contain w-20 h-20 mt-1"
                        />
                      </div>
                    )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                {editingExperience && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this experience?"
                        )
                      ) {
                        deleteExperience(editingExperience.id);
                        setShowExperienceModal(false);
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-red-500 transition rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Experience
                  </button>
                )}

                {/* Spacer to push other buttons to right when delete is shown */}
                <div className={editingExperience ? "flex-grow" : ""}></div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 transition border rounded hover:bg-gray-50"
                    onClick={() => {
                      setShowExperienceModal(false);
                      setEditingExperience(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#00AEEF] text-white hover:bg-[#0099d6] transition"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : editingExperience
                        ? "Update"
                        : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={20} className="text-[#00AEEF]" />
              <h2 className="text-xl font-bold">
                {editingEducation ? "Edit Education" : "Add Education"}
              </h2>
            </div>
            <form onSubmit={handleEducationSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="major"
                    placeholder="Degree *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.major}
                    onChange={handleEducationChange}
                    required
                  />
                  <input
                    type="text"
                    name="institute_name"
                    placeholder="School Name *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.institute_name}
                    onChange={handleEducationChange}
                    required
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location (City, Country)"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.location}
                    onChange={handleEducationChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Start Date *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="start_month"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.start_month}
                        onChange={handleEducationChange}
                        required
                      >
                        {months.map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="start_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.start_year}
                        onChange={handleEducationChange}
                        required
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      End Date
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="end_month"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.end_month}
                        onChange={handleEducationChange}
                      >
                        {months.map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="end_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.end_year}
                        onChange={handleEducationChange}
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    name="caption"
                    placeholder="Description"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    rows={4}
                    value={educationForm.caption}
                    onChange={handleEducationChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    School Logo
                  </label>
                  <input
                    type="file"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    onChange={handleEducationFileChange}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                {editingEducation && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this education?"
                        )
                      ) {
                        deleteEducation(editingEducation.id);
                        setShowEducationModal(false);
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-red-500 transition rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Education
                  </button>
                )}

                <div className={editingEducation ? "flex-grow" : ""}></div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 transition border rounded hover:bg-gray-50"
                    onClick={() => {
                      setShowEducationModal(false);
                      setEditingEducation(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#00AEEF] text-white hover:bg-[#0099d6] transition"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : editingEducation
                        ? "Update"
                        : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Education Modal */}
      {showEditEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={20} className="text-[#00AEEF]" />
              <h2 className="text-xl font-bold">Edit Education</h2>
            </div>
            <form onSubmit={handleEditEducationSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="major"
                    placeholder="Degree *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.major}
                    onChange={handleEducationChange}
                    required
                  />
                  <input
                    type="text"
                    name="institute_name"
                    placeholder="School Name *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.institute_name}
                    onChange={handleEducationChange}
                    required
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location (City, Country)"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.location}
                    onChange={handleEducationChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Start Date *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="start_month"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.start_month}
                        onChange={handleEducationChange}
                        required
                      >
                        {months.map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="start_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.start_year}
                        onChange={handleEducationChange}
                        required
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      End Date
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="end_month"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.end_month}
                        onChange={handleEducationChange}
                      >
                        {months.map((month, index) => (
                          <option key={index} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="end_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.end_year}
                        onChange={handleEducationChange}
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    name="caption"
                    placeholder="Description"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    rows={4}
                    value={educationForm.caption}
                    onChange={handleEducationChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    School Logo
                  </label>
                  <input
                    type="file"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    onChange={handleEducationFileChange}
                  />
                  {editingEducation?.photo && !educationForm.schoolLogo && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Current logo:</p>
                      <img
                        src={apiUrl + "/" + editingEducation.photo}
                        alt="Current school logo"
                        className="h-12 mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-red-500 transition border rounded hover:bg-gray-50 hover:text-red-700"
                  onClick={() => {
                    if (editingEducation?.id) {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this education?"
                        )
                      ) {
                        handleDeleteEducation(editingEducation.id);
                      }
                    }
                  }}
                  disabled={isLoading}
                >
                  Delete Education
                </button>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 transition border rounded hover:bg-gray-50"
                    onClick={() => {
                      setEditShowEducationModal(false);
                      setEditingEducation(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#00AEEF] text-white hover:bg-[#0099d6] transition"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Education"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-8 transition-all duration-300 ease-in-out transform scale-100 bg-white shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Contact Information
              </h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 text-gray-400 transition rounded-md hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-8 mt-6 text-base text-gray-700 md:grid-cols-2">
              {/* Contact Details */}
              <section>
                <h3 className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-600">
                  <Mail size={18} className="text-blue-600" />
                  Contact Details
                </h3>
                <div className="pl-6 space-y-3">
                  {user.email ? (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <a
                        href={`mailto:${user.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.email}
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-400">No email provided</p>
                  )}

                  {user.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <a
                        href={`tel:${user.phone.replace(/[^0-9]/g, "")}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.phone}
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-400">No phone number provided</p>
                  )}

                  {user.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{user.location}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">No location provided</p>
                  )}
                </div>
              </section>

              {/* Professional Details */}
              <section>
                <h3 className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-600">
                  <Building size={18} className="text-blue-600" />
                  Professional Details
                </h3>
                <div className="pl-6 space-y-3">
                  {user.organization ? (
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-400" />
                      <span>{user.organization}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">No organization provided</p>
                  )}

                  {user.website ? (
                    <div className="flex items-center gap-2">
                      <Link2
                        size={16}
                        className="flex-shrink-0 mt-1 text-gray-400"
                      />
                      <a
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `https://${user.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 break-all hover:underline"
                      >
                        {user.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-400">No website provided</p>
                  )}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowContactModal(false)}
                className="rounded-md bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
