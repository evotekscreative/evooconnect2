import { Input } from "../../components/Input.jsx";
import { Button } from "../../components/Button.jsx";
import Case from "../Case.jsx";

export default function CreateCompanyModal({ 
    showModal, 
    setShowModal, 
    companyForm, 
    handleCompanyInputChange, 
    handleLogoUpload, 
    handleCompanySubmit 
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

                <h2 className="text-xl font-semibold mb-4">Create Company</h2>

                <form onSubmit={handleCompanySubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <Input
                            type="text"
                            placeholder="Enter Company Name"
                            name="name"
                            value={companyForm.name}
                            onChange={handleCompanyInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        {companyForm.logoPreview && (
                            <div className="mb-2">
                                <img
                                    src={companyForm.logoPreview}
                                    alt="Company logo preview"
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            id="logo"
                            name="logo"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#0A66C2] file:text-white hover:file:bg-blue-700"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            rows={4}
                            placeholder="Enter Company Description"
                            name="description"
                            value={companyForm.description}
                            onChange={handleCompanyInputChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <Input
                            type="text"
                            placeholder="Enter Industry"
                            name="industry"
                            value={companyForm.industry}
                            onChange={handleCompanyInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            rows={2}
                            placeholder="Enter Location"
                            name="location"
                            value={companyForm.location}
                            onChange={handleCompanyInputChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter Website"
                            name="website"
                            value={companyForm.website}
                            onChange={handleCompanyInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter Company Size"
                            name="employees"
                            value={companyForm.employees}
                            onChange={handleCompanyInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter Company Type"
                            name="companyType"
                            value={companyForm.companyType}
                            onChange={handleCompanyInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                        <Input
                            type="date"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            name="foundedYear"
                            value={companyForm.foundedYear}
                            onChange={handleCompanyInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            rows={4}
                            placeholder="Enter Company Specialties"
                            name="specialties"
                            value={companyForm.specialties}
                            onChange={handleCompanyInputChange}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                        <Input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            placeholder="Enter Rating"
                            className="w-full"
                            name="rating"
                            value={companyForm.rating}
                            onChange={handleCompanyInputChange}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            Create Company
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}