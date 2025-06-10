import React from 'react';
import { Pencil } from 'lucide-react';

const CompanyPreview = ({ form, logoPreview }) => (
  <div className="w-full">
    <div className="bg-white p-4 rounded-xl shadow border">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          Page preview
          <span className="text-gray-400 cursor-help text-xs">?</span>
        </h3>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="w-full h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo Preview" className="object-contain h-full" />
          ) : form.logo ? (
            <img src={'http://localhost:3000/' + form.logo || '/default-company-logo.png'} alt="Company Logo" className="object-contain h-full" />
          ) : (
            <span className="text-gray-400 text-sm">Logo preview</span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 text-lg">{form.name || "Company name"}</h4>
        <p className="text-gray-500 text-base">{form.tagline || "Tagline"}</p>
        <p className="text-gray-400 text-sm">{form.industry || "Industry"}</p>
        <button
          type="button"
          className="mt-4 bg-blue-600 text-white text-base font-semibold px-4 py-2 rounded hover:bg-blue-700"
        >
          + Follow
        </button>
      </div>
    </div>
  </div>
);

const CompanyEditModal = ({
  isOpen,
  onClose,
  formData,
  logoPreview,
  handleInputChange,
  handleLogoChange,
  handleSubmit,
  isSubmitting,
  submitSuccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Company Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Edit Request Submitted!</h3>
              <p className="text-gray-600">Your changes have been submitted for review.</p>
              <p className="text-gray-500 text-sm mt-2">The page will refresh shortly...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md bg-gray-100 text-gray-500 text-sm">
                          linkedin.com/company/
                        </span>
                        <input
                          type="text"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={isSubmitting}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry*</label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization Size*</label>
                      <select
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Select size</option>
                        <option value="0-1">0-1 employees</option>
                        <option value="2-10">2-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1,000">501-1,000 employees</option>
                        <option value="1,001-5,000">1,001-5,000 employees</option>
                        <option value="5,001-10,000">5,001-10,000 employees</option>
                        <option value="10,000+">10,000+ employees</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type*</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Public company">Public company</option>
                        <option value="Self employed">Self employed</option>
                        <option value="Government employed">Government employed</option>
                        <option value="Nonprofit">Nonprofit</option>
                        <option value="Sole proprietorship">Sole proprietorship</option>
                        <option value="Privately held">Privately held</option>
                        <option value="Partnership">Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={isSubmitting}
                      />
                      {logoPreview && (
                        <p className="text-xs text-gray-500 mt-1">New logo selected</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tagline*</label>
                      <textarea
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={isSubmitting}
                        required
                        placeholder="Brief description of your company"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Submitting...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="w-full md:w-1/2">
                <CompanyPreview form={formData} logoPreview={logoPreview} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyEditModal;