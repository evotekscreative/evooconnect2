import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, MoreVertical, Flag } from "lucide-react";
import axios from "axios";
import Case from "../../components/Case";
import RandomPosts from "../../components/Blog/RandomPosts";
import EditBlog from "../../components/Blog/EditBlog";
import Toast from "../../components/Blog/Toast";
import { useLocation } from "react-router-dom";
import BlogMenu from "../../components/Blog/BlogMenu";
import ReportModal from "../../components/Blog/ReportModal";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.showPublishedToast) {
      showToast("Blog has been published successfully.", "success");
    }
  }, [location.state]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!slug) {
      showToast("Undefined Blog", "error");
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
        console.error("Failed to load blog:", error);
        showToast("Undefined Blog", "error");
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/blogs/${article.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Blog has been deleted.");
      navigate("/blog");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      showToast("Failed to delete blog.", "error");
    }
    setShowDeleteModal(false);
  };

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  const handleReportClick = (userId, targetType, targetId) => {
    setReportTarget({ userId, targetType, targetId });
    setShowReportModal(true);
  };

  const handleReportSubmit = async () => {
    if (!reportTarget || !selectedReason) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to report.", "error");
      return;
    }
    const reason = selectedReason === "Other" ? customReason : selectedReason;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/reports/${reportTarget.userId}/${reportTarget.targetType}/${reportTarget.targetId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast("Report successfully submitted");
    } catch (err) {
      console.error("Failed to submit report:", err.response.data.error);
      showToast(err.response.data.error, "error");
    }

    setShowReportModal(false);
    setSelectedReason("");
    setCustomReason("");
    setReportTarget(null);
  };

  if (!article) {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center py-20 text-xl text-gray-700">
          <p className="mb-6">Blog not found</p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Home
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
            <div className="md:col-span-2 space-y-6 relative">
              <div className="bg-white shadow-md rounded-lg relative">
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
                  <div className="flex items-start justify-between">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {article.category}
                    </span>

                    <BlogMenu
                      onEdit={() => setShowEdit(true)}
                      onDelete={openDeleteModal}
                      onReport={() => handleReportClick(article.user?.id, "blog", article.id)}
                    />
                  </div>

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
      </div>

      {showEdit && (
        <EditBlog
          article={article}
          setArticle={setArticle}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
          }}
          showToast={showToast}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete Blog</h3>
            <p className="mb-4">Are you sure you want to delete this blog?</p>
            <div className="mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded"
              >
                Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-2 ml-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        reasons={["Harassment", "Fraud", "Spam", "Missinformation", "Hate Speech", "Threats or violence", "self-harm", "Graphic or violent content", "Dangerous or extremist organizations", "Sexual Content", "Fake Account", "Child Exploitation", "Illegal products and services", "Infringement", "Other"]}
        selectedReason={selectedReason}
        setSelectedReason={setSelectedReason}
        customReason={customReason}
        setCustomReason={setCustomReason}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Case>
  );
};

export default BlogDetail;
