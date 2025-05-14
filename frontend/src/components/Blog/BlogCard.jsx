import { Link } from "react-router-dom";
import blogImage from "../../assets/img/blog1.jpg";

const BlogCard = ({ article }) => (
  <Link to={`/blog-detail/${article.slug}`} className="block">
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition">
      <img
        src={article.photo || blogImage}
        alt="blog banner"
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          {article.category}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{article.content}</p>
      </div>
      <div className="flex justify-between p-4 border-t text-sm text-gray-500">
        <span>{article.author || "Admin"}</span>
        <span>{article.date}</span>
      </div>
    </div>
  </Link>
);

export default BlogCard;
