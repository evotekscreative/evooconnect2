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
} from 'lucide-react';

const Navbar = () => {
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const msgRef = useRef(null);         
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!msgRef.current?.contains(event.target)) setIsMsgOpen(false);
      if (!bellRef.current?.contains(event.target)) setIsBellOpen(false);
      if (!dropdownRef.current?.contains(event.target)) setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="flex items-center justify-between px-16 py-[13px] bg-sky-500 text-white shadow-sm relative font-sans">
      {/* Kiri: Logo + Search */}
      <div className="flex items-center gap-3">
        <Link to="/">
        <img src={Logo} alt="Logo" className="h-8" />
        </Link>
        
        <div className="flex items-center bg-white rounded-full px-3 py-2 w-50 ml-4">
          <input
            type="text"
            placeholder="Search people, jobs & more"
            className="hidden md:block flex-grow bg-transparent text-black focus:outline-none px-2 text-sm"
          />
          <Search className="text-black w-4 h-4" />
        </div>
      </div>

      {/* Kanan: Menu, Icon, Avatar */}
      <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-6">
          {/* Message */}
          <div ref={msgRef} className="relative">
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

          {/* Bell */}
          <div ref={bellRef} className="relative">
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
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/edit-profile">Edit Profile</Link>
                  </li>
                  <li onClick={() => handleLogout()} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
