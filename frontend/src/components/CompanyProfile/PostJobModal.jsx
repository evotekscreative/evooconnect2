import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function PostJobModal({ 
    showModal, 
    setShowModal, 
    jobForm, 
    handleInputChange, 
    handlePhotoUpload, 
    handleJobSubmit 
}) {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${showModal ? 'block' : 'hidden'} bg-black bg-opacity-40`}>
            <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ×
                </button>

                <h2 className="text-xl font-semibold mb-4">Post a Job</h2>

                <form onSubmit={handleJobSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="job-photo" className="block text-sm font-medium text-gray-700 mb-1">Job Photo</label>
                        {jobForm.photoPreview && (
                            <div className="mb-2">
                                <img
                                    src={jobForm.photoPreview}
                                    alt="Job photo preview"
                                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            id="job-photo"
                            name="photo"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#0A66C2] file:text-white hover:file:bg-blue-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <Input
                            className="w-full"
                            placeholder="Enter Job Title"
                            name="jobTitle"
                            value={jobForm.jobTitle}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <Input
                            className="w-full"
                            placeholder="Enter Position"
                            name="position"
                            value={jobForm.position}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <Input
                            className="w-full"
                            placeholder="Enter Location"
                            name="location"
                            value={jobForm.location}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                        <Input
                            className="w-full"
                            placeholder="Enter Salary"
                            name="salary"
                            value={jobForm.salary}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            rows={4}
                            placeholder="Enter Job Description"
                            name="description"
                            value={jobForm.description}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating 1-5</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            placeholder="Your Rating"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            name="rating"
                            value={jobForm.rating}
                            onChange={handleInputChange}
                        />
                    </div>

                    <hr className="my-4 border-gray-200" />
                    <h3 className="text-base font-semibold">Job Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                            <select
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                name="seniorityLevel"
                                value={jobForm.seniorityLevel}
                                onChange={handleInputChange}
                            >
                                <option value="">Choose Seniority Level</option>
                                <option value="mid-senior-level">Mid-Senior Level</option>
                                <option value="entry-level">Entry Level</option>
                                <option value="director">Director</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                            <select
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                name="industry"
                                value={jobForm.industry}
                                onChange={handleInputChange}
                            >
                                <option value="">Choose Industry</option>
                                <option value="internet-information">Internet Information Technology & Services</option>
                                <option value="finance">Finance</option>
                                <option value="healthcare">Healthcare</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                            <select
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                name="employmentType"
                                value={jobForm.employmentType}
                                onChange={handleInputChange}
                            >
                                <option value="">Choose Employment Type</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Functions</label>
                            <select
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                name="jobFunction"
                                value={jobForm.jobFunction}
                                onChange={handleInputChange}
                            >
                                <option value="">Choose Job Functions</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Design">Design</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                            type="text"
                            placeholder="Enter Company"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            name="company"
                            value={jobForm.company}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded text-sm"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            className="bg-[#0A66C2] text-white hover:bg-blue-700"
                        >
                            Post Job
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}