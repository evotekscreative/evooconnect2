import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/img/logo1.png";
import { Menu, X, Home, Users, Briefcase, Bell, Pen } from "lucide-react";
import MobileMenu from "./Navbar/MobileMenu";
import NavLinks from "./Navbar/NavLinks";
import SearchBar from "./Navbar/SearchBar";
import MessageDropdown from "./Navbar/MessageDropdown";
import NotificationDropdown from "./Navbar/NotificationDropdown";
import UserDropdown from "./Navbar/UserDropdown";
import Other from "./Navbar/Other";

const Navbar = () => {
  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "", photo: null });
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const msgRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const fetchUserData = () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser({
          name: userData.name || "",
          photo: userData.photo || null,
          headline: userData.headline || "",
        });
      }
    };

    fetchUserData();

    const handleClickOutside = (event) => {
      if (!msgRef.current?.contains(event.target)) setIsMsgOpen(false);
      if (!bellRef.current?.contains(event.target)) setIsBellOpen(false);
      if (!dropdownRef.current?.contains(event.target))
        setIsDropdownOpen(false);
      if (!mobileMenuRef.current?.contains(event.target))
        setIsMobileMenuOpen(false);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`flex items-center justify-between px-4 sm:px-8 md:px-16 py-[13px] bg-sky-500 text-white shadow-sm font-sans sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <Link to="/" className="hidden md:block">
            <img src={Logo} alt="Logo" className="h-8" />
          </Link>
          <div className="flex">
            <SearchBar />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NavLinks />

          <div className="flex items-center gap-2 sm:gap-6">
            <Link
              to="/messages"
              className="md:hidden flex items-center justify-center"
              style={{ marginRight: 8 }}
            >
              <svg
                width={24}
                height={24}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
              </svg>
            </Link>
            <MessageDropdown />
            <NotificationDropdown />
            <div ref={dropdownRef} className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {user.photo ? (
                  <img
                    src={`${apiUrl}/${user.photo}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold border border-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
              </div>
              {isDropdownOpen && (
                <UserDropdown user={user} handleLogout={handleLogout} />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center py-2 md:hidden">
        <Link
          to="/"
          className={`flex flex-col items-center ${
            location.pathname === "/" ? "text-sky-500" : "text-gray-500"
          } hover:text-sky-700`}
        >
          <Home size={24} />
        </Link>
        <Link
          to="/connections"
          className={`flex flex-col items-center ${
            location.pathname.startsWith("/connections")
              ? "text-sky-500"
              : "text-gray-500"
          } hover:text-sky-700`}
        >
          <Users size={24} />
        </Link>
        <Link
          to="/jobs"
          className={`flex flex-col items-center ${
            location.pathname.startsWith("/jobs")
              ? "text-sky-500"
              : "text-gray-500"
          } hover:text-sky-700`}
        >
          <Briefcase size={24} />
        </Link>
        <Link
          to="/blog"
          className={`flex flex-col items-center ${
            location.pathname.startsWith("/blog")
              ? "text-sky-500"
              : "text-gray-500"
          } hover:text-sky-700`}
        >
          <Pen size={24} />
        </Link>
        <Link
          to="/notification"
          className={`flex flex-col items-center ${
            location.pathname.startsWith("/notification")
              ? "text-sky-500"
              : "text-gray-500"
          } hover:text-sky-700 relative`}
        >
          <Bell size={24} />
        </Link>
      </div>
    </>
  );
};

export default Navbar;
