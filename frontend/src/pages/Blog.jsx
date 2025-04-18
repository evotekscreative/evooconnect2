import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo1.png';

function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data buat si blog posts
  const blogPosts = [
    {
      id: 1,
      title: "The Ultimate Guide to Career Growth in 2023 Dari El Career",
      category: "Career",
      excerpt: "Discover proven strategies to accelerate your career growth in today's competitive job market. Learn how to position yourself for success.",
      author: {
        name: "Prince Bammmmmm",
        avatar: "/img/p9.png"
      },
      date: {
        month: "October",
        day: 12,
        year: 2023
      }
    },
    {
      id: 2,
      title: "Beauty Industry Insights: Trends to Watch in 2023",
      category: "Beauty",
      excerpt: "The beauty industry is constantly evolving. From sustainable practices to innovative products, discover what's trending in beauty this year.",
      author: {
        name: "Annonymous Vyeodorovna",
        avatar: "/img/p10.png"
      },
      date: {
        month: "November",
        day: 5,
        year: 2023
      }
    },
    {
      id: 3,
      title: "Remote Work Revolution: Building Effective Virtual Teams",
      category: "Workplace",
      excerpt: "The shift to remote work has transformed how we collaborate. Learn best practices for managing and motivating distributed teams.",
      author: {
        name: "Michael CJ",
        avatar: "/img/p11.png" 
      },
      date: {
        month: "September",
        day: 28,
        year: 2023
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="primary-color shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/">
                <img src={logo} alt="EVOConnect Logo" className="h-8 w-auto object-contain" />
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 relative">
              <input
                type="text"
                placeholder="Search people, jobs & more"
                className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              {/* Jobs */}
              <Link to="/jobs" className="flex flex-col items-center text-sm hover:text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="mt-1">Jobs</span>
              </Link>

              {/* Connections */}
              <Link to="/connections" className="flex flex-col items-center text-sm hover:text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="mt-1">Connections</span>
              </Link>

              {/* Blog */}
              <Link to="/blog" className="flex flex-col items-center text-sm hover:text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="mt-1">Blog</span>
              </Link>

              {/* Messages with notification */}
              <Link to="/messages" className="flex flex-col items-center text-sm hover:text-blue-200">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </div>
                <span className="mt-1">Messages</span>
              </Link>

              {/* Notifications with bubble */}
              <Link to="/notifications" className="flex flex-col items-center text-sm hover:text-blue-200">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-blue-300 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    7
                  </span>
                </div>
                <span className="mt-1">Notifications</span>
              </Link>

              {/* User Avatar */}
              <div className="relative group">
                <button className="flex items-center focus:outline-none">
                  <img 
                    src="/img/p1.png" 
                    alt="User Avatar" 
                    className="h-8 w-8 rounded-full border-2 border-white"
                  />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Help Center
                  </Link>
                  <hr className="my-1" />
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign Out
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">EVOConnect Blog</h1>
          <h2 className="text-xl md:text-2xl mb-8">Write, Inspire, and Elevate Your Career - Every blog post is a stepping stone towards professional growth, industry recognition, and meaningful connections that can shape your future.</h2>
          <button className="btn-primary px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
            Subscribe to Our Newsletter
          </button>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Latest Articles</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <article 
                key={post.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/blog/${post.id}`}>
                  <img 
                    src={`/img/blog-${post.id}.jpg`} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://th.bing.com/th/id/R.dcf7a758bc7ab22b3a85391053f21415?rik=WIx45ed3Ei%2bl6g&riu=http%3a%2f%2fclipart-library.com%2fimg%2f780496.jpg&ehk=Z1z6ROV61p4dxZ%2btMVSLLUS2x8Tp97fdGzaU5NGhMPs%3d&risl=&pid=ImgRaw&r=0"; 
                    }}
                  />
                </Link>
                
                <div className="p-6">
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                  </div>
                  
                  <Link to={`/blog/${post.id}`}>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-700">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="border-t pt-4 flex items-center">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="h-10 w-10 rounded-full mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/default-avatar.png"; // Fallback avatar
                      }}
                    />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">{post.author.name}</span>
                      <div>
                        {post.date.month} {post.date.day}, {post.date.year}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter to receive the latest articles, career advice, and industry insights.
          </p>
          
          <form className="flex flex-col md:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <img src={logo} alt="EVOConnect Logo" className="h-8 mb-4" />
              <p className="text-blue-200 max-w-xs">
                Connect, learn, and grow with professionals from around the world.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h5 className="font-semibold text-lg mb-4">Company</h5>
                <ul className="space-y-2 text-blue-200">
                  <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                  <li><Link to="/press" className="hover:text-white">Press</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-lg mb-4">Resources</h5>
                <ul className="space-y-2 text-blue-200">
                  <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                  <li><Link to="/guidelines" className="hover:text-white">Community Guidelines</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-lg mb-4">Legal</h5>
                <ul className="space-y-2 text-blue-200">
                  <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                  <li><Link to="/cookies" className="hover:text-white">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">© 2023 EVOConnect. All rights reserved.</p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-blue-200 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-blue-200 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-blue-200 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              
              <a href="#" className="text-blue-200 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Blog;