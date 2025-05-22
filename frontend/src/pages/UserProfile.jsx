"use client";

import { useState, useEffect } from "react";
import { Link, useParams  } from "react-router-dom";
import Case from "../components/Case";
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
} from "lucide-react";
import { Toaster, toast } from "sonner";
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
      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

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

  // Initialize user state with empty values
  const [user, setUser] = useState({
    id: "",
    name: "",
    headline: "",
    about: "",
    skills: [],
    socials: {},
    photo: null,
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

  const years = [
    "Year",
    ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i),
  ];

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
    toast.error("Failed to load posts");
    setUserPosts([]); // Set to empty array on error
  } finally {
    setIsLoading(false);
  }
};

  // Fetch user profile data
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/user-profile/${username}`,
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
        about: response.data.data.about || "",
        skills: response.data.data.skills,
        socials: socialsObject,
        photo: response.data.data.photo || null,
      });

      // Set profile image separately if needed
      setProfileImage(response.data.data.photo || null);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

   
  useEffect(() => {
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
      toast.error("Failed to load education data");
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
      toast.error("Failed to load experience data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user.id) {
      fetchEducations();
      fetchExperiences();
      fetchUserPosts();
    }
  }, [user.id]);

  // Handle Education Form Submission
  // Handle Experience Form Submission
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("job_title", experienceForm.job_title);
      formData.append("company_name", experienceForm.company_name);
      formData.append("location", experienceForm.location);
      formData.append("start_month", experienceForm.start_month);
      formData.append("start_year", experienceForm.start_year);
      formData.append("end_month", experienceForm.end_month);
      formData.append("end_year", experienceForm.end_year);
      formData.append("caption", experienceForm.caption);

      if (experienceForm.photo instanceof File) {
        formData.append("photo", experienceForm.photo);
      }

      // If editing, make PUT request
      if (editingExperience) {
        const response = await axios.put(
          `${apiUrl}/api/experience/${editingExperience.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === editingExperience.id ? response.data.data : exp
          )
        );
        toast.success("Experience updated successfully!");
        setEditingExperience(null);
      } else {
        // If adding new, make POST request
        const response = await axios.post(
          apiUrl + "/api/experience",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExperiences((prev) => [...prev, response.data.data]);
        toast.success("Experience added successfully!");
      }

      // Reset form and close modal
      setShowExperienceModal(false);
      setExperienceForm({
        job_title: "",
        company_name: "",
        location: "",
        start_month: "Month",
        start_year: "Year",
        end_month: "Month",
        end_year: "Year",
        caption: "",
        photo: null,
      });
    } catch (error) {
      console.error("Failed to add/update experience:", error);
      toast.error(
        `Failed to ${
          editingExperience ? "update" : "add"
        } experience. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Education Form Submission
  const handleEducationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("major", educationForm.major);
      formData.append("institute_name", educationForm.institute_name);
      formData.append("location", educationForm.location);
      formData.append("start_month", educationForm.start_month);
      formData.append("start_year", educationForm.start_year);
      formData.append("end_month", educationForm.end_month);
      formData.append("end_year", educationForm.end_year);
      formData.append("caption", educationForm.caption);

      if (educationForm.schoolLogo instanceof File) {
        formData.append("photo", educationForm.schoolLogo);
      }

      if (editingEducation) {
        // Edit existing education
        const response = await axios.put(
          `${apiUrl}/api/education/${editingEducation.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEducation((prev) =>
          prev.map((edu) =>
            edu.id === editingEducation.id ? response.data.data : edu
          )
        );
        toast.success("Education updated successfully!");
        setEditingEducation(null);
      } else {
        // Add new education
        const response = await axios.post(
          apiUrl + "/api/education",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEducation((prev) => [...prev, response.data.data]);
        toast.success("Education added successfully!");
      }

      setShowEducationModal(false);
      setEducationForm({
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
    } catch (error) {
      console.error("Failed to add/update education:", error);
      toast.error(
        `Failed to ${
          editingEducation ? "update" : "add"
        } education. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditEducation = (education) => {
    setEditingEducation(education);

    // Parse start date
    let startMonth = "Month";
    let startYear = "Year";
    if (education.start_date) {
      const startParts = education.start_date.split(" ");
      if (startParts.length === 2) {
        startMonth = startParts[0];
        startYear = startParts[1];
      }
    }

    // Parse end date
    let endMonth = "Month";
    let endYear = "Year";
    if (education.end_date && education.end_date !== "Present") {
      const endParts = education.end_date.split(" ");
      if (endParts.length === 2) {
        endMonth = endParts[0];
        endYear = endParts[1];
      }
    }

    setEducationForm({
      major: education.major || "",
      institute_name: education.institute_name || "",
      location: education.location || "",
      start_month: startMonth,
      start_year: startYear,
      end_month: endMonth,
      end_year: endYear,
      caption: education.caption || "",
      schoolLogo: education.photo || null,
    });

    setShowEducationModal(true);
  };

  const deleteEducation = async (educationId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/education/${educationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEducation((prev) =>
        Array.isArray(prev) ? prev.filter((edu) => edu.id !== educationId) : []
      );
      toast.success("Education deleted successfully!");
    } catch (error) {
      console.error("Failed to delete education:", error);
      toast.error("Failed to delete education. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle Form Changes
  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setExperienceForm({
      ...experienceForm,
      [name]: value,
    });
  };

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

  const handleEditExperience = (experience) => {
    setEditingExperience(experience);

    // Parse start date
    let startMonth = "Month";
    let startYear = "Year";
    if (experience.start_date) {
      const startParts = experience.start_date.split(" ");
      if (startParts.length === 2) {
        startMonth = startParts[0];
        startYear = startParts[1];
      }
    }

    // // Parse end date
    let endMonth = "Month";
    let endYear = "Year";
    if (experience.end_date && experience.end_date !== "Present") {
      const endParts = experience.end_date.split(" ");
      if (endParts.length === 2) {
        endMonth = endParts[0];
        endYear = endParts[1];
      }
    }

    setExperienceForm({
      job_title: experience.job_title || "",
      company_name: experience.company_name || "",
      location: experience.location || "",
      start_month: startMonth,
      start_year: startYear,
      end_month: endMonth,
      end_year: endYear,
      caption: experience.caption || "",
      photo: experience.photo || null,
    });

    setShowExperienceModal(true);
  };

  const deleteExperience = async (experienceId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${apiUrl}/api/experience/${experienceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExperiences((prev) =>
        Array.isArray(prev) ? prev.filter((exp) => exp.id !== experienceId) : []
      );
      toast.success("Experience deleted successfully!");
    } catch (error) {
      console.error("Failed to delete experience:", error);
      toast.error("Failed to delete experience. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      <Toaster position="top-right" richColors />
      <Case />

      <div className="w-full mx-auto py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-center">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
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
                  <span className="flex items-center gap-2 text-base">
                    <Users size={18} /> Connections
                  </span>
                  <span className="font-bold text-lg">358</span>
                </Link>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                  <span className="flex items-center gap-2 text-base">
                    <Eye size={18} /> Views
                  </span>
                  <span className="font-bold text-lg">85</span>
                </div>
                {/* </Link> */}
                <Link
                  to="/job-saved"
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <span className="flex items-center gap-2 text-base">
                    <Bookmark size={18} /> Job Saved
                  </span>
                  <span className="font-bold text-lg">120</span>
                </Link>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg">Skills</h3>
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-2">Social Media</h3>
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
                        <span className="text-base">@{username}</span>
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
          <div className="w-full md:w-2/3 space-y-4">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg">About You</h3>
              <p className="text-base text-gray-600 mt-3">
                {user.about || "No information provided yet."}
              </p>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={20} className="text-[#00AEEF]" />
                  <h3 className="font-semibold text-lg">Experience</h3>
                </div>

              </div>

              {experiences?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-4">
                        {exp.photo ? (
                          <img
                            src={apiUrl + "/" + exp.photo}
                            alt="Company logo"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                            <Briefcase className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{exp.jobTitle}</h4>
                          <p className="text-gray-600">{exp.companyName}</p>
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{exp.job_title}</h4>
                          
                          </div>
                          <p className="text-gray-600">{exp.company_name}</p>
                          <p className="text-gray-500 text-sm">
                            {formatDate(exp.start_month, exp.start_year)} -{" "}
                            {exp.end_month === "Month" ||
                            exp.end_year === "Year"
                              ? "Present"
                              : formatDate(exp.end_month, exp.end_year)}
                          </p>
                          {exp.location && (
                            <p className="text-gray-500 text-sm">
                              {exp.location}
                            </p>
                          )}
                          {exp.caption && (
                            <p className="text-gray-600 mt-2">{exp.caption}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
                  <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-base text-gray-500">
                    No experience added yet.
                  </p>
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#00AEEF]" />
                  <h3 className="font-semibold text-lg">Education</h3>
                </div>
                <div className="flex items-center gap-3">
                </div>
              </div>

              {educations?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-4">
                        {edu.photo ? (
                          <img
                            src={apiUrl + "/" + edu.photo}
                            alt="School logo"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                            <GraduationCap className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{edu.major}</h4>
                            
                          </div>
                          <p className="text-gray-600">{edu.institute_name}</p>
                          <p className="text-gray-500 text-sm">
                            {formatDate(edu.start_month, edu.start_year)} -{" "}
                            {edu.end_month === "Month" ||
                            edu.end_year === "Year"
                              ? "Present"
                              : formatDate(edu.end_month, edu.end_year)}
                          </p>
                          {edu.location && (
                            <p className="text-gray-500 text-sm">
                              {edu.location}
                            </p>
                          )}
                          {edu.caption && (
                            <p className="text-gray-600 mt-2">{edu.caption}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
                  <GraduationCap
                    size={40}
                    className="mx-auto text-gray-300 mb-3"
                  />
                  <p className="text-base text-gray-500">
                    No education added yet.
                  </p>
                </div>
              )}
            </div>

            {/* post Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-[#00AEEF]" />
                  <h3 className="font-semibold text-lg">POST</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={scrollLeft}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable container */}
              <div
                id="post-container"
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
              >
                {userPosts?.length > 0 ? (
                  userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex-shrink-0 w-64 border rounded-lg overflow-hidden bg-white shadow-sm"
                    >
                      {/* Post header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
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
                          <div>
                            <h4 className="font-semibold text-sm">
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
                        <p className="text-sm text-gray-700 mb-3">
                          {post.content || "No content"}
                        </p>

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

                        {/* Post footer */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
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
                        <div className="flex border-t mt-3 pt-2">
                          <button className="flex-1 flex items-center justify-center gap-1 py-1 hover:bg-gray-50 rounded text-gray-600 text-sm">
                            <ThumbsUp size={16} /> Like
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 py-1 hover:bg-gray-50 rounded text-gray-600 text-sm">
                            <MessageCircle size={16} /> Comment
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 py-1 hover:bg-gray-50 rounded text-gray-600 text-sm">
                            <Share2 size={16} /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 w-full">
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
                  <Link to="/post-page"> See All Post </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
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
                    <label className="block text-sm font-medium mb-1">
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
                    <label className="block text-sm font-medium mb-1">
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
                  <label className="block text-sm font-medium mb-1">
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
                          className="w-20 h-20 object-contain mt-1"
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
                    className="px-4 py-2 rounded text-red-500 transition flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    className="px-4 py-2 rounded border hover:bg-gray-50 transition"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
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
                    <label className="block text-sm font-medium mb-1">
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
                    <label className="block text-sm font-medium mb-1">
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
                  <label className="block text-sm font-medium mb-1">
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
                    className="px-4 py-2 rounded text-red-500 transition flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    className="px-4 py-2 rounded border hover:bg-gray-50 transition"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
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
                    <label className="block text-sm font-medium mb-1">
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
                    <label className="block text-sm font-medium mb-1">
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
                  <label className="block text-sm font-medium mb-1">
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
                  className="px-4 py-2 rounded border hover:bg-gray-50 transition text-red-500 hover:text-red-700"
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
                    className="px-4 py-2 rounded border hover:bg-gray-50 transition"
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
    </div>
  );
}
