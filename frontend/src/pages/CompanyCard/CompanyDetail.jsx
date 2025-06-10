import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CompanyHeader from "../../components/CompanyProfile/CompanyHeader.jsx";
import CompanyTabs from "../../components/CompanyProfile/CompanyTabs.jsx";
import CompanyLeftSidebar from "../../components/CompanyProfile/CompanyLeftSidebar.jsx";
import CompanyMainContent from "../../components/CompanyProfile/CompanyMainContent.jsx";
import CompanyRightSidebar from "../../components/CompanyProfile/CompanyRightSidebar.jsx";
import CompanyEditModal from "../../components/CompanyProfile/CompanyEditModal.jsx";

export default function CompanyDetail() {
  const { company_id } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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

  const [formData, setFormData] = useState({
    name: "",
    linkedin_url: "",
    website: "",
    industry: "",
    size: "",
    typelinkedin_urlo: "",
    tagline: ""
  });
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

        const res = await fetch(`${apiUrl}/api/companies/${company_id}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.data) {
          const c = data.data;
          setCompany({
            ...c,
            followers: c.followers || 0,
            connections: c.connections || 0,
            Employees: c.employees || "0",
            rating: 4.5,
            jobs: c.jobs?.length || 0,
            caption: c.tagline || "Innovative solutions for your business",
            linkedin_url: c.linkedin_url || "",
          });

          // Initialize form data with current company details
          setFormData({
            name: c.name || "",
            linkedin_url: c.linkedin_url || "",
            website: c.website || "",
            industry: c.industry || "",
            size: c.size || "",
            type: c.type || "",
            logo: c.linkedin_url ? c.linkedin_url : null,
            tagline: c.tagline || ""
          });

          setJobs(c.jobs || []);
        } else {
          setCompany(null);
        }
      } catch (error) {
        console.error("Error fetching company detail:", error);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [company_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
    }
  };

  const handleSubmitEditRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

      // Log untuk debugging
      console.log("Submitting edit request for company:", company_id);
      console.log("Form data:", formData);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("linkedin_url", formData.linkedin_url);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("industry", formData.industry);
      formDataToSend.append("size", formData.size);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("tagline", formData.linkedin_url);

      if (formData.logo instanceof File) {
        formDataToSend.append("logo", formData.logo);
      }

      const response = await fetch(`${apiUrl}/api/companies/${company_id}/request-edit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error("Failed to submit edit request");
      }

      // Set success state
      setSubmitSuccess(true);

      // Show loading for 2 seconds then redirect
      setTimeout(() => {
        setIsSubmitting(false);
        setIsEditModalOpen(false);
        navigate(-1); // Kembali ke halaman sebelumnya
      }, 2000);

    } catch (error) {
      console.error("Error submitting edit request:", error);
      alert(error.message || "Failed to submit edit request. Please try again.");
      setIsSubmitting(false);
    }
  };

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
      shares: 0,
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
      description: newJob.description,
    };

    setJobs([jobWithId, ...jobs]);
  };

  if (loading) return <p className="text-center">Loading company detail...</p>;

  if (!company)
    return (
      <div className="text-center text-red-500">
        Failed to load company details.
        <button
          onClick={() => navigate(-1)}
          className="mt-4 underline text-blue-600"
        >
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
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <CompanyTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        <CompanyEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          formData={formData}
          logoPreview={logoPreview}
          handleInputChange={handleInputChange}
          handleLogoChange={handleLogoChange}
          handleSubmit={handleSubmitEditRequest}
          isSubmitting={isSubmitting}
          submitSuccess={submitSuccess}
          company_id={company_id} 
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