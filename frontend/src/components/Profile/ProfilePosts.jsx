import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfilePosts({
  userPosts,
  user,
  profileImage,
  apiUrl,
  scrollLeft,
  scrollRight,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-[#00AEEF]" />
          <h3 className="font-semibold text-lg">POST</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        id="post-container"
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
      >
        {userPosts && userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="flex-shrink-0 w-64 border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {profileImage ? (
                      <img
                        src={apiUrl + "/" + profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-lg font-bold text-gray-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {user.headline || "No headline"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(post.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}{" "}
                      • 🌐
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <Link
                  to={`/post/${post.id}`}
                  className="text-sm text-gray-700 mb-3"
                >
                  <p className="mb-3">
                    {post.content
                      ? post.content.length > 100
                        ? post.content
                            .substring(0, 100)
                            .replace(/<[^>]*>/g, "") + "..."
                        : post.content.replace(/<[^>]*>/g, "")
                      : "No content"}
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={apiUrl + "/" + post.images[0]}
                        alt={`Post ${post.id}`}
                        className="w-full rounded-md"
                      />
                    </div>
                  )}
                </Link>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    <span>{post.likes_count || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>{post.comments_count || 0} comments</span>
                    <span>{post.shares_count || 0} shares</span>
                  </div>
                </div>
                <Link to="/post-page">
                  <div className="flex border-t mt-3 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1 hover:bg-gray-50 rounded text-gray-600 text-sm">
                      <ThumbsUp size={16} /> Like
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-1 hover:bg-gray-50 rounded text-gray-600 text-sm">
                      <MessageCircle size={16} /> Comment
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-1 hover:bg-gray-50 rounded text-gray-600 text-sm">
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 w-full">
            <p className="text-gray-500">No posts yet</p>
          </div>
        )}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex justify-center mt-4">
        <button className="text-[#00AEEF] text-asmibold font-semibold hover:underline">
          <Link to="/post-page"> See All Post </Link>
        </button>
      </div>
    </div>
  );
}