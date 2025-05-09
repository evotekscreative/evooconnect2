import { useState, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PostCard = forwardRef(({ post, onComment }, ref) => {
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  
  // Format post date helper
  const formatPostDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Handle like action
  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/posts/${post.id}/like`);
      if (response.data.status === 'liked') {
        setLiked(true);
        setLikeCount(prev => prev + 1);
      } else {
        setLiked(false);
        setLikeCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Parse images if available
  const images = post.image ? JSON.parse(post.image) : [];

  return (
    <div 
      ref={ref} 
      className="box mb-3 rounded border bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Post Header */}
      <div className="border-bottom p-3 flex items-center justify-between border-b">
        <div className="flex items-center">
          <div className="mr-2 relative">
            <img 
              className="rounded-full w-10 h-10 object-cover" 
              src={post.user?.profile_photo_url || '/img/default-photo.png'} 
              alt="User photo" 
            />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${
              post.user?.is_online ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="font-bold">
            <Link to={`/profile/${post.user?.username}`}>
              <div className="text-sm truncate">{post.user?.name || 'Anonymous'}</div>
            </Link>
            <div className="text-xs text-gray-500">{formatPostDate(post.created_at)}</div>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" 
          title="Visibility: public" className="bi bi-globe2" viewBox="0 0 16 16">
          <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855q-.215.403-.395.872c.705.157 1.472.257 2.282.287zM4.249 3.539q.214-.577.481-1.078a7 7 0 0 1 .597-.933A7 7 0 0 0 3.051 3.05q.544.277 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9 9 0 0 1-1.565-.667A6.96 6.96 0 0 0 1.018 7.5zm1.4-2.741a12.3 12.3 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332M8.5 5.09V7.5h2.99a12.3 12.3 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.6 13.6 0 0 1 7.5 10.91V8.5zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741zm-3.282 3.696q.18.469.395.872c.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a7 7 0 0 1-.598-.933 9 9 0 0 1-.481-1.079 8.4 8.4 0 0 0-1.198.49 7 7 0 0 0 2.276 1.522zm-1.383-2.964A13.4 13.4 0 0 1 3.508 8.5h-2.49a6.96 6.96 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667m6.728 2.964a7 7 0 0 0 2.275-1.521 8.4 8.4 0 0 0-1.197-.49 9 9 0 0 1-.481 1.078 7 7 0 0 1-.597.933M8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855q.216-.403.395-.872A12.6 12.6 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.96 6.96 0 0 0 14.982 8.5h-2.49a13.4 13.4 0 0 1-.437 3.008M14.982 7.5a6.96 6.96 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008z" />
        </svg>
      </div>

      {/* Post Image Carousel */}
      {images.length > 0 && (
        <div 
          id={`carousel-${post.id}`} 
          className="carousel slide relative" 
          data-bs-ride="carousel"
          style={{ height: images.length > 0 ? '400px' : '0' }}
        >
          <div className="carousel-inner h-full">
            {images.map((image, index) => (
              <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''} h-full`}>
                <img 
                  src={`/storage/${image}`} 
                  className="d-block w-full h-full object-cover" 
                  alt={`Post image ${index + 1}`} 
                />
              </div>
            ))}
          </div>
          
          {/* Carousel Controls (only if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                className="carousel-control-prev absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline left-0"
                type="button"
                data-bs-target={`#carousel-${post.id}`}
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon inline-block bg-no-repeat" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline right-0"
                type="button"
                data-bs-target={`#carousel-${post.id}`}
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon inline-block bg-no-repeat" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Post Caption & Footer */}
      <div className="p-3">
        <div className="mb-2">
          <strong>{post.user?.name}</strong>
          <span className="ml-2" dangerouslySetInnerHTML={{ __html: post.content }}></span>
        </div>
        
        <div className="flex items-center mt-2">
          <button 
            className={`flex items-center px-4 py-2 mr-2 rounded-md transition ${
              liked ? 'text-red-500' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={handleLike}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={liked ? "currentColor" : "none"} 
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={liked ? "0" : "2"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Like {likeCount > 0 && `(${likeCount})`}
          </button>
          
          <button 
            className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
            onClick={() => onComment(post.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comment
          </button>
        </div>
      </div>
    </div>
  );
});

export default PostCard;