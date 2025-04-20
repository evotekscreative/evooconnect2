import React from "react";
import Case from "../../components/Case";
import { useParams } from "react-router-dom";

const BlogDetail = () => {
  const { id } = useParams();
  const article = {
    id: 1,
    title: `Blog Title #1`,
    category: "Career",
    description: "A short description of the blog content will be shown here as preview.",
    author: "Author Name",
    date: "April 18, 2025",
    image: "https://via.placeholder.com/600x300",
    avatar: "https://via.placeholder.com/32",
  };

  if (!article) {
    return (
      <Case>
      <div className="flex flex-col items-center justify-center py-20 text-xl text-gray-700">
        <div className="text-6xl mb-4">😢</div>
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
    <div className="py-10 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  className="w-full h-[400px] object-cover"
                  src={article.image}
                  alt="Blog"
                />
              <div className="p-6">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {article.category}
                </span>
                <h2 className="text-2xl font-semibold mt-3">{article.title}</h2>
                <p className="text-sm text-gray-500 mb-4">{article.date}</p>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: article.description }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h5 className="text-lg font-semibold mb-4">Popular Posts</h5>
              <div className="space-y-3">
                {["Contoh 1", "Contoh 2", "Contoh 3"].map((title, index) => (
                  <div key={index}>
                    <a href="#" className="text-blue-600 font-medium hover:underline">
                      {title}
                    </a>
                    <p className="text-gray-500 text-sm">April 05, 2020</p>
                    {index < 2 && <hr />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Case>
  );
};

export default BlogDetail;
