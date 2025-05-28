import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CompanyHeader from "../../components/CompanyProfile/CompanyHeader.jsx";
import CompanyTabs from "../../components/CompanyProfile/CompanyTabs.jsx";
import CompanyLeftSidebar from "../../components/CompanyProfile/CompanyLeftSidebar.jsx";
import CompanyMainContent from "../../components/CompanyProfile/CompanyMainContent.jsx";
import CompanyRightSidebar from "../../components/CompanyProfile/CompanyRightSidebar.jsx";

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

  const [userReviews, setUserReviews] = useState([]);

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

  const company = data.find((item) => item.id === parseInt(companyId));
  if (!company) {
    return <div className="text-center mt-10">Company not found</div>;
  }

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
            <CompanyLeftSidebar company={company} />
            
            <CompanyMainContent 
              activeTab={activeTab}
              company={company}
              jobs={jobs}
              userReviews={userReviews}
              newComment={newComment}
              setNewComment={setNewComment}
              handleCommentSubmit={handleCommentSubmit}
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