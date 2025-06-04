import { Briefcase, X } from "lucide-react";
import axios from "axios";
import React, { useState } from "react";

export default function ProfileExperienceModal({
  show,
  onClose,
  experienceForm,
  setExperienceForm,
  handleExperienceSubmit,
  handleExperienceChange,
  handleExperienceFileChange,
  editingExperience,
  apiUrl,
  setExperiences,
  showAlert,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!show) return null;

  const handleDeleteExperience = async () => {
    if (!editingExperience?.id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/experience/${editingExperience.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExperiences((prev) =>
        prev.filter((exp) => exp.id !== editingExperience.id)
      );
      showAlert("success", "Experience deleted successfully!");
      setShowDeleteModal(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete experience:", error);
      showAlert("error", "Failed to delete experience. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Delete Experience</h2>
              <p>Are you sure you want to delete this experience?</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDeleteExperience}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg w-full max-w-lg">
        <form onSubmit={handleExperienceSubmit}>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-2 max-w-[90%] flex-wrap break-words">
              <Briefcase size={20} className="text-blue-600 shrink-0 mt-1" />
              <div className="font-bold text-xl leading-tight">
                {editingExperience ? "Edit Experience" : "Add Experience"}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <input
              type="text"
              name="job_title"
              value={experienceForm.job_title}
              onChange={handleExperienceChange}
              placeholder="Job Title *"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="company_name"
              value={experienceForm.company_name}
              onChange={handleExperienceChange}
              placeholder="Company Name *"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="location"
              value={experienceForm.location}
              onChange={handleExperienceChange}
              placeholder="Location (City, Country)"
              className="w-full p-2 border rounded"
            />

            {/* Dates */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <div className="flex gap-2">
                  <select
                    name="start_month"
                    value={experienceForm.start_month}
                    onChange={handleExperienceChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[
                      "Month", "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ].map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    name="start_year"
                    value={experienceForm.start_year}
                    onChange={handleExperienceChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {["Year", ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <div className="flex gap-2">
                  <select
                    name="end_month"
                    value={experienceForm.end_month}
                    onChange={handleExperienceChange}
                    className="w-full p-2 border rounded"
                  >
                    {[
                      "Month", "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ].map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    name="end_year"
                    value={experienceForm.end_year}
                    onChange={handleExperienceChange}
                    className="w-full p-2 border rounded"
                  >
                    {["Year", ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className={`w-full border rounded-lg p-2 text-sm ${experienceForm.caption.length > 1000
                    ? "border-red-400 text-red-500"
                    : "border-gray-200 text-black"
                  }`}
                rows={5}
                name="caption"
                value={experienceForm.caption}
                onChange={handleExperienceChange}
                placeholder="Describe your experience (max 1000 characters)"
              />
              <div className="text-xs text-right mt-1">
                <span className={experienceForm.caption.length > 1000 ? "text-red-500" : "text-gray-400"}>
                  {experienceForm.caption.length}/1000 characters
                </span>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block mb-1 text-sm font-medium">Company Logo</label>
              <input
                type="file"
                className="w-full border px-3 py-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                onChange={handleExperienceFileChange}
              />
              {experienceForm.photo && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Logo Preview:</p>
                  <img
                    src={
                      experienceForm.photo instanceof File
                        ? URL.createObjectURL(experienceForm.photo)
                        : `${apiUrl}/${experienceForm.photo}`
                    }
                    alt="Company Logo Preview"
                    className="object-contain w-20 h-20 mt-1 border rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between gap-2 mt-4">
            {editingExperience && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Experience
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded ${experienceForm.caption.length > 1000
                    ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                disabled={experienceForm.caption.length > 1000}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
