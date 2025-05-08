import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import Case from "../../components/Case";
import RandomPosts from "../../components/Blog/RandomPosts";
import deleteBlog from "../../components/Blog/DeleteBlog";
import { categories } from "../../components/Blog/CategoryStep";
import Toast from "../../components/Blog/Toast";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const cleanHTML = (html) => {
    return html
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  };

  useEffect(() => {
    if (!slug) {
      setToast({ message: "Blog tidak ditemukan!", type: "error" });
      navigate("/blog");
      return;
    }

    const fetchBlogDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/blogs/slug/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setArticle(response.data.data);
      } catch (error) {
        console.error("Gagal memuat blog:", error);
        setToast({ message: "Blog tidak ditemukan!", type: "error" });
        navigate("/blog");
      }
    };

    fetchBlogDetail();
  }, [slug, navigate]);

  const handlePrevImage = () => {
    if (article?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? article.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (article?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === article.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (!article) {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center py-20 text-xl text-gray-700">
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
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}

      <div className="relative py-10 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white shadow-md rounded-lg overflow-hidden relative">
                <div className="relative h-[400px]">
                  {article.images?.[currentImageIndex] && (
                    <img
                      src={article.images[currentImageIndex]}
                      alt="Blog"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {article.images?.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow hover:bg-white"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={handleNextImage}
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

              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold">0 Reviews</h3>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="5"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2 rounded"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <RandomPosts excludeSlug={slug} />
            </div>
          </div>
        </div>

        <button
          className="fixed bottom-20 right-6 bg-red-500 hover:bg-red-400 text-white p-3 rounded-full shadow-lg"
          onClick={() => deleteBlog(article.id, navigate)}
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <button
          className="fixed bottom-6 right-6 bg-sky-500 hover:bg-blue-400 text-white p-3 rounded-full shadow-lg"
          onClick={() => setShowEdit(true)}
        >
          <Pencil className="w-5 h-5" />
        </button>

        {showEdit && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white max-w-3xl w-full p-6 rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowEdit(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-4">Edit Blog</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) =>
                      setArticle({ ...article, title: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={article.category}
                    onChange={(e) =>
                      setArticle({ ...article, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border bg-white"
                  >
                    <option value="" disabled>
                      Pilih kategori
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const token = localStorage.getItem("token");
                      const formData = new FormData();
                      formData.append("photo", file);

                      try {
                        const res = await fetch(
                          `http://localhost:3000/api/blogs/${article.id}/upload-photo`, // Hapus koma di sini
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                          }
                        );

                        const result = await res.json();
                        setArticle({ ...article, images: [result.imageUrl] });
                        setToast({ message: "Gambar berhasil diunggah!", type: "success" });
                      } catch {
                        setToast({ message: "Gagal upload gambar.", type: "error" });
                      }
                    }}
                    className="w-full px-3 py-2 rounded border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    rows={6}
                    value={cleanHTML(article.content)}
                    onChange={(e) =>
                      setArticle({
                        ...article,
                        content: cleanHTML(e.target.value),
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
              <div className="text-right mt-6">
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                      await axios.put(
                        `http://localhost:3000/api/blogs/${article.id}`,
                        article,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      setShowEdit(false);
                      setToast({ message: "Blog berhasil diperbarui!", type: "success" });
                    } catch {
                      setToast({ message: "Gagal update blog.", type: "error" });
                    }
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
