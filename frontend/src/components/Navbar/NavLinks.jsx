import { Link } from "react-router-dom";
import { Briefcase, Users, Pen } from "lucide-react";

const NavLinks = () => {
  return (
    <div className="hidden md:flex gap-6 text-white font-thin text-sm items-center">
      <Link to="/jobs" className="flex items-center gap-1 hover:text-gray-200">
        <Briefcase className="w-4 h-4" />
        <span>Jobs</span>
      </Link>
      <Link
        to="/connections"
        className="flex items-center gap-1 hover:text-gray-200"
      >
        <Users className="w-4 h-4" />
        <span>Connection</span>
      </Link>
      <Link to="/blog" className="flex items-center gap-1 hover:text-gray-200">
        <Pen className="w-4 h-4" />
        <span>Blog</span>
      </Link>
    </div>
  );
};

export default NavLinks;