import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/img/logo1.png';
import {
  Users,
  Briefcase,
  Pen,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const msgRef = useRef(null);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!msgRef.current?.contains(event.target)) setIsMsgOpen(false);
      if (!bellRef.current?.contains(event.target)) setIsBellOpen(false);
      if (!dropdownRef.current?.contains(event.target)) setIsDropdownOpen(false);
      if (!mobileMenuRef.current?.contains(event.target)) setIsMobileMenuOpen(false);
    };

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className={`flex items-center justify-between px-4 sm:px-8 md:px-16 py-[13px] bg-sky-500 text-white shadow-sm relative font-sans sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Left: Logo + Hamburger Menu (mobile) */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        <Link to="/">
          <img src={Logo} alt="Logo" className="h-8" />
        </Link>
        
        {/* Search - Different styles for mobile vs desktop */}
        <div className="hidden sm:flex items-center bg-white rounded-full px-3 py-2 ml-4 w-[180px] md:w-[220px] lg:w-[280px]">
          <input
            type="text"
            placeholder="Search people, jobs & more"
            className="flex-grow bg-transparent text-black focus:outline-none px-2 text-sm w-full"
          />
          <Search className="text-black w-4 h-4" />
        </div>
      </div>

      {/* Mobile Search - More elongated */}
      <div className="sm:hidden flex items-center bg-white rounded-md px-3 py-2 mx-2 flex-1 max-w-[180px]">
        <input
          type="text"
          placeholder="Search..."
          className="flex-grow bg-transparent text-black focus:outline-none text-sm w-full"
        />
        <Search className="text-black w-4 h-4 ml-1" />
      </div>

      {/* Right: Menu, Icons, Avatar */}
      <div className="flex items-center gap-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-white font-thin text-sm items-center">
          <Link to="/jobs" className="flex items-center gap-1 hover:text-gray-200">
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
          </Link>
          <Link to="/connections" className="flex items-center gap-1 hover:text-gray-200">
            <Users className="w-4 h-4" />
            <span>Connection</span>
          </Link>
          <Link to="/blog" className="flex items-center gap-1 hover:text-gray-200">
            <Pen className="w-4 h-4" />
            <span>Blog</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Message - Hidden on mobile */}
          <div ref={msgRef} className="relative hidden sm:block">
            <div onClick={() => setIsMsgOpen(!isMsgOpen)} className="cursor-pointer relative">
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
                8
              </span>
            </div>
            {isMsgOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4 border-b font-bold text-black">Messages</div>
                <ul className="max-h-64 overflow-y-auto text-black">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Pesan 1</li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Pesan 2</li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Pesan 3</li>
                </ul>
              </div>
            )}
          </div>

          {/* Bell - Hidden on mobile */}
          <div ref={bellRef} className="relative hidden sm:block">
            <div onClick={() => setIsBellOpen(!isBellOpen)} className="cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2 bg-cyan-400 text-white text-xs rounded-full px-1 h-3 flex items-center justify-center">
                6
              </span>
            </div>
            {isBellOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
                <div className="bg-black p-4 border-b font-bold text-white">Alert Center</div>
                <ul className="max-h-64 overflow-y-auto text-black">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/notification">Notifikasi</Link>
                  </li>
                </ul>      
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-7 h-7 bg-white text-black rounded-full flex items-center justify-center font-semibold border border-white cursor-pointer">
              <img src="#" alt="" />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold">Nama User</p>
                    <span className="text-green-500 text-sm">● Online</span>
                  </div>
                </div>
                <ul className="flex flex-col divide-y">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2">
                    My Account
                    </Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/edit-profile" className="flex items-center gap-2">Edit Profile</Link>
                  </li>
                  <li onClick={() => handleLogout()} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden absolute top-full left-0 w-full bg-sky-600 shadow-lg z-50"
        >
          <div className="flex flex-col p-4">
            <Link 
              to="/jobs" 
              className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </Link>
            <Link 
              to="/connections" 
              className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="w-4 h-4" />
              <span>Connection</span>
            </Link>
            <Link 
              to="/blog" 
              className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Pen className="w-4 h-4" />
              <span>Blog</span>
            </Link>
            
            {/* Mobile version of messages and notifications */}
            <div className="border-t border-sky-400 mt-2 pt-2">
              <Link 
                to="/messages" 
                className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  8
                </span>
              </Link>
              <Link 
                to="/notifications" 
                className="flex items-center gap-3 py-3 px-4 hover:bg-sky-700 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                <span className="ml-auto bg-cyan-400 text-white text-xs rounded-full px-2 py-0.5">
                  6
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;