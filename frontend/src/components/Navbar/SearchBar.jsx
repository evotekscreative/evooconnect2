import { Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
const SearchBar = () => {

const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("q") || "";
  });

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      // Tidak perlu reset searchQuery di sini agar tetap ada di input field
    }
  };
  return (
    <div className="hidden sm:flex items-center bg-white rounded-full px-3 py-2 ml-4 w-[180px] md:w-[220px] lg:w-[280px]">
      <form onSubmit={handleSearch} className="w-full">
        <input
          type="text"
          placeholder="Search people, jobs & more"
          className="flex-grow w-full px-2 text-sm text-black bg-transparent focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="hidden">
          <Search className="w-4 h-4 text-black" />
        </button>
      </form>
      <Search className="w-4 h-4 text-black" onClick={handleSearch} />
    </div>
  );
};

export default SearchBar;
