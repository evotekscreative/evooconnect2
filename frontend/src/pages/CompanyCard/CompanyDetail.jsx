import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CompanyHeader from "../../components/CompanyProfile/CompanyHeader.jsx";
import CompanyTabs from "../../components/CompanyProfile/CompanyTabs.jsx";
import CompanyLeftSidebar from "../../components/CompanyProfile/CompanyLeftSidebar.jsx";
import CompanyMainContent from "../../components/CompanyProfile/CompanyMainContent.jsx";
import CompanyRightSidebar from "../../components/CompanyProfile/CompanyRightSidebar.jsx";

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("About");
  const [newComment, setNewComment] = useState("");
  const [isFollowingMain, setIsFollowingMain] = useState(false);
  const [isFollowingAmazon, setIsFollowingAmazon] = useState(false);
  const [isConnectedSophia, setIsConnectedSophia] = useState(false);

  const tabs = ["About", "Posts", "Jobs", "Reviews"];
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/api/companies/${companyId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.data) {
          setCompany({
            ...data.data,
            // Add any additional fields needed for the UI
            followers: data.data.followers || 0,
            connections: data.data.connections || 0,
            Employees: data.data.employees || "0",
            rating: 4.5,
            jobs: data.data.jobs?.length || 0,
            caption: data.data.tagline || "Innovative solutions for your business"
          });
        } else {
          setCompany(null);
        }
      } catch (error) {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetail();
  }, [companyId]);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const newReview = {
      id: Date.now(),
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

  const handleAddPost = (newPostContent) => {
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now(),
      author: company?.name || "Company",
      content: newPostContent,
      date: new Date().toLocaleString(),
      likes: 0,
      comments: 0,
      shares: 0
    };

    setPosts([newPost, ...posts]);
  };

  const handleJobPost = (newJob) => {
    const jobWithId = {
      ...newJob,
      id: Date.now(),
      title: newJob.jobTitle,
      company: company?.name || "Company",
      location: newJob.location,
      employmentType: newJob.employmentType,
      description: newJob.description
    };

    setJobs([jobWithId, ...jobs]);
  };

  if (loading) return <p className="text-center">Loading company detail...</p>;

  if (!company)
    return (
      <div className="text-center text-red-500">
        Failed to load company details.
        <button onClick={() => navigate(-1)} className="mt-4 underline text-blue-600">
          Go back
        </button>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen">
        <CompanyHeader
          company={company}
          isFollowingMain={isFollowingMain}
          setIsFollowingMain={setIsFollowingMain}
        />

        <CompanyTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        <div className="mt-4 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <CompanyLeftSidebar
              company={company}
              setJobs={setJobs}
              jobs={jobs}
            />

            <CompanyMainContent
              activeTab={activeTab}
              company={company}
              posts={posts}
              jobs={jobs}
              userReviews={userReviews}
              newComment={newComment}
              setNewComment={setNewComment}
              handleCommentSubmit={handleCommentSubmit}
              onAddPost={handleAddPost}
              onJobPost={handleJobPost}
            />

            <CompanyRightSidebar
              isFollowingAmazon={isFollowingAmazon}
              setIsFollowingAmazon={setIsFollowingAmazon}
              isConnectedSophia={isConnectedSophia}
              setIsConnectedSophia={setIsConnectedSophia}
            />
          </div>
        </div>
      </div>
    </>
  );
}