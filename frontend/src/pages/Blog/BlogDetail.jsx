import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Case from "../../components/Case";
import axios from "axios";
import RandomPosts from "../../components/Blog/RandomPosts";
import EditBlog from "../../components/Blog/EditBlog";
import DeleteBlog from "../../components/Blog/DeleteBlog";
import Toast from "../../components/Blog/Toast";
import BlogMenu from "../../components/Blog/BlogMenu";
import ReportModal from "../../components/Blog/ReportModal";
import CommentSection from "../../components/Blog/CommentSection";
import { CircleArrowLeft } from 'lucide-react';


const BlogDetail = () => {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [article, setArticle] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "",
    message: "",
  });
  useEffect(() => {
  if (location.state?.showPublishedToast) {
    setAlertInfo({
      show: true,
      type: "success",
      message: "Blog has been published successfully.",
    });
  }
}, [location.state]);

  useEffect(() => {
    if (!slug) {
      setAlertInfo({
  show: true,
  type: "error",
  message: "Undefined Blog",
});

      navigate("/blog");
      return;
    }

    const fetchBlogDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${apiUrl}/api/blogs/slug/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const blogData = response.data.data;

        // Transformasi path gambar menjadi absolute URL
        const transformedBlog = {
          ...blogData,
          photo: blogData.photo
            ? `${apiUrl}/${blogData.photo}`
            : "https://via.placeholder.com/400", // Gambar default jika tidak ada
        };

        setArticle(transformedBlog);
      } catch (error) {
        console.error("Failed to load blog:", error);
        showToast("Undefined Blog", "error");
        navigate("/blog");
      }
    };

    fetchBlogDetail();
  }, [slug, navigate, refreshKey]); // refreshKey sebagai dependency untuk memicu reload

  const handleDelete = async () => {
    if (!article?.slug) {
      showToast("Blog not found.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/blogs/${article.slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/blog");
    setAlertInfo({
        show: true,
        type: "success",
        message: "Successfully deleted blog!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to delete blog.",
      });
      showToast("Failed to delete blog.", "error");
    }
    setShowDeleteModal(false);
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
      await axios.post(
        `${apiUrl}/api/reports/${reportTarget.userId}/${reportTarget.targetType}/${reportTarget.targetId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast("Report successfully submitted", "success");
    } catch (err) {
      console.error("Failed to submit report:", err);
      showToast("Failed to submit report.", "error");
    }

    setShowReportModal(false);
    setSelectedReason("");
    setCustomReason("");
    setReportTarget(null);
  };

  // Fungsi untuk memaksa refresh data blog setelah update
  const handleBlogUpdated = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment refreshKey untuk memicu useEffect
    setShowEdit(false); // Tutup modal edit
   setAlertInfo({
  show: true,
  type: "success",
  message: "Blog successfully updated!",
});

   };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!article) {
    return <div className="text-center py-10">Loading blog detail...</div>;
  }

  return (
    
    <Case>
      <div className="relative py-10 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* button back */}
          <Link to="/blog"
            className="fixed top-20 left-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-200"
          >
            <CircleArrowLeft />
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6 relative">
              <div className="bg-white shadow-md rounded-lg relative">
                <div className="relative h-[400px]">
                  {article.photo ? (
                    <img
                      src={`${article.photo}?v=${refreshKey}`} // Parameter query untuk memaksa browser memuat ulang gambar
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex border bg-blue-100 border-blue-400 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2 w-fit">
                      {article.category}
                    </span>
                    <BlogMenu
                      onEdit={() => setShowEdit(true)}
                      onDelete={() => setShowDeleteModal(true)}
                      onReport={() => {
                        setReportTarget({
                          userId: article.user?.id,
                          targetType: "blog",
                          targetId: article.id,
                        });
                        setShowReportModal(true);
                      }}
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

              <CommentSection slug={slug} blogId={article.id} />
            </div>

            <div className="space-y-6">
              <RandomPosts excludeSlug={slug} />
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <DeleteBlog
            articleId={article.id}
            onSuccess={() => {
              showToast("Blog has been deleted.", "success");
              navigate("/blog");
            }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {showEdit && (
          <EditBlog
            article={article}
            setArticle={setArticle}
            onClose={() => setShowEdit(false)}
            onSuccess={handleBlogUpdated}
            showToast={showToast}
          />
        )}

        <ReportModal
          show={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReason("");
            setCustomReason("");
          }}
          onSubmit={handleReportSubmit}
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          customReason={customReason}
          setCustomReason={setCustomReason}
        />

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </Case>
  );
};

export default BlogDetail;
