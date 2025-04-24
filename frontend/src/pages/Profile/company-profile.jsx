import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import companyProfile from "../../assets/img/company-profile.jpg";
import job1 from "../../assets/img/job1.png";
import { useParams } from "react-router-dom";
import { ThumbsDown, ThumbsUp, MapPin } from 'lucide-react';

export default function CompanyProfile() {
  const params = useParams();
  const companyId = params.companyId;
  const [activeTab, setActiveTab] = useState("About");
  const [newComment, setNewComment] = useState("");

  const [isFollowingMain, setIsFollowingMain] = useState(false);
  const [isFollowingAmazon, setIsFollowingAmazon] = useState(false);
  const [isConnectedSophia, setIsConnectedSophia] = useState(false);

  const tabs = ["About", "Jobs", "Reviews"];

  const data = [
    {
      id: 1,
      name: "EvoConnect",
      description: "A leading tech company specializing in innovative solutions",
      caption: "Connecting the world through technology",
      industry: "Information Technology",
      location: "Yogyakarta, Indonesia",
      employees: "100-500",
      headquarters: "Jakarta, Indonesia",
      type: "public",
      founded: "2025-03-14",
      specialties: "hahahayy",
      logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
      website: "https://evoconnect.com",
      followers: 1412800,
      connections: 350,
      Employees: 200,
      rating: 4.5,
      jobs: 15
    }
  ];

  const jobs = [
    {
      id: 1,
      title: "Software Engineer",
      company: "EvoConnect",
      location: "Yogyakarta, Indonesia",
      employmentType: "Full-time",
      description: "We are looking for a Software Engineer to join our team.",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Envato",
      location: "India, Punjab",
      employmentType: "Full-time",
      description: "Seeking a talented UI/UX Designer.",
    },
  ];

  // Dummy reviews (not displayed)
  const dummyReviews = [
    {
      id: 1,
      name: "siapa",
      like: "23",
      unLike: "456",
      comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      date: "2023-10-01",
      description: "We are looking for a Software Engineer to join our team.",
    },
    {
      id: 2,
      name: "coba",
      like: "87",
      unLike: "56",
      comment: "sssssssssssssssss",
      date: "2023-09-1",
      description: "asdkifhsadjf",
    },
  ];

  // State for user-submitted reviews
  const [userReviews, setUserReviews] = useState([]);

  const formatDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    // If comment is from a different day
    if (commentDate.toDateString() !== now.toDateString()) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return commentDate.toLocaleDateString('en-US', options);
    }
    
    // Calculate relative time for today's comments
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Fallback (shouldn't reach here for today's comments)
    return "Just now";
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const newReview = {
      id: Date.now(), // Use timestamp for unique ID
      name: "User " + (userReviews.length + 1),
      like: "0",
      unLike: "0",
      comment: newComment,
      date: new Date().toISOString(),
      description: newComment,
    };

    setUserReviews([...userReviews, newReview]);
    setNewComment("");
  };

  const company = data.find((item) => item.id === parseInt(companyId));
  if (!company) {
    return <div className="text-center mt-10">Company not found</div>;
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen">
        {/* Header section remains the same */}
        <div className="relative">
          <img src={companyProfile} alt="Company Header" className="w-full h-60 object-cover" />
        </div>

        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 bg-white rounded-md shadow -mt-8 relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
              {company.name}
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React Icon" className="w-5 h-5" />
            </h1>
            <p className="text-gray-500">
              {company.industry} | {company.location} | {company.followers} followers
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
              Visit Website
            </button>
            <button
              onClick={() => setIsFollowingMain(true)}
              className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${isFollowingMain ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isFollowingMain ? " Followed" : "+ Follow"}
            </button>
          </div>
        </div>

        {/* Tab navigation remains the same */}
        <div className="bg-white rounded-md shadow px-6 py-4 max-w-screen-xl mx-auto mt-4">
          <div className="flex space-x-8 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-lg font-medium transition ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left sidebar remains the same */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col items-center bg-white p-6 rounded-md shadow">
                <img src={job1} alt="Company Logo" className="w-40 h-40" />
                <h2 className="text-lg font-bold mt-4">{company.name}</h2>
                <p className="text-gray-600 text-center p-4">{company.caption}</p>
                <hr className="border-t-2 border-gray-300 my-4 w-full" />
                <div className="text-sm text-gray-800 mt-4 space-y-2 px-4 w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold">Common Connections:</span>
                    <span className="text-blue-600 font-semibold">{company.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">All Employees:</span>
                    <span className="text-blue-600 font-semibold">{company.Employees}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-6 space-y-4">
              {activeTab === "About" && (
                <>
                  {/* About section remains the same */}
                  <div className="bg-white p-6 rounded-md shadow">
                    <h2 className="text-2xl font-semibold mb-4">About</h2>
                    <hr className="py-2" />
                    <p className="text-gray-700">{company.description}</p>
                  </div>

                  <div className="bg-white p-6 rounded-md shadow">
                    <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                    <hr className="py-2" />
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{company.website}</a></li>
                      <hr className="py-2" />
                      <li><strong>Industry:</strong> {company.industry}</li>
                      <hr className="py-2" />
                      <li><strong>Company Size:</strong> {company.employees}</li>
                      <hr className="py-2" />
                      <li><strong>Headquarters:</strong> {company.headquarters}</li>
                      <hr className="py-2" />
                      <li><strong>Type:</strong> {company.type}</li>
                      <hr className="py-2" />
                      <li><strong>Founded:</strong> {company.founded}</li>
                      <hr className="py-2" />
                      <li><strong>Specialties:</strong> {company.specialties}</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-md shadow">
                    <h2 className="text-2xl font-semibold mb-4">Location</h2>
                    <hr className="py-2" />
                    <div className="space-y-4">
                      <iframe
                        src="https://www.google.com/maps/embed?..."
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        title="Location Map"
                      ></iframe>
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                          <MapPin size={20} strokeWidth={0.75} />
                          Postal Address
                        </h3>
                        <p className="text-gray-700">{company.location}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "Jobs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-md shadow p-6 hover:shadow-lg transition-shadow flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
                      <p className="text-gray-500 mb-2">{job.company} - {job.location}</p>
                      <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">{job.employmentType}</span>
                      <p className="text-gray-600 text-sm flex-grow">{job.description}</p>
                      <div className="mt-4">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md w-full">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="col-span-full bg-white p-6 rounded-md shadow text-center text-gray-500">
                      No jobs available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Reviews" && (
                <div className="bg-white p-6 rounded-md shadow text-sm space-y-6">
                  {/* Comment input area */}
                  <div className="flex items-start mb-6">
                    <img
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="Add a public comment..."
                        className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        rows="3"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400">{userReviews.length} Comments</span>
                        <div>
                          <button 
                            className="px-4 py-1 mr-2 rounded-md bg-blue-100 text-blue-500 hover:bg-blue-200 text-sm"
                            onClick={() => setNewComment("")}
                          >
                            CANCEL
                          </button>
                          <button 
                            className="px-4 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-sm"
                            onClick={handleCommentSubmit}
                          >
                            COMMENT
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments list */}
                  {userReviews.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    userReviews.map((review, index) => (
                      <div key={review.id} className="flex items-start space-x-4">
                        <img
                          src={`https://randomuser.me/api/portraits/men/${index + 30}.jpg`}
                          alt="Commenter Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-semibold text-blue-600 mr-2">{review.name}</span>
                            <span className="text-gray-400 text-sm">{formatDate(review.date)}</span>
                          </div>
                          <p className="text-gray-700 mb-2">{review.description}</p>
                          <div className="flex items-center text-gray-500 space-x-4">
                            <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                              <ThumbsUp size={20} strokeWidth={0.75} />
                              <p>{review.like}</p>
                            </div>
                            <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                              <ThumbsDown size={20} strokeWidth={0.75} />
                              <p>{review.unLike}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar remains the same */}
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-white p-6 rounded-md shadow">
                <h2 className="text-lg font-semibold mb-4">Similar Pages</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={job1} alt="Amazon" className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">Amazon</p>
                      <p className="text-sm text-gray-400">Internet</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFollowingAmazon(true)}
                    className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${isFollowingAmazon ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
                  >
                    {isFollowingAmazon ? " Followed" : "+ Follow"}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-md shadow">
                <h2 className="text-lg font-semibold mb-4">People Also Viewed</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={job1} alt="Profile" className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">Sophia Lee</p>
                      <p className="text-sm text-gray-400">@Harvard</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsConnectedSophia(true)}
                    className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${isConnectedSophia ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
                  >
                    {isConnectedSophia ? " Connected" : "Connect"}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-md text-center">
                <p className="font-bold text-lg mb-1">EVOConnect Premium</p>
                <p className="text-sm text-gray-700">Grow & nurture your network</p>
                <button className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-4 rounded">
                  ACTIVATE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}