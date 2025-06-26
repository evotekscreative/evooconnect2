import { Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("q") || "";
  });

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

  return (
    <div className="flex-1">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white mr-1 rounded-full px-3 py-2 w-full transition-all duration-200 ease-in-out"
      >
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 px-2 text-sm text-black bg-transparent 
                     focus:outline-none placeholder:text-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="ml-1 p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-gray-600 hover:text-black" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
