import { Link } from "react-router-dom";
import { Briefcase, Users, Pen, MessageSquare, Bell } from "lucide-react";

const MobileMenu = ({ setIsMobileMenuOpen }) => {
  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-sky-600 shadow-lg z-50">
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
            to="/notification"
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
  );
};

export default MobileMenu;