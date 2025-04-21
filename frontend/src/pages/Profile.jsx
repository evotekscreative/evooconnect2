import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Case from "../components/Case";  
import { 
  Briefcase, Users, Pen, MessageSquare, Bell, User, Eye, 
  Bookmark, Calendar, MapPin, GraduationCap, Building,
  Facebook, Twitter, Linkedin, Github, Instagram,
} from "lucide-react";

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
    companyLogo: null
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
      companyLogo: null
    });
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
      companyLogo: e.target.files[0]
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

  return (
    <div className="bg-[#EDF3F7] min-h-screen">
      {/* Navbar */}
     <Case />

      {/* Content */}
      <div className="max-w-4xl mx-auto py-6 flex flex-col md:flex-row gap-6 px-4">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-white rounded-md shadow p-4 text-center">
            <div className="relative w-24 h-24 mx-auto bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">MA</span>
              )}
            </div>
            <h2 className="font-bold text-md mt-4">{fullName}</h2>
            <p className="text-sm text-gray-500">{headline || "No information yet."}</p>

            <div className="mt-4 space-y-2 text-left text-sm">
              <Link to="/list-connection" className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Users size={14} /> Connections</span>
                <span className="font-bold">358</span>
              </Link>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Eye size={14} /> Views</span>
                <span className="font-bold">85</span>
              </div>
              <Link to="/job-saved" className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Bookmark size={14} /> Job Saved</span>
                <span className="font-bold">120</span>
              </Link>
            </div>

            <button className="text-blue-600 text-sm mt-4">Log Out</button>
          </div>

          <div className="bg-white rounded-md shadow p-3">
            <h3 className="font-semibold text-sm">Skills</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No skills added yet.</p>
            )}
          </div>

          <div className="bg-white rounded-md shadow p-3">
            <h3 className="font-semibold text-sm mb-2">Social Media</h3>
            {Object.keys(socialMedia).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(socialMedia).map(([platform, username]) => (
                  <div key={platform} className="flex items-center gap-2">
                    {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                    {platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                    {platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                    {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-700" />}
                    {platform === 'github' && <Github className="w-4 h-4 text-black" />}
                    <span className="text-xs">@{username}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No social media added yet.</p>
            )}
          </div>
        </div>

        {/* Right Main Section */}
        <div className="w-full md:w-2/3 space-y-4">
          <div className="bg-white rounded-md shadow p-4">
            <h3 className="font-semibold">About You</h3>
            <p className="text-sm text-gray-500 mt-2">
              {about || "No information provided yet."}
            </p>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-md shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-[#00AEEF]" />
                <h3 className="font-semibold text-lg">Experience</h3>
              </div>
              <button
                className="text-sm bg-[#00AEEF] text-white px-3 py-1.5 rounded-md hover:bg-[#0099d6] transition flex items-center gap-1"
                onClick={() => setShowExperienceModal(true)}
              >
                + Add Experience
              </button>
            </div>

            {experiences.length > 0 ? (
              <div className="mt-4 space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-b pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      {exp.companyLogo ? (
                        <div className="mr-4">
                          <div className="h-16 w-16 rounded-md border bg-white flex items-center justify-center shadow-sm overflow-hidden">
                            <img
                              src={URL.createObjectURL(exp.companyLogo)}
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
                        <h4 className="font-medium text-base text-[#00AEEF]">{exp.jobTitle}</h4>
                        <p className="text-sm font-medium">{exp.companyName}</p>

                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(exp.startMonth, exp.startYear)} - {formatDate(exp.endMonth, exp.endYear) || 'Present'}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {exp.location}
                            </span>
                          )}
                        </div>

                        {exp.description && (
                          <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border-l-2 border-[#00AEEF]">
                            {exp.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <Briefcase size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No experience added yet.</p>
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-md shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-[#00AEEF]" />
                <h3 className="font-semibold text-lg">Education</h3>
              </div>
              <button
                className="text-sm bg-[#00AEEF] text-white px-3 py-1.5 rounded-md hover:bg-[#0099d6] transition flex items-center gap-1"
                onClick={() => setShowEducationModal(true)}
              >
                + Add Education
              </button>
            </div>

            {educations.length > 0 ? (
              <div className="mt-4 space-y-6">
                {educations.map((edu) => (
                  <div key={edu.id} className="border-b pb-5 last:border-b-0 last:pb-0">
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
                        <h4 className="font-medium text-base text-[#00AEEF]">{edu.degree}</h4>
                        <p className="text-sm font-medium">{edu.schoolName}</p>

                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(edu.startMonth, edu.startYear)} - {formatDate(edu.endMonth, edu.endYear) || 'Present'}
                          </span>
                          {edu.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {edu.location}
                            </span>
                          )}
                        </div>

                        {edu.description && (
                          <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border-l-2 border-[#00AEEF]">
                            {edu.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <GraduationCap size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No education added yet.</p>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">No posts available.</p>
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