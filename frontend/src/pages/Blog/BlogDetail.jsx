// BlogDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Case from "../../components/Case";
import { Pencil } from "lucide-react";
import { categories } from "../../components/Blog/CategoryStep";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [article, setArticle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
    const foundBlog = blogs.find((blog) => blog.id === id);
    if (foundBlog) {
      setArticle(foundBlog);
    } else {
      alert("Blog tidak ditemukan!");
      navigate("/blog");
    }
  }, [id, navigate]);

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? article.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === article.images.length - 1 ? 0 : prev + 1
    );
  };

  if (!article) {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center py-20 text-xl text-gray-700">
          <div className="text-6xl mb-4">😢</div>
          <p className="mb-6">Blog tidak ditemukan</p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Kembali ke Beranda
          </a>
        </div>
      </Case>
    );
  }

  return (
    <Case>
      <div className="relative py-10 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Konten Artikel */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white shadow-md rounded-lg overflow-hidden relative">
                {/* Gambar carousel */}
                <div className="relative h-[400px]">
                  <img
                    className="w-full h-full object-cover"
                    src={article.images[currentImageIndex]}
                    alt="Blog"
                  />
                  {article.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow hover:bg-white"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow hover:bg-white"
                      >
                        &gt;
                      </button>
                    </>
                  )}
                </div>

                <div className="p-6">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <h2 className="text-2xl font-semibold mt-3">{article.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">{article.date}</p>
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              </div>

              {/* Komentar Review */}
              <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold">0 Reviews</h3>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  <div className="flex items-start gap-4 border-b pb-4">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src="/img/profile.jpg"
                      alt="User"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm">
                        User name
                        <span className="text-gray-400 text-xs ml-2">Apr 17, 2025</span>
                      </h5>
                      <p className="text-gray-700 text-sm">
                        The comment from the user who read this blog has been submitted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Komentar */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="5"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2 rounded transition"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h5 className="text-lg font-semibold mb-4">Popular Posts</h5>
                <div className="space-y-3">
                  {["Possimus aut mollitia eum ipsum", "Nulla malesuada mauris non nulla", "Focus on creating and growing"].map((title, index) => (
                    <div key={index}>
                      <a href="#" className="text-blue-600 font-medium hover:underline">
                        {title}
                      </a>
                      <p className="text-gray-500 text-sm">April 05, 2020</p>
                      {index < 2 && <hr />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Edit */}
        <button
          className="fixed bottom-6 right-6 bg-sky-500 hover:bg-blue-400 text-white p-3 rounded-full shadow-lg transition"
          onClick={() => setShowEdit(true)}
        >
          <Pencil className="w-5 h-5" />
        </button>

        {/* Popup Edit */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white max-w-3xl w-full p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setShowEdit(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Blog</h2>
              <div className="space-y-4">
                {/* Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                {/* Kategori Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={article.category}
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  >
                    <option value="" disabled>Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setArticle({ ...article, images: [reader.result] });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  />
                </div>
              </div>
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                  Content
                </label>
                <textarea
                  rows={6}
                  value={article.content}
                  onChange={(e) => {
                    const cleanedContent = e.target.value.replace(/<\/?p>/g, "");
                    setArticle({ ...article, content: cleanedContent });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
                />
              </div>

              <div className="text-right mt-6">
                <button
                  onClick={() => {
                    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
                    const updated = blogs.map((b) => (b.id === article.id ? article : b));
                    localStorage.setItem("blogs", JSON.stringify(updated));
                    setShowEdit(false);
                    alert("Blog telah diperbarui!");
                  }}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Case>
  );
};

export default BlogDetail;
