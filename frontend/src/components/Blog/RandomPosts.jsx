import React, { useEffect, useState } from "react";
import axios from "axios";

const RandomPosts = ({ excludeId }) => {
  const [randomPosts, setRandomPosts] = useState([]);

  useEffect(() => {
    const fetchRandomPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = res.data.filter((post) => post.id !== excludeId);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRandomPosts(shuffled.slice(0, 3));
      } catch (err) {
        console.error("Gagal memuat random posts:", err);
      }
    };

    fetchRandomPosts();
  }, [excludeId]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h5 className="text-lg font-semibold mb-4">Random Post</h5>
      <div className="space-y-3">
        {randomPosts.map((post) => (
          <div key={post.id}>
            <a
              href={`/blog-detail/${post.slug}`}
              className="text-blue-600 font-medium hover:underline"
            >
              {post.title}
            </a>
            <p className="text-gray-500 text-sm">{post.date}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RandomPosts;
