import { Link } from "react-router-dom";
import blogImage from "../../assets/img/blog1.jpg";

const BlogCard = ({ article }) => (
  <Link to={`/blog-detail/${article.slug}`} className="block h-full">
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition h-full flex flex-col">
      <img
        src={article.photo || blogImage}
        alt="blog banner"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex">
          <span className="inline-flex border bg-blue-100 border-blue-400 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2 w-fit">
            {article.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 flex-grow">{article.content}</p>
      </div>
      <div className="flex justify-between p-4 border-t text-sm text-gray-500 mt-auto">
        {/* <span>{user.name}</span> */}
        <span>{article.date}</span>
      </div>
    </div>
  </Link>
);

export default BlogCard;
