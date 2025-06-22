import { ArrowLeft } from "lucide-react";

export default function GroupsHeader({ navigate, setShowModal }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold">Groups</h2>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-4 py-2 rounded"
      >
        Create Group
      </button>
    </div>
  );
}