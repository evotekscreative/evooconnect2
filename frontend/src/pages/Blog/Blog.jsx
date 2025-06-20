import React, { useState, useEffect } from "react";
import axios from "axios";
import Case from "../../components/Case";
import BlogHeader from "../../components/Blog/BlogHeader";
import BlogCard from "../../components/Blog/BlogCard";
import Pagination from "../../components/Blog/Pagination";

const cleanHTML = (html) => {
  if (!html) return "";
  return html
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
};

const Blog = () => {
          const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(apiUrl + "/api/blogs", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", 
          },
        });

        const blogsWithCleanContent = response.data.map((blog) => ({
          ...blog,
          content: cleanHTML(blog.content),
          photo: blog.photo && /\.(jpg|jpeg|png)$/i.test(blog.photo)
            ? `${apiUrl}/${blog.photo}`
            : "https://via.placeholder.com/300", 
        }));

        // Urutkan ASCENDING: terbaru di paling awal
        blogsWithCleanContent.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setBlogs(blogsWithCleanContent);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const totalGroups = Math.ceil(totalPages / 3);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = blogs.slice(startIndex, startIndex + itemsPerPage);
  const currentPageNumbers = Array.from({ length: 3 }, (_, i) => pageGroup * 3 + i + 1)
    .filter((page) => page <= totalPages);

  return (
    <Case>
      <BlogHeader />
      <div className="bg-white max-w-7xl mx-auto px-4 py-10 pb-16 md:pb-0 mb-10">
        <h2 className="h-[80px] sm:h-[120px] text-2xl font-semibold text-center text-gray-800">
          Latest Articles
        </h2>

        {blogs.length === 0 ? (
          <p className="text-center text-gray-500">No articles yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {currentArticles.map((article) => (
                <BlogCard article={article} key={article.id} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              pageGroup={pageGroup}
              totalGroups={totalGroups}
              currentPageNumbers={currentPageNumbers}
              setCurrentPage={setCurrentPage}
              setPageGroup={setPageGroup}
            />
          </>
        )}
      </div>
    </Case>
  );
};

export default Blog;
