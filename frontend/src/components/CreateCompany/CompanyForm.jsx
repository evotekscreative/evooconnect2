import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function CompanyForm({ form, logoPreview, handleChange, isSubmitting, pendingAlert }) {
    const isDisabled = !!pendingAlert;
    const notifRef = useRef(null);

    useEffect(() => {
        if (pendingAlert && notifRef.current) {
            notifRef.current.classList.remove("opacity-0");
            notifRef.current.classList.add("opacity-100");
        }
    }, [pendingAlert]);

    return (
        <>
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 relative">
                {/* Floating Notification */}
                {pendingAlert && (
                    <div
                        ref={notifRef}
                        className="fixed z-50 top-8 right-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-6 py-4 rounded shadow-lg flex items-center gap-2 transition-opacity duration-300 opacity-100 animate-slide-in"
                        style={{ minWidth: "260px", maxWidth: "350px" }}
                    >
                        <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.816 1.995-1.85l.007-.15V6c0-1.054-.816-1.918-1.85-1.995L19 4H5c-1.054 0-1.918.816-1.995 1.85L3 6v12c0 1.054.816 1.918 1.85 1.995L5 20z" />
                        </svg>
                        <span className="flex-1">{pendingAlert}</span>
                    </div>
                )}
                <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">Company Information</h2>

                <div className="grid grid-cols-1 gap-7">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            required
                            disabled={isDisabled}
                        />
                    </div>

                    {/* LinkedIn URL */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL *</label>
                        <div className="mt-1 flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                linkedin.com/company/
                            </span>
                            <input
                                type="text"
                                name="linkedin_url"
                                value={form.linkedin_url}
                                onChange={handleChange}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-400"
                                required
                                disabled={isDisabled}
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Website *</label>
                        <input
                            type="url"
                            name="website"
                            value={form.website}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            required
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Industry *</label>
                        <input
                            type="text"
                            name="industry"
                            value={form.industry}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            required
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Size */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size *</label>
                        <select
                            name="size"
                            value={form.size}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            required
                            disabled={isDisabled}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Type *</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            required
                            disabled={isDisabled}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                        <textarea
                            name="tagline"
                            value={form.tagline}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Logo</label>
                        <input
                            type="file"
                            name="logo"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-400"
                            disabled={isDisabled}
                        />
                        {logoPreview && (
                            <div className="mt-3 flex flex-col items-start">
                                <p className="text-xs text-gray-500 mb-1">Logo Preview:</p>
                                <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-contain border border-gray-300 rounded-lg shadow" />
                            </div>
                        )}
                    </div>

                    {/* Verification */}
                    <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center h-5">
                            <input
                                id="verified"
                                name="verified"
                                type="checkbox"
                                checked={form.verified}
                                onChange={handleChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                required
                                disabled={isDisabled}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="verified" className="font-medium text-gray-700">
                                I declare that I am an authorized representative of this organization and have the right to act on behalf of the company in managing and creating this page. The organization and I agree to additional terms for the Page.
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || isDisabled}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition-all duration-200 ${
                                isSubmitting || isDisabled
                                    ? 'bg-blue-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Company'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}