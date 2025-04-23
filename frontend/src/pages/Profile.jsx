import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Case from "../components/Case";
import {
  Briefcase, Users, Clock, ChevronLeft, ChevronRight, Eye,
  Bookmark, Calendar, MapPin, GraduationCap, Building,
  Facebook, Twitter, Linkedin, Github, Instagram,
} from "lucide-react";
import { Toaster, toast } from "sonner"; // Import Toaster and toast

export default function ProfilePage() {
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [about, setAbout] = useState("No information provided yet.");
  const [skills, setSkills] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState("Muhammad Bintang Asyidqy");
  const [headline, setHeadline] = useState("");
  const [socialMedia, setSocialMedia] = useState({});
  const [post] = useState([
    {
      id: 1,
      title: 'Belajar Membuat Aplikasi Back-End untuk Pemula',
      provider: 'Dicoding',
      date: 'March 2023',
      image: '/api/placeholder/300/200',
      likes: 14,
      comments: 1
    },
    {
      id: 2,
      title: 'Sertifikat Kelas Belajar jQuery Dasar',
      provider: 'CODEPOLITAN',
      date: 'January 2023',
      image: '/api/placeholder/300/200',
      likes: 11,
      comments: 1
    },
    {
      id: 3,
      title: 'React.js Developer postificate',
      provider: 'Meta',
      date: 'December 2022',
      image: '/api/placeholder/300/200',
      likes: 19,
      comments: 2
    },
    {
      id: 4,
      title: 'Responsive Web Design',
      provider: 'freeCodeCamp',
      date: 'November 2022',
      image: '/api/placeholder/300/200',
      likes: 8,
      comments: 0
    }
  ]);

  // Form states
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: '',
    companyName: '',
    location: '',
    startMonth: 'Month',
    startYear: 'Year',
    endMonth: 'Month',
    endYear: 'Year',
    description: '',
    logoCompany: null
  });

  const [educationForm, setEducationForm] = useState({
    degree: '',
    schoolName: '',
    location: '',
    startMonth: 'Month',
    startYear: 'Year',
    endMonth: 'Month',
    endYear: 'Year',
    description: '',
    schoolLogo: null
  });

  const months = ["Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["Year", ...Array.from({ length: 50 }, (_, i) => `${new Date().getFullYear() - i}`)];

  useEffect(() => {
    const savedAbout = localStorage.getItem('profileAbout');
    if (savedAbout) setAbout(savedAbout);

    const savedSkills = localStorage.getItem('profileSkills');
    if (savedSkills) setSkills(JSON.parse(savedSkills));

    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) setProfileImage(savedImage);

    const savedFullName = localStorage.getItem('profileFullName');
    if (savedFullName) setFullName(savedFullName);

    const savedHeadline = localStorage.getItem('profileHeadline');
    if (savedHeadline) setHeadline(savedHeadline);

    const savedSocials = localStorage.getItem('profileSocials');
    if (savedSocials) setSocialMedia(JSON.parse(savedSocials));
  }, []);

  const handleExperienceSubmit = (e) => {
    e.preventDefault();
    const newExperience = {
      ...experienceForm,
      id: Date.now()
    };
    setExperiences([...experiences, newExperience]);
    setShowExperienceModal(false);
    setExperienceForm({
      jobTitle: '',
      companyName: '',
      location: '',
      startMonth: 'Month',
      startYear: 'Year',
      endMonth: 'Month',
      endYear: 'Year',
      description: '',
      logoCompany: null
    });
    toast.success("Experience added successfully!");
  };

  const handleEducationSubmit = (e) => {
    e.preventDefault();
    const newEducation = {
      ...educationForm,
      id: Date.now()
    };
    setEducations([...educations, newEducation]);
    setShowEducationModal(false);
    setEducationForm({
      degree: '',
      schoolName: '',
      location: '',
      startMonth: 'Month',
      startYear: 'Year',
      endMonth: 'Month',
      endYear: 'Year',
      description: '',
      schoolLogo: null
    });
    toast.success("Education added successfully!");
  };

  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setExperienceForm({
      ...experienceForm,
      [name]: value
    });
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducationForm({
      ...educationForm,
      [name]: value
    });
  };

  const handleExperienceFileChange = (e) => {
    setExperienceForm({
      ...experienceForm,
      logoCompany: e.target.files[0]
    });
  };

  const handleEducationFileChange = (e) => {
    setEducationForm({
      ...educationForm,
      schoolLogo: e.target.files[0]
    });
  };

  const formatDate = (month, year) => {
    if (month === 'Month' || year === 'Year') return '';
    return `${month} ${year}`;
  };

  const handleSaveSocials = (data) => {
    setSocialMedia(data);
  };

  // Scroll handlers for post
  const scrollLeft = () => {
    document.getElementById('post-container').scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    document.getElementById('post-container').scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#EDF3F7] min-h-screen">
      {/* Toast Notification Container */}
      <Toaster position="top-right" richColors />

      {/* Navbar */}
      <Case />

      {/* Content - Using full width with controlled padding */}
      <div className="w-full mx-auto py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-center">
          {/* Left Sidebar - Keeping width consistent */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="relative w-28 h-28 mx-auto bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">MA</span>
                )}
              </div>
              <h2 className="font-bold text-xl mt-4">{fullName}</h2>
              <p className="text-base text-gray-500">{headline || "No information yet."}</p>

              <div className="mt-5 space-y-2 text-left">
                <Link to="/list-connection" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                  <span className="flex items-center gap-2 text-base"><Users size={18} /> Connections</span>
                  <span className="font-bold text-lg">358</span>
                </Link>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                  <span className="flex items-center gap-2 text-base"><Eye size={18} /> Views</span>
                  <span className="font-bold text-lg">85</span>
                </div>
                <Link to="/job-saved" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                  <span className="flex items-center gap-2 text-base"><Bookmark size={18} /> Job Saved</span>
                  <span className="font-bold text-lg">120</span>
                </Link>
              </div>

              <button className="text-blue-600 text-base mt-5">Log Out</button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg">Skills</h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500 mt-1">No skills added yet.</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-2">Social Media</h3>
              {Object.keys(socialMedia).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(socialMedia).map(([platform, username]) => (
                    <div key={platform} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-md">
                      {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                      {platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-500" />}
                      {platform === 'twitter' && <Twitter className="w-5 h-5 text-blue-400" />}
                      {platform === 'linkedin' && <Linkedin className="w-5 h-5 text-blue-700" />}
                      {platform === 'github' && <Github className="w-5 h-5 text-black" />}
                      <span className="text-base">@{username}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500">No social media added yet.</p>
              )}
            </div>
          </div>

          {/* Right Main Section - Expanded to 2/3 for more space */}
          <div className="w-full md:w-2/3 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg">About You</h3>
              <p className="text-base text-gray-600 mt-3">
                {about || "No information provided yet."}
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

              {experiences.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        {exp.logoCompany ? (
                          <div className="mr-4">
                            <div className="h-16 w-16 rounded-md border bg-white flex items-center justify-center shadow-sm overflow-hidden">
                              <img
                                src={URL.createObjectURL(exp.logoCompany)}
                                alt={`${exp.companyName} Logo`}
                                className="max-h-14 max-w-14 object-contain"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mr-4">
                            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center shadow-sm">
                              <Building size={24} className="text-gray-400" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-lg text-[#00AEEF]">{exp.jobTitle}</h4>
                          <p className="text-base font-medium">{exp.companyName}</p>

                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(exp.startMonth, exp.startYear)} - {formatDate(exp.endMonth, exp.endYear) || 'Present'}
                            </span>
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {exp.location}
                              </span>
                            )}
                          </div>

                          {exp.description && (
                            <div className="mt-4 text-base text-gray-700 bg-gray-50 p-4 rounded-md border-l-2 border-[#00AEEF]">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
                  <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-base text-gray-500">No experience added yet.</p>
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

              {educations.length > 0 ? (
                <div className="mt-6 space-y-8">
                  {educations.map((edu) => (
                    <div key={edu.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        {edu.schoolLogo ? (
                          <div className="mr-4">
                            <div className="h-16 w-16 rounded-md border bg-white flex items-center justify-center shadow-sm overflow-hidden">
                              <img
                                src={URL.createObjectURL(edu.schoolLogo)}
                                alt={`${edu.schoolName} Logo`}
                                className="max-h-14 max-w-14 object-contain"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mr-4">
                            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center shadow-sm">
                              <GraduationCap size={24} className="text-gray-400" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-lg text-[#00AEEF]">{edu.degree}</h4>
                          <p className="text-base font-medium">{edu.schoolName}</p>

                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(edu.startMonth, edu.startYear)} - {formatDate(edu.endMonth, edu.endYear) || 'Present'}
                            </span>
                            {edu.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {edu.location}
                              </span>
                            )}
                          </div>

                          {edu.description && (
                            <div className="mt-4 text-base text-gray-700 bg-gray-50 p-4 rounded-md border-l-2 border-[#00AEEF]">
                              {edu.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
                  <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-base text-gray-500">No education added yet.</p>
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
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {post.map(post => (
                  <div key={post.id} className="flex-shrink-0 w-64 border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="h-40 bg-gray-100 relative">
                      <img 
                        src={post.image} 
                        alt={`${post.title} post`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-base text-[#00AEEF] line-clamp-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{post.provider}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{post.likes} likes</span>
                          <span className="mx-2">•</span>
                          <span>{post.comments} comments</span>
                        </div>
                        <button className="text-xs text-[#00AEEF]">Share</button>
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
                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                    <div className="flex gap-2">
                      <select
                        name="startMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.startMonth}
                        onChange={handleExperienceChange}
                        required
                      >
                        {months.map((month, index) => <option key={index}>{month}</option>)}
                      </select>
                      <select
                        name="startYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.startYear}
                        onChange={handleExperienceChange}
                        required
                      >
                        {years.map((year, index) => <option key={index}>{year}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <div className="flex gap-2">
                      <select
                        name="endMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.endMonth}
                        onChange={handleExperienceChange}
                      >
                        {months.map((month, index) => <option key={index}>{month}</option>)}
                      </select>
                      <select
                        name="endYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={experienceForm.endYear}
                        onChange={handleExperienceChange}
                      >
                        {years.map((year, index) => <option key={index}>{year}</option>)}
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
                  <label className="block text-sm font-medium mb-1">Company Logo</label>
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
                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                    <div className="flex gap-2">
                      <select
                        name="startMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.startMonth}
                        onChange={handleEducationChange}
                        required
                      >
                        {months.map((month, index) => <option key={index}>{month}</option>)}
                      </select>
                      <select
                        name="startYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.startYear}
                        onChange={handleEducationChange}
                        required
                      >
                        {years.map((year, index) => <option key={index}>{year}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <div className="flex gap-2">
                      <select
                        name="endMonth"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.endMonth}
                        onChange={handleEducationChange}
                      >
                        {months.map((month, index) => <option key={index}>{month}</option>)}
                      </select>
                      <select
                        name="endYear"
                        className="border px-2 py-1 rounded w-1/2 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none"
                        value={educationForm.endYear}
                        onChange={handleEducationChange}
                      >
                        {years.map((year, index) => <option key={index}>{year}</option>)}
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
                  <label className="block text-sm font-medium mb-1">School Logo</label>
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