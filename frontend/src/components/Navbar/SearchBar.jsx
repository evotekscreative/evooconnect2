import { Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("q") || "";
  });

  // Update search query when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex items-center bg-white rounded-full px-3 py-2 ml-2 sm:ml-4 
                    w-[140px] sm:w-[180px] md:w-[220px] lg:w-[280px] xl:w-[320px]
                    transition-all duration-200 ease-in-out">
      <form onSubmit={handleSearch} className="flex items-center w-full">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 min-w-0 px-2 text-sm text-black bg-transparent 
                     focus:outline-none placeholder:text-gray-500
                     sm:placeholder:text-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit" 
          className="flex-shrink-0 ml-1 p-1 hover:bg-gray-100 rounded-full
                     transition-colors duration-150"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-gray-600 hover:text-black" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;