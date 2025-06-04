import { Link } from "react-router-dom";

export default function CompanyForm({ form, logoPreview, handleChange, isSubmitting }) {
    return (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md border border-gray-900">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* LinkedIn URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL *</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-900 bg-gray-50 text-gray-500 text-sm">
                            linkedin.com/company/
                        </span>
                        <input
                            type="text"
                            name="url"
                            value={form.url}
                            onChange={handleChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website *</label>
                    <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Industry */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                    <input
                        type="text"
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size *</label>
                    <select
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select company size</option>
                        <option value="1-10 employees">1-10 employees</option>
                        <option value="11-50 employees">11-50 employees</option>
                        <option value="51-200 employees">51-200 employees</option>
                        <option value="201-500 employees">201-500 employees</option>
                        <option value="501-1000 employees">501-1000 employees</option>
                        <option value="1001-5000 employees">1001-5000 employees</option>
                        <option value="5001+ employees">5001+ employees</option>
                    </select>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Type *</label>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select company type</option>
                        <option value="Public Company">Public Company</option>
                        <option value="Private Company">Private Company</option>
                        <option value="Government Agency">Government Agency</option>
                        <option value="Nonprofit">Nonprofit</option>
                        <option value="Educational Institution">Educational Institution</option>
                    </select>
                </div>

                {/* Tagline */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <textarea
                        name="tagline"
                        value={form.tagline}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Logo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                    <input
                        type="file"
                        name="logo"
                        onChange={handleChange}
                        accept="image/*"
                        className="w-full px-4 py-2 border border-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {logoPreview && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">Logo Preview:</p>
                            <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain border border-gray-300" />
                        </div>
                    )}
                </div>

                {/* Verification */}
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="verified"
                            name="verified"
                            type="checkbox"
                            checked={form.verified}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-900 rounded"
                            required
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="verified" className="font-medium text-gray-700">
                            I verify that I'm authorized to submit this company information *
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Company'}
                    </button>
                </div>
            </div>
        </div>
    );
}