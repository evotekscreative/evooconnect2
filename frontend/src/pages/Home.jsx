
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Components
import CreatePost from '../components/Home/CreatePost';
import PostCard from '../components/Home/PostCard';
import ProfileBox from '../components/Home/ProfileBox';
import ViewBox from '../components/Home/ViewBox';
import PeopleYouMightKnow from '../components/Home/PeopleYouMightKnow';
import AdBox from '../components/Home/AdBox';
import JobBox from '../components/Home/JobBox';
import CommentModal from '../components/Home/CommentModal';

import '../assets/css/style.css';

function HomePage() {
  // State variables
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const postsPerPage = 5;
  const observer = useRef();
  
  // Fetch posts from API
  const fetchPosts = async (page = 1, limit = postsPerPage) => {
    if (isFetching) return;
    
    setIsFetching(true);
    try {
      const response = await axios.get(`/api/posts?page=${page}&limit=${limit}`);
      const responseData = response.data;
      
      if (responseData.status === 'success' && responseData.data && responseData.data.data) {
        const newPosts = responseData.data.data;
        if (newPosts.length > 0) {
          setPosts(prev => [...prev, ...newPosts]);
          setCurrentPage(page);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Setup infinite scroll
  const lastPostRef = useRef();

  useEffect(() => {
    // Initialize observer for infinite scrolling
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isFetching) {
        fetchPosts(currentPage + 1);
      }
    }, { threshold: 0.5 });
    
    // Initial fetch
    fetchPosts();
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Update observer when last post element changes
  useEffect(() => {
    if (lastPostRef.current) {
      if (observer.current) observer.current.disconnect();
      observer.current.observe(lastPostRef.current);
    }
  }, [posts]);

  // Comment modal handlers
  const handleOpenCommentModal = (postId) => {
    setCurrentPostId(postId);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCurrentPostId(null);
  };

  // Handle new post creation
  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="bg-white py-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          {/* Main Content */}
          <main className="w-full xl:w-1/2 xl:order-2 lg:w-full lg:order-1 md:w-full sm:w-full">
            {/* Create Post Component */}
            <CreatePost onPostCreated={handleNewPost} />
            
            {/* Posts Container */}
            <div id="posts-container">
              {posts.map((post, index) => (
                <PostCard 
                  key={post.id}
                  post={post}
                  onComment={() => handleOpenCommentModal(post.id)}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                />
              ))}
              {isFetching && (
                <div className="flex justify-center p-4">
                  <div className="loader"></div> {/* Add a CSS spinner */}
                </div>
              )}
            </div>
          </main>

          {/* Left Sidebar */}
          <aside className="w-full xl:w-1/4 xl:order-1 lg:w-1/2 lg:order-2 md:w-1/2 sm:w-1/2">
            <ProfileBox />
            <ViewBox />
          </aside>

          {/* Right Sidebar */}
          <aside className="w-full xl:w-1/4 xl:order-3 lg:w-1/2 lg:order-3 md:w-1/2 sm:w-1/2">
            <PeopleYouMightKnow />
            <AdBox />
            <JobBox />
          </aside>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal 
          postId={currentPostId} 
          isOpen={showCommentModal} 
          onClose={handleCloseCommentModal} 
        />
      )}
    </div>
  );
}

export default HomePage;
