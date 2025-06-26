import React from 'react';
import { ThumbsDown, ThumbsUp, MapPin } from 'lucide-react';
import AboutTab from '../../components/CompanyProfile/AboutTab.jsx';
import JobsTab from '../../components/CompanyProfile/JobsTab.jsx';
import ReviewsTab from '../../components/CompanyProfile/ReviewsTab.jsx';
import PostTab from "./PostTab.jsx";
import { useParams } from "react-router-dom";

export default function CompanyMainContent({
  activeTab,
  company,
  jobs,
  posts,
  userReviews,
  newComment,
  setNewComment,
  handleCommentSubmit,
  onAddPost,
  onJobPost
}) {
  const {company_id} = useParams()
  const formatDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

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
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    return "Just now";
  };


  return (
    <div className="lg:col-span-6 space-y-4">
      {activeTab === "About" && <AboutTab company={company} />}
      {activeTab === "Posts" && <PostTab companyId={company_id}/>}
      {activeTab === "Jobs" && <JobsTab jobs={jobs} onJobPost={onJobPost} />}
      {activeTab === "Reviews" && (
        <ReviewsTab 
          userReviews={userReviews}
          newComment={newComment}
          setNewComment={setNewComment}
          handleCommentSubmit={handleCommentSubmit}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}