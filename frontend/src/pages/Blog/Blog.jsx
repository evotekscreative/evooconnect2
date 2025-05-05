import React, { useState } from "react";
import Case from "../../components/Case";
import { Link } from "react-router-dom";
import blogImage from "../../assets/img/blog1.jpg";

const dummyArticles = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Blog Title #${i + 1}`,
  category: "Career",
  description:
    "A short description of the blog content will be shown here as preview.",
  author: "Author Name",
  date: "April 18, 2025",
  image: "https://via.placeholder.com/600x300",
  photo: "https://via.placeholder.com/32",
}));

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(0); // 0 = 1–3, 1 = 4–6, dst

  const itemsPerPage = 6;
  const totalPages = Math.ceil(dummyArticles.length / itemsPerPage);
  const totalGroups = Math.ceil(totalPages / 3);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = dummyArticles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const currentPageNumbers = Array.from({ length: 3 }, (_, i) => pageGroup * 3 + i + 1)
    .filter((page) => page <= totalPages);

  return (
    <Case>
      {/* Header dengan background image */}
      <div
        className="bg-cover bg-center h-[350px] rounded-b-3xl"
        style={{ backgroundImage: `url(${blogImage})` }}
      >
        <div className="h-[350px] bg-black bg-opacity-60 text-white py-20 px-4 rounded-b-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">EVOConnect Blog</h1>
          <p className="max-w-3xl mx-auto text-lg font-light">
            Write, Inspire, and Elevate Your Career - Every blog post is a stepping stone
            towards professional growth, industry recognition, and meaningful connections
            that can shape your future.
          </p>
          <div className="mt-6">
            <a
              href="/create-blog"
              className="inline-block bg-white text-gray-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
            >
              Write Your Career Story
            </a>
          </div>
        </div>
      </div>

      {/* Blog Cards */}
      <div className="bg-white max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">
          Latest Articles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentArticles.map((article) => (
            <Link to={`/detail-blog/${article.id}`} className="block" key={article.id}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition">
                <img
                  src={article.image}
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
                  <p className="text-sm text-gray-600">{article.description}</p>
                </div>
                <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={article.photo}
                      className="w-8 h-8 rounded-full"
                      alt="Author"
                    />
                    <span className="font-medium">{article.author}</span>
                  </div>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
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
      </div>
    </Case>
  );
};

export default Blog;
