import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Case from "../../components/Case";
import axios from "axios";
import RandomPosts from "../../components/Blog/RandomPosts";
import EditBlog from "../../components/Blog/EditBlog";
import DeleteBlog from "../../components/Blog/DeleteBlog";
import Alert from "../../components/Auth/alert";
import BlogMenu from "../../components/Blog/BlogMenu";
import ReportModal from "../../components/Blog/ReportModal";
import CommentSection from "../../components/Blog/CommentSection";
import { CircleArrowLeft } from "lucide-react";

const BlogDetail = () => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [currentUserId, setCurrentUserId] = useState(null);
  const [article, setArticle] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [showBackBtn, setShowBackBtn] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  // Get current user on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUserId(user.id);
    }
  }, []);

  // Check for published toast message
  useEffect(() => {
    if (location.state?.showPublishedToast) {
      setAlertInfo({
        show: true,
        type: "success",
        message: "Blog has been published successfully.",
      });
    }
  }, [location.state]);

  // Fetch blog details
  useEffect(() => {
    if (!slug) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Blog not found",
      });
      navigate("/blog");
      return;
    }

    const fetchBlogDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/api/blogs/slug/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const blogData = response.data.data;
        const transformedBlog = {
          ...blogData,
          photo: blogData.photo
            ? `${apiUrl}/${blogData.photo}`
            : "https://via.placeholder.com/400",
        };

        setArticle(transformedBlog);
      } catch (error) {
        console.error("Failed to load blog:", error);
        setAlertInfo({
          show: true,
          type: "error",
          message: "Failed to load blog",
        });
        navigate("/blog");
      }
    };

    fetchBlogDetail();
  }, [slug, navigate, refreshKey, apiUrl]);

  // Handle blog deletion
  const handleDelete = async () => {
    if (!article?.slug) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Blog not found",
      });
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
        message: "Blog successfully deleted!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to delete blog",
      });
    }
    setShowDeleteModal(false);
  };

  // Handle report submission
  const handleReportSubmit = async () => {
    if (!reportTarget || !selectedReason) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "You must be logged in to report",
      });
      return;
    }

    const reason = selectedReason === "Other" ? customReason : selectedReason;

    try {
      await axios.post(
        `${apiUrl}/api/reports/${reportTarget.userId}/${reportTarget.targetType}/${reportTarget.targetId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertInfo({
        show: true,
        type: "success",
        message: "Report submitted successfully",
      });
    } catch (err) {
      console.error("Report error:", err);
      setAlertInfo({
        show: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "You have already reported this content",
      });
    }

    setShowReportModal(false);
    setSelectedReason("");
    setCustomReason("");
    setReportTarget(null);
  };

  // Handle blog update success
  const handleBlogUpdated = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    setShowEdit(false);
    setAlertInfo({
      show: true,
      type: "success",
      message: "Blog updated successfully!",
    });
  };

  // Close alert message
  const closeAlert = () => {
    setAlertInfo({
      show: false,
      type: "",
      message: "",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch (e) {
      console.warn("Error parsing date:", e);
    }
    return "Unknown date";
  };

  // Get user photo URL
  const getUserPhoto = (user) => {
    if (!user?.photo) return null;
    return user.photo.startsWith("http")
      ? user.photo
      : `${apiUrl}/${user.photo.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (window.innerWidth >= 768) {
            // Hide on desktop
            setShowBackBtn(false);
          } else if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
            setShowBackBtn(true);
          } else {
            setShowBackBtn(false);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (!article) {
    return <div className="text-center py-10">Loading blog...</div>;
  }

  const userPhoto = getUserPhoto(article.user);
  const formattedDate = formatDate(article.created_at);

  return (
    <Case>
      <div className="relative py-10 pb-16 bg-gray-50">
        {/* Alert Component */}
        {alertInfo.show && (
          <div className="fixed top-20 right-4 z-50">
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={closeAlert}
              isVisible={alertInfo.show}
            />
          </div>
        )}

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6 relative">
              
              {/* Blog Content */}
              <div className="bg-white shadow-md rounded-lg relative">
                {/* Blog Image */}
                <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                  {/* Back button absolute di atas gambar */}
                  <Link
                    to="/blog"
                    className={`absolute top-2 left-2 md:hidden bg-sky-400 text-white font-bold w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-sky-500 transition-all duration-300
                      ${showBackBtn ? "z-50 opacity-100" : "z-0 opacity-0 pointer-events-none"}`}
                    style={{ transition: "z-index 0.3s, opacity 0.3s" }}
                  >
                    <CircleArrowLeft />
                  </Link>
                  {article.photo ? (
                    <img
                      src={`${article.photo}?v=${refreshKey}`}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Blog Details */}
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
                      currentUserId={currentUserId}
                      postOwnerId={article.user?.id}
                    />
                  </div>

                  <h2 className="text-2xl font-semibold mt-3">
                    {article.title}
                  </h2>

                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* Author Info */}
                  <hr className="my-4" />
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={article.user?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              article.user?.name || "U"
                            )}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {article.user?.name
                              ? article.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                              : "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <Link
                        to={`/user-profile/${article.user?.username}`}
                        className=" font-semibold text-gray-800 hover:underline"
                      >
                        {article.user?.name || "Unknown User"}
                      </Link>
                      <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <CommentSection slug={slug} blogId={article.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RandomPosts excludeSlug={slug} />
            </div>
          </div>
        </div>

        {/* Modals */}
        {showDeleteModal && (
          <DeleteBlog
            articleId={article.id}
            onSuccess={() => {
              setAlertInfo({
                show: true,
                type: "success",
                message: "Blog has been deleted",
              });
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
            showAlert={(type, message) =>
              setAlertInfo({ show: true, type, message })
            }
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
      </div>
    </Case>
  );
};

export default BlogDetail;
