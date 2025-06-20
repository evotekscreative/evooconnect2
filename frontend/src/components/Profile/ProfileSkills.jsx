import { Link } from "react-router-dom";
import { ThumbsUp, MessageCircle, Share2, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProfilePosts({ userPosts, user, profileImage }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-[#00AEEF]" />
          <h3 className="font-semibold text-lg">POST</h3>
        </div>
        {/* ...scroll buttons... */}
      </div>
      {/* ...post list... */}
    </div>
  );
}

export function ProfileSkills({ skills }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-lg">Skills</h3>
      {skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-base text-gray-500 mt-1">No skills added yet</p>
      )}
    </div>
  );
}