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

  const [educationForm, setEducationForm] = useState({
    degree: "",
    schoolName: "",
    location: "",
    startMonth: "Month",
    startYear: "Year",
    endMonth: "Month",
    endYear: "Year",
    description: "",
    schoolLogo: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: "",
    headline: "",
    about: "",
    skills: [],
    socials: {},
    photo: null,
    experiences: [],
    educations: []
  });

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

  // Form states
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    startMonth: "Month",
    startYear: "Year",
    endMonth: "Month",
    endYear: "Year",
    description: "",
    logoCompany: null,
  });
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

  // Modify the useEffect in Profile.jsx to handle updates
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

      let userSkills = [];
      if (response.data.data.skills && response.data.data.skills.Valid) {
        // Handle both array and single string cases
        userSkills = Array.isArray(response.data.data.skills.String)
          ? response.data.data.skills.String
          : response.data.data.skills.String
            ? [response.data.data.skills.String]
            : [];
      }

      setUser({
        name: response.data.data.name || "",
        headline: response.data.data.headline || "",
        about: response.data.data.about || "",
        skills: response.data.data.skills || [],
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

  useEffect(() => {
    fetchProfile();
  }, []);


  const socialPlatforms = [
    { name: "instagram", icon: <Instagram className="w-5 h-5" />, color: "text-pink-500" },
    { name: "facebook", icon: <Facebook className="w-5 h-5" />, color: "text-blue-500" },
    { name: "twitter", icon: <Twitter className="w-5 h-5" />, color: "text-blue-400" },
    { name: "linkedin", icon: <Linkedin className="w-5 h-5" />, color: "text-blue-700" },
    { name: "github", icon: <Github className="w-5 h-5" />, color: "text-black" },
  ];

  const handleExperienceSubmit = (e) => {
    e.preventDefault();
    const newExperience = {
      ...experienceForm,
      id: Date.now(),
    };
    setUser(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience],
      skills: userSkills || [],
    }));
    setShowExperienceModal(false);
    setExperienceForm({
      jobTitle: "",
      companyName: "",
      location: "",
      startMonth: "Month",
      startYear: "Year",
      endMonth: "Month",
      endYear: "Year",
      description: "",
      logoCompany: null,
    });
    toast.success("Experience added successfully!");
  };

  const handleEducationSubmit = (e) => {
    e.preventDefault();
    const newEducation = {
      ...educationForm,
      id: Date.now(),
    };
    setUser(prev => ({
      ...prev,
      educations: [...prev.educations, newEducation]
    }));
    setShowEducationModal(false);
    setEducationForm({
      degree: "",
      schoolName: "",
      location: "",
      startMonth: "Month",
      startYear: "Year",
      endMonth: "Month",
      endYear: "Year",
      description: "",
      schoolLogo: null,
    });
    toast.success("Education added successfully!");
  };

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
      logoCompany: e.target.files[0],
    });
  };

  const handleEducationFileChange = (e) => {
    setEducationForm({
      ...educationForm,
      schoolLogo: e.target.files[0],
    });
  };

  const formatDate = (month, year) => {
    if (month === "Month" || year === "Year") return "";
    return `${month} ${year}`;
  };

  const handleSaveSocials = (data) => {
    setSocialMedia(data);
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
    return <div>Loading...</div>;
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
                      {/* ... (experience item rendering) */}
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

              {user.educations?.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {user.educations.map((edu) => (
                    <div key={edu.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      {/* ... (education item rendering) */}
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
                        name="startMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.startMonth}
                        onChange={handleExperienceChange}
                        required
                      >
                        {months.map((month, index) => (
                          <option key={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="startYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.startYear}
                        onChange={handleExperienceChange}
                        required
                      >
                        {years.map((year, index) => (
                          <option key={index}>{year}</option>
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
                        name="endMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.endMonth}
                        onChange={handleExperienceChange}
                      >
                        {months.map((month, index) => (
                          <option key={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="endYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.endYear}
                        onChange={handleExperienceChange}
                      >
                        {years.map((year, index) => (
                          <option key={index}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    name="description"
                    placeholder="Description"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    rows={4}
                    value={experienceForm.description}
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

      {/* Education Modal */}
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
                    name="degree"
                    placeholder="Degree *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.degree}
                    onChange={handleEducationChange}
                    required
                  />
                  <input
                    type="text"
                    name="schoolName"
                    placeholder="School Name *"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    value={educationForm.schoolName}
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
                        name="startMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.startMonth}
                        onChange={handleEducationChange}
                        required
                      >
                        {months.map((month, index) => (
                          <option key={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="startYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.startYear}
                        onChange={handleEducationChange}
                        required
                      >
                        {years.map((year, index) => (
                          <option key={index}>{year}</option>
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
                        name="endMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.endMonth}
                        onChange={handleEducationChange}
                      >
                        {months.map((month, index) => (
                          <option key={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        name="endYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.endYear}
                        onChange={handleEducationChange}
                      >
                        {years.map((year, index) => (
                          <option key={index}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    name="description"
                    placeholder="Description"
                    className="w-full border px-3 py-2 rounded focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                    rows={4}
                    value={educationForm.description}
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
                >
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}