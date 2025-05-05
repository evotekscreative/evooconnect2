import React, { useState, useEffect } from "react";
import Case from "../../components/Case";
import { Link } from "react-router-dom";
import blogImage from "../../assets/img/blog1.jpg";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(0);

  const itemsPerPage = 6;

  useEffect(() => {
    const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
    setBlogs(storedBlogs.reverse());
    localStorage.setItem("cachedBlogs", JSON.stringify(storedBlogs));
  }, []);
  

  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const totalGroups = Math.ceil(totalPages / 3);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = blogs.slice(startIndex, startIndex + itemsPerPage);

  const currentPageNumbers = Array.from({ length: 3 }, (_, i) => pageGroup * 3 + i + 1)
    .filter((page) => page <= totalPages);

  return (
    <Case>
      {/* Header */}
      <div
        className="bg-cover bg-center h-[350px] rounded-b-3xl"
        style={{ backgroundImage: `url(${blogImage})` }}
      >
        <div className="h-[350px] bg-black bg-opacity-60 text-white py-20 px-4 rounded-b-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">EVOConnect Blog</h1>
          <p className="max-w-3xl mx-auto text-lg font-light">
            Write, Inspire, and Elevate Your Career.
          </p>
          <div className="mt-6">
            <Link
              to="/create-blog"
              className="inline-block bg-white text-gray-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
            >
              Write Your Career Story
            </Link>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="bg-white max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">
          Latest Articles
        </h2>

        {blogs.length === 0 ? (
          <p className="text-center text-gray-500">No articles yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.map((article) => (
                <Link to={`/detail-blog/${article.id}`} className="block" key={article.id}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition">
                    <img
                      src={article.images?.[0]?.base64 || blogImage}
                      alt="blog banner"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {article.content}
                      </p>
                    </div>
                    <div className="flex justify-between p-4 border-t text-sm text-gray-500">
                      <span>By Admin</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-2 flex-wrap">
              {pageGroup > 0 && (
                <button
                  onClick={() => setPageGroup((prev) => Math.max(prev - 1, 0))}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition font-semibold"
                >
                  &laquo;
                </button>
              )}

              {currentPageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-full ${
                    currentPage === page
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-700"
                  } hover:bg-blue-600 hover:text-white transition font-semibold`}
                >
                  {page}
                </button>
              ))}

              {pageGroup < totalGroups - 1 && (
                <button
                  onClick={() => setPageGroup((prev) => prev + 1)}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition font-semibold"
                >
                  &raquo;
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Case>
  );
};

export default Blog;
