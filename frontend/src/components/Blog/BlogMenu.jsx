import React, { useState } from "react";
import { MoreVertical, Pencil, Trash2, Flag } from "lucide-react";

const BlogMenu = ({ onEdit, onDelete, onReport }) => {
    const [showMenu, setShowMenu] = useState(false);
  
    return (
      <div
        className="relative z-50"
        onClick={() => setShowMenu(!showMenu)}
      >
        <button className="text-gray-600 hover:text-black">
          <MoreVertical className="w-5 h-5" />
        </button>
  
        <div
          className={`absolute right-0 mt-2 bg-white border rounded shadow-lg w-40 transform transition-all duration-200 ${
            showMenu
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 invisible"
          }`}
        >
          <button
            onClick={onEdit}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-500"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={onReport}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
          >
            <Flag className="w-4 h-4" /> Report
          </button>
        </div>
      </div>
    );
  };

export default BlogMenu;