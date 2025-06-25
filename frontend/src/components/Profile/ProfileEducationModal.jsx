import { GraduationCap, X } from "lucide-react";
import axios from "axios";

export default function ProfileEducationModal({
  show,
  onClose,
  educationForm,
  setEducationForm,
  handleEducationSubmit,
  handleEducationChange,
  handleEducationFileChange,
  editingEducation,
  apiUrl,
  setEducation,
  showAlert,
}) {
  if (!show) return null;

  const handleDeleteEducation = async () => {
    if (!editingEducation?.id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this education? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${apiUrl}/api/education/${editingEducation.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEducation((prev) =>
          prev.filter((edu) => edu.id !== editingEducation.id)
        );
        showAlert("success", "Education deleted successfully!");
        onClose();
      } catch (error) {
        console.error("Failed to delete education:", error);
        showAlert("error", "Failed to delete education. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-0">
      <form
        onSubmit={handleEducationSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600" />
            {editingEducation ? "Edit Education" : "Add Education"}
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
            name="major"
            value={educationForm.major}
            onChange={handleEducationChange}
            placeholder="Degree"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="institute_name"
            value={educationForm.institute_name}
            onChange={handleEducationChange}
            placeholder="School Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            value={educationForm.location}
            onChange={handleEducationChange}
            placeholder="Location (City, Country)"
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <div className="flex gap-2">
                <select
                  name="start_month"
                  value={educationForm.start_month}
                  onChange={handleEducationChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Month" disabled>Month</option>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                    (month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="start_year"
                  value={educationForm.start_year}
                  onChange={handleEducationChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Year" disabled>Month</option>
                  {[...Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)].map(
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
              <label className="block text-sm font-medium mb-1">End Date <span className="text-gray-300 text-xs">(Optional)</span></label>
              <div className="flex gap-2">
                <select
                  name="end_month"
                  value={educationForm.end_month}
                  onChange={handleEducationChange}
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
                  value={educationForm.end_year}
                  onChange={handleEducationChange}
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
            value={educationForm.caption}
            onChange={handleEducationChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block mb-1 text-sm font-medium">School Logo</label>
            <input
              type="file"
              className="w-full border px-3 py-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              onChange={handleEducationFileChange}
            />
            {/* Preview Image */}
            {educationForm.schoolLogo && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Logo Preview:</p>
                <img
                  src={
                    educationForm.schoolLogo instanceof File
                      ? URL.createObjectURL(educationForm.schoolLogo)
                      : `${apiUrl}/${educationForm.schoolLogo}`
                  }
                  alt="School Logo Preview"
                  className="object-contain w-20 h-20 mt-1 border rounded-md"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between gap-2 mt-4">
          {editingEducation && (
            <button
              type="button"
              onClick={handleDeleteEducation}
              className="px-3 py-3 text-xs sm:px-4 sm:py-3 sm:text-base bg-red-500 text-white font-bold rounded hover:bg-red-600"
            >
              Delete Education
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold sm:px-4 sm:py-2 sm:text-base bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-base rounded ${educationForm.caption.length > 1000
                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              disabled={educationForm.caption.length > 1000}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}