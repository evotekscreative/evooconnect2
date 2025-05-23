import React, { useEffect, useState } from "react";
import axios from "axios";

const RandomPosts = ({ excludeId }) => {
          const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [randomPosts, setRandomPosts] = useState([]);

  useEffect(() => {
    const fetchRandomPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl +"/api/blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = res.data.filter((post) => post.id !== excludeId);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRandomPosts(shuffled.slice(0, 3));
        console.log("Random posts:", shuffled.slice(0, 3));
      } catch (err) {
        console.error("Gagal memuat random posts:", err);
      }
    };

    fetchRandomPosts();
  }, [excludeId]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h5 className="text-xl font-semibold mb-4 border-b pb-2">Recommended Posts</h5>
      <div className="space-y-4">
        {randomPosts.map((post) => (
          <div key={post.id} className="flex space-x-3 pb-3 border-b last:border-0">
            <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded">
              {post.photo ? (
                <img 
                  src={apiUrl + "/" +post.photo} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {post.category && (
                <span className="text-xs font-medium text-blue-500 uppercase">
                  {post.category}
                </span>
              )}
              <a
                href={`/blog-detail/${post.slug}`}
                className="block text-gray-800 font-medium hover:text-blue-600 truncate"
              >
                {post.title}
              </a>
              {post.content && (
                <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                  {post.content.replace(/<[^>]*>/g, '')}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">{post.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RandomPosts;
