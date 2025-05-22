import { Link } from "react-router-dom";
import blogImage from "../../assets/img/blog1.jpg";

const BlogHeader = () => (
  <div
    className="bg-cover bg-center h-[350px] rounded-b-3xl"
    style={{ backgroundImage: `url(${blogImage})` }}
  >
    <div className="h-[350px] bg-black bg-opacity-60 text-white py-20 px-4 rounded-b-3xl text-center">
      <h1 className="text-4xl font-bold mb-4">EVOConnect Blog</h1>
      <p className="max-w-3xl mx-auto text-lg font-light">
        Write, Inspire, and Elevate Your Career.
      </p>
      <div className="mt-6">
        <Link
          to="/create-blog"
          className="inline-block bg-white text-gray-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
        >
          Share your thoughts
        </Link>
      </div>
    </div>
  </div>
);

export default BlogHeader;
