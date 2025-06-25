import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  LockKeyhole,
  Users,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";

// Komponen utama
export default function ProfilePosts({ userPosts, apiUrl, user, profileImage, username }) {
  const postContainerRef = useRef(null);

  const scrollLeft = () => {
    postContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    postContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return <Globe size={16} className="text-gray-600" />;
      case "private":
        return <LockKeyhole size={16} className="text-gray-600" />;
      case "connections":
      case "only connection":
        return <Users size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-[#00AEEF]" />
          <h3 className="text-lg font-semibold">POST</h3>
        </div>
        {userPosts && userPosts.length > 2 && (
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="p-1 transition bg-gray-100 rounded-full hover:bg-gray-200"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="p-1 transition bg-gray-100 rounded-full hover:bg-gray-200"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable container */}
      <div
        ref={postContainerRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide"
      >
        {userPosts?.length > 0 ? (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="flex-shrink-0 flex flex-col h-auto bg-white border rounded-lg shadow-sm min-w-[250px] max-w-[400px]"
            >
              {/* Post header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                    {profileImage ? (
                      <img
                        src={apiUrl + "/" + profileImage}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-300">
                        <span className="text-lg font-bold text-gray-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{user.name}</h4>
                    <p className="text-xs text-gray-500">
                      {user.headline || "No headline"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      <p className="inline-flex items-center gap-1">
                      • {getVisibilityIcon(post.visibility)}
                      </p>
                    </p>
                  </div>
                </div>
              </div>

              {/* Post content */}
              <div className="p-4 flex flex-col gap-3">
                <Link
                  to={`/post/${post.id}`}
                  className="mb-3 text-sm text-gray-700"
                >
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
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

                {/* Post footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    <span>{post.likes_count || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>{post.comments_count || 0} comments</span>
                    <span>{post.shares_count || 0} shares</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex pt-2 mt-3 border-t">
                  <button className="flex items-center justify-center flex-1 gap-1 py-1 text-sm text-gray-600 rounded hover:bg-gray-50">
                    <ThumbsUp size={16} /> Like
                  </button>
                  <button className="flex items-center justify-center flex-1 gap-1 py-1 text-sm text-gray-600 rounded hover:bg-gray-50">
                    <MessageCircle size={16} /> Comment
                  </button>
                  <button className="flex items-center justify-center flex-1 gap-1 py-1 text-sm text-gray-600 rounded hover:bg-gray-50">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-8 text-center">
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
        <Link
          to={`/post-page/${username}`}
          className="text-[#00AEEF] font-semibold hover:underline"
        >
          See All Posts
        </Link>
      </div>
    </div>
  );
}

// Komponen komentar (jika diperlukan)
export function CommentSection({ comments }) {
  return (
    <div className="bg-black text-white p-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-3 mb-4">
          <img
            src={comment.user.avatar}
            alt={comment.user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{comment.user.username}</span>
              {comment.replyTo && (
                <span className="text-gray-400">
                  &gt; <span className="font-semibold">{comment.replyTo}</span>
                </span>
              )}
            </div>
            <div className="mt-1">{comment.text}</div>
            <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
              <span>{comment.time} Balas</span>
              <span>❤️ {comment.likes}</span>
              <span>👎</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
