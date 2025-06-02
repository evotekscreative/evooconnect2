import { Briefcase, X } from "lucide-react";
import axios from "axios";

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
  if (!show) return null;

  const handleDeleteExperience = async () => {
    if (!editingExperience?.id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this experience? This action cannot be undone."
      )
    ) {
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
        onClose();
      } catch (error) {
        console.error("Failed to delete experience:", error);
        showAlert("error", "Failed to delete experience. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleExperienceSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" />
            {editingExperience ? "Edit Experience" : "Add Experience"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
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
                  {["Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                    (month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="start_year"
                  value={experienceForm.start_year}
                  onChange={handleExperienceChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {["Year", ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)].map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
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
                  {["Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                    (month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="end_year"
                  value={experienceForm.end_year}
                  onChange={handleExperienceChange}
                  className="w-full p-2 border rounded"
                >
                  {["Year", ...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)].map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
          <textarea
            name="caption"
            value={experienceForm.caption}
            onChange={handleExperienceChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block mb-1 text-sm font-medium">Company Logo</label>
            <input
              type="file"
              className="w-full border px-3 py-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              onChange={handleExperienceFileChange}
            />
            {/* Preview Image */}
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
        <div className="flex justify-between gap-2 mt-4">
          {editingExperience && (
            <button
              type="button"
              onClick={handleDeleteExperience}
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
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}