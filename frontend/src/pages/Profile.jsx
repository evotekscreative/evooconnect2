import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Pencil,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  User as UserIcon
} from "lucide-react";
import { Toaster, toast } from "sonner";
import axios from "axios";

const socialPlatforms = [
  { name: "instagram", icon: <Instagram className="w-5 h-5" />, color: "text-pink-500" },
  { name: "facebook", icon: <Facebook className="w-5 h-5" />, color: "text-blue-500" },
  { name: "twitter", icon: <Twitter className="w-5 h-5" />, color: "text-blue-400" },
  { name: "linkedin", icon: <Linkedin className="w-5 h-5" />, color: "text-blue-700" },
  { name: "github", icon: <Github className="w-5 h-5" />, color: "text-black" },
];

export default function ProfilePage() {
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showEditEducationModal, setEditShowEducationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [educations, setEducation] = useState([]);
  const [editingEducation, setEditingEducation] = useState(null);

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

  // User Data State
  const [user, setUser] = useState({
    id: "",
    name: "",
    headline: "",
    about: "",
    skills: [],
    socials: {},
    photo: null,
    experiences: [],
    educations: []
  });

  // Sample post data
  const [post] = useState([
    {
      id: 1,
      title: "Belajar Membuat Aplikasi Back-End untuk Pemula",
      provider: "Dicoding",
      date: "March 2023",
      image: "/api/placeholder/300/200",
      likes: 14,
      comments: 1,
    },
    {
      id: 2,
      title: "Sertifikat Kelas Belajar jQuery Dasar",
      provider: "CODEPOLITAN",
      date: "January 2023",
      image: "/api/placeholder/300/200",
      likes: 11,
      comments: 1,
    },
    {
      id: 3,
      title: "React.js Developer postificate",
      provider: "Meta",
      date: "December 2022",
      image: "/api/placeholder/300/200",
      likes: 19,
      comments: 2,
    },
    {
      id: 4,
      title: "Responsive Web Design",
      provider: "freeCodeCamp",
      date: "November 2022",
      image: "/api/placeholder/300/200",
      likes: 8,
      comments: 0,
    },
  ]);

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

  // Fetch user profile data
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get("http://localhost:3000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Convert socials array to object
      const socialsObject = {};
      if (response.data.data.socials && Array.isArray(response.data.data.socials)) {
        response.data.data.socials.forEach(social => {
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
        skills: userSkills,
        socials: socialsObject,
        photo: response.data.data.photo || null,
        experiences: response.data.data.experiences || [],
        educations: response.data.data.educations || []
      });

    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEducations = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await axios.get(`http://localhost:3000/api/users/${user.id}/education`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEducation(response.data.data.educations);
    } catch (error) {
      console.error("Failed to fetch education:", error);
      toast.error("Failed to load education data");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Delete Education
  const handleDeleteEducation = async (educationId) => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      await axios.delete(`http://localhost:3000/api/education/${educationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh education data
      await fetchEducations();
      toast.success("Education deleted successfully!");

      // Close modal if open
      setEditShowEducationModal(false);
      setEditingEducation(null);

    } catch (error) {
      console.error("Failed to delete education:", error);
      toast.error("Failed to delete education. Please try again.");
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
    }
  }, [user.id])

  // Handle Education Form Submission
  const handleEducationSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!educationForm.major || !educationForm.institute_name) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Format dates for API
      const formattedData = {
        ...educationForm,
        start_date: `${educationForm.start_month} ${educationForm.start_year}`,
        end_date: educationForm.end_month === "Month" || educationForm.end_year === "Year"
          ? "Present"
          : `${educationForm.end_month} ${educationForm.end_year}`
      };

      // save image to /api/education/photo
      const formData = new FormData();
      formData.append("photo", educationForm.schoolLogo);
      const uploadResponse = await axios.post("http://localhost:3000/api/education/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      formattedData.photo = uploadResponse.data.data.photo;

      // Send to API
      await axios.post('http://localhost:3000/api/education', formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh education data
      await fetchEducations();

      toast.success("Education added successfully!");

      // Close modal and reset form
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
      console.error("Failed to add education:", error);
      toast.error("Failed to add education. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit Education
  const handleEditEducation = (edu) => {
    // Split month and year from dates
    const startParts = edu.start_date ? edu.start_date.split(' ') : ['Month', 'Year'];
    const endParts = edu.end_date === 'Present' ? ['Month', 'Year'] : (edu.end_date ? edu.end_date.split(' ') : ['Month', 'Year']);

    setEditingEducation(edu);
    setEducationForm({
      major: edu.major || "",
      institute_name: edu.institute_name || "",
      location: edu.location || "",
      start_month: startParts[0] || "Month",
      start_year: startParts[1] || "Year",
      end_month: endParts[0] || "Month",
      end_year: endParts[1] || "Year",
      caption: edu.caption || "",
      schoolLogo: null,
    });
    setEditShowEducationModal(true);
  };

  // Handle Edit Education Form Submission
  const handleEditEducationSubmit = async (e) => {
    e.preventDefault();

    if (!educationForm.major || !educationForm.institute_name) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formattedData = {
        ...educationForm,
        start_date: `${educationForm.start_month} ${educationForm.start_year}`,
        end_date: educationForm.end_month === "Month" || educationForm.end_year === "Year"
          ? "Present"
          : `${educationForm.end_month} ${educationForm.end_year}`
      };

      // If new logo uploaded
      if (educationForm.schoolLogo) {
        const formData = new FormData();
        formData.append("photo", educationForm.schoolLogo);
        const uploadResponse = await axios.post("http://localhost:3000/api/education/photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        });
        formattedData.photo = uploadResponse.data.data.photo;
      } else {
        formattedData.photo = editingEducation.photo;
      }

      // Send update request
      await axios.put(`http://localhost:3000/api/education/${editingEducation.id}`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh education data
      await fetchEducations();

      toast.success("Education updated successfully!");
      setEditShowEducationModal(false);
      setEditingEducation(null);
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
      console.error("Failed to update education:", error);
      toast.error("Failed to update education. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Experience Form Submission
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    const newExperience = {
      ...experienceForm,
      id: Date.now(),
    };
    setUser(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience],
    }));
    setShowExperienceModal(false);
    setExperienceForm({
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
    toast.success("Experience added successfully!");
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
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

              <button className="text-blue-600 text-base mt-5">Log Out</button>
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
                    const platformInfo = socialPlatforms.find(p => p.name === platform);
                    return (
                      <div key={platform} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                        {platformInfo && (
                          <div className={`p-2 rounded-full ${platformInfo.color} bg-gray-50`}>
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
                <button
                  className="text-sm bg-[#00AEEF] text-white px-4 py-2 rounded-md hover:bg-[#0099d6] transition flex items-center gap-1"
                  onClick={() => setShowExperienceModal(true)}
                >
                  + Add Experience
                </button>
              </div>

              {user.experiences?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {user.experiences.map((exp) => (
                    <div key={exp.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex gap-4">
                        {exp.photo ? (
                          <img
                            src={exp.photo}
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
                          <p className="text-gray-500 text-sm">
                            {formatDate(exp.start_month, exp.start_year)} -{" "}
                            {exp.end_month === "Month" || exp.end_year === "Year"
                              ? "Present"
                              : formatDate(exp.end_month, exp.end_year)}
                          </p>
                          {exp.location && (
                            <p className="text-gray-500 text-sm">{exp.location}</p>
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
                <button
                  className="text-sm bg-[#00AEEF] text-white px-4 py-2 rounded-md hover:bg-[#0099d6] transition flex items-center gap-1"
                  onClick={() => setShowEducationModal(true)}
                >
                  + Add Education
                </button>
              </div>

              {educations?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {educations.map((edu) => (
                    <div key={edu.id} className="border-b pb-6 last:border-b-0 last:pb-0 relative group">
                      <div className="flex gap-4">
                        {edu.photo ? (
                          <img
                            src={"http://localhost:3000/" + edu.photo}
                            alt="School logo"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                            <GraduationCap className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{edu.major}</h4>
                          <p className="text-gray-600">{edu.institute_name}</p>
                          <p className="text-gray-500 text-sm">
                            {formatDate(edu.start_month, edu.start_year)} -{" "}
                            {edu.end_month === "Month" || edu.end_year === "Year"
                              ? "Present"
                              : formatDate(edu.end_month, edu.end_year)}
                          </p>
                          {edu.location && (
                            <p className="text-gray-500 text-sm">{edu.location}</p>
                          )}
                          {edu.caption && (
                            <p className="text-gray-600 mt-2">{edu.caption}</p>
                          )}
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex items-center justify-center pr-4 gap-2">
                          <button
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => handleEditEducation(edu)}
                          >
                            <Pencil size={16} className="text-gray-600 hover:text-[#00AEEF]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
                  <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
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
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {post.map((post) => (
                  <div
                    key={post.id}
                    className="flex-shrink-0 w-64 border rounded-lg overflow-hidden bg-white shadow-sm"
                  >
                    <div className="h-40 bg-gray-100 relative">
                      <img
                        src={post.image}
                        alt={`${post.title} post`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-base text-[#00AEEF] line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {post.provider}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{post.likes} likes</span>
                          <span className="mx-2">•</span>
                          <span>{post.comments} comments</span>
                        </div>
                        <button className="text-xs text-[#00AEEF]">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <style jsx>{`
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
              <h2 className="text-xl font-bold">Add Experience</h2>
            </div>
            <form onSubmit={handleExperienceSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="Job Title *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={experienceForm.jobTitle}
                    onChange={handleExperienceChange}
                    required
                  />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={experienceForm.companyName}
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
                          <option key={index} value={month}>{month}</option>
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
                          <option key={index} value={year}>{year}</option>
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
                          <option key={index} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="end_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.end_year}
                        onChange={handleExperienceChange}
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>{year}</option>
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
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border hover:bg-gray-50 transition"
                  onClick={() => setShowExperienceModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#00AEEF] text-white hover:bg-[#0099d6] transition"
                >
                  Save Experience
                </button>
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
              <h2 className="text-xl font-bold">Add Education</h2>
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
                          <option key={index} value={month}>{month}</option>
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
                          <option key={index} value={year}>{year}</option>
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
                          <option key={index} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="end_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.end_year}
                        onChange={handleEducationChange}
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>{year}</option>
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

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border hover:bg-gray-50 transition"
                  onClick={() => setShowEducationModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#00AEEF] text-white hover:bg-[#0099d6] transition"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Education"}
                </button>
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
                          <option key={index} value={month}>{month}</option>
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
                          <option key={index} value={year}>{year}</option>
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
                          <option key={index} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="end_year"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.end_year}
                        onChange={handleEducationChange}
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>{year}</option>
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
                        src={"http://localhost:3000/" + editingEducation.photo}
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
                      if (window.confirm("Are you sure you want to delete this education?")) {
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