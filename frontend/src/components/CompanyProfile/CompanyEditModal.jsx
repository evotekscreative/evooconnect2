import React, { useState, useEffect } from 'react';
import { Pencil, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

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
            <img src={`${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${form.logo.replace(/^\/+/, "")}`} alt="Company Logo" className="object-contain h-full" />
          ) : (
            <span className="text-gray-400 text-sm">Logo preview</span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 text-lg">{form.name || "Company name"}</h4>
        <p className="text-gray-500 text-base">{form.tagline || "Tagline"}</p>
        <p className="text-gray-400 text-sm">{form.industry || "Industry"}</p>
        <p className="text-gray-400 text-sm mt-1">{form.size || "Company size"}</p>
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
  companyData,
  previousRequest,
  onSubmitEditRequest
}) => {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    industry: '',
    description: '',
    website: '',
    size: '',
    type: '',
    linkedin_url: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  useEffect(() => {
    if (isOpen && companyData) {
      setFormData({
        name: companyData.name || '',
        tagline: companyData.tagline || '',
        industry: companyData.industry || '',
        website: companyData.website || '',
        size: companyData.size || '',
        type: companyData.type || '',
        linkedin_url: companyData.linkedin_url || ''
      });

      setLogoPreview(
        companyData.logo
          ? `${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${companyData.logo.replace(/^\/+/, "")}`
          : null
      );
    }
  }, [isOpen, companyData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Ambil data awal dari companyData
    const initialData = {
      name: companyData.name || '',
      tagline: companyData.tagline || '',
      industry: companyData.industry || '',
      website: companyData.website || '',
      size: companyData.size || '',
      type: companyData.type || '',
      linkedin_url: companyData.linkedin_url || ''
    };

    // Bandingkan dengan formData, hanya kirim field yang berubah
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== initialData[key]) {
        changes[key] = formData[key];
      }
    });

    // Jika ada perubahan logo (file)
    if (logoPreview && logoPreview.startsWith('data:')) {
      changes.logo = logoPreview;
    }

    if (Object.keys(changes).length === 0) {
      toast.warning("Tidak ada perubahan yang dideteksi.");
      setIsSubmitting(false);
      return;
    }

    // Kirim hanya field yang berubah ke parent handler
    await onSubmitEditRequest(changes);

    setSubmitSuccess(true);
    toast.success("Permintaan edit berhasil dikirim!");
  } catch (error) {
    toast.error("Gagal mengirim permintaan edit: " + error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleResubmit = () => {
    setSubmitSuccess(false);
    setShowResubmitForm(true);
  };

  const handleClose = () => {
    onClose();
    setSubmitSuccess(false);
    setShowResubmitForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Company Profile</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          {previousRequest && !showResubmitForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 p-2 rounded-full ${previousRequest.status === 'approved'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'}`}>
                  {previousRequest.status === 'approved' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">
                    Your previous edit request was {previousRequest.status}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {previousRequest.status === 'approved'
                      ? 'Your changes have been applied to your company profile.'
                      : 'Your changes were not applied.'}
                  </p>
                  {previousRequest.status === 'rejected' && previousRequest.rejection_reason && (
                    <div className="mt-2 p-3 bg-red-50 rounded-md">
                      <p className="text-sm font-medium text-red-700">
                        <span className="font-semibold">Reason:</span> {previousRequest.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowResubmitForm(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Submit New Edit Request
              </button>
            </div>
          )}

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Edit Request Submitted!</h3>
              <p className="text-gray-600">Your changes have been submitted for admin review.</p>
              <p className="text-gray-500 text-sm mt-2">You'll be notified once approved.</p>
              <button
                onClick={handleClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            (showResubmitForm || !previousRequest) && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h3 className="text-blue-800 font-medium mb-2">Note:</h3>
                      <p className="text-blue-700 text-sm">
                        All changes require admin approval before they go live.
                        Your current profile will remain visible until changes are approved.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                        <input
                          type="text"
                          name="tagline"
                          value={formData.tagline}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry*</label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <select
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select size</option>
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-200 employees">51-200 employees</option>
                          <option value="201-500 employees">201-500 employees</option>
                          <option value="501-1000 employees">501-1000 employees</option>
                          <option value="1001-5000 employees">1001-5000 employees</option>
                          <option value="5001+ employees">5001+ employees</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="Public Company">Public Company</option>
                          <option value="Privately Held">Privately Held</option>
                          <option value="Nonprofit">Nonprofit</option>
                          <option value="Government Agency">Government Agency</option>
                          <option value="Educational Institution">Educational Institution</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website*</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                        <input
                          type="text"
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">Recommended size: 400x400px, JPG/PNG format</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
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
                          'Submit for Approval'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="w-full md:w-1/2">
                  <CompanyPreview form={formData} logoPreview={logoPreview} />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyEditModal;  