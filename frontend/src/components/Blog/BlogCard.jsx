import { Link } from "react-router-dom";
import blogImage from "../../assets/img/blog1.jpg";

const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

const BlogCard = ({ article }) => {
  let userPhoto = "";
  if (article.user?.photo) {
    userPhoto = article.user.photo.startsWith("http")
      ? article.user.photo
      : `${apiUrl}/${article.user.photo.replace(/^\/+/, "")}`;
  }

  let formattedDate = "Unknown date";

  try {
    const dateObj = new Date(article.created_at);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch (e) {
    console.warn("Error parsing date:", e);
  }

  return (
    <Link to={`/blog-detail/${article.slug}`} className="block h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition h-full flex flex-col">
        {/* Gambar Blog dengan aspect ratio 4:3 */}
        <div className="w-full aspect-[4/3] bg-gray-200 overflow-hidden">
          <img
            src={article.photo || blogImage}
            alt="blog banner"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-grow flex flex-col px-4 py-3">
          {/* Kategori */}
          <div className="flex">
            <span className="inline-flex border bg-blue-100 border-blue-400 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2 w-fit max-w-full whitespace-normal break-words">
              {article.category}
            </span>
          </div>

          {/* Judul */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight break-words">
            {article.title}
          </h3>

          {/* Konten */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words overflow-hidden">
            {article.content}
          </p>

          {/* Garis Pemisah */}
          <hr className="my-3 sm:my-4" />

          {/* Informasi Pengguna */}
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={article.user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(article.user?.name || "U");
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-xs sm:text-sm">
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

            <div className="ml-2 sm:ml-3">
              <p className="font-semibold text-gray-900 text-xs sm:text-base">
                {article.user?.name || "Unknown User"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
