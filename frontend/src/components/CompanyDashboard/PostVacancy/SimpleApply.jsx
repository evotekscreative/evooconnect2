import React, { useState } from "react";
import { ExternalLink, X } from "lucide-react";

const formatCurrency = (value, currency) => {
  if (value === '' || isNaN(value)) return '';
  
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9]/g, '')) : value;
  
  // Special handling for IDR (Indonesian Rupiah)
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(numericValue);
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue).replace(/[^\d,.]/g, '');
};

const SimpleApply = ({ showModal, setShowModal, onSubmit }) => {
  const [applyMethod, setApplyMethod] = useState("simple"); // 'simple' or 'external'
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    minSalary: "",
    maxSalary: "",
    currency: "USD",
    skills: "",
    benefits: "",
    workType: "",
    applicationDeadline: "",
    externalLink: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalaryChange = (e, fieldName) => {
    // Remove non-numeric characters and parse the raw value
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [fieldName]: rawValue === '' ? '' : Number(rawValue)
    }));
  };

  const handleSalaryBlur = (fieldName) => {
    // Format the value when leaving the field
    if (formData[fieldName] !== '') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: Number(formData[fieldName])
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      applyMethod
    };
    onSubmit(submissionData);
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Post New Job</h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Application Method Toggle */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`mr-3 font-medium ${applyMethod === 'simple' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Simple Apply
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyMethod === 'external'}
                    onChange={() => setApplyMethod(applyMethod === 'simple' ? 'external' : 'simple')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className={`ml-3 font-medium ${applyMethod === 'external' ? 'text-blue-600' : 'text-gray-500'}`}>
                  External Link
                </span>
              </div>
            </div>

            {applyMethod === 'external' && (
              <div className="mt-4">
                <label className="text-gray-700 text-sm font-bold mb-2 flex items-center">
                  <ExternalLink className="mr-2" size={16} />
                  Application URL
                </label>
                <input
                  type="url"
                  name="externalLink"
                  value={formData.externalLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/apply"
                  required={applyMethod === 'external'}
                />
                <p className="text-xs text-gray-500 mt-1">Candidates will be directed to this URL to apply</p>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Location*
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Job Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Requirements*
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Job Type*
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select job type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Experience Level*
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="director">Director</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Min Salary
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 rounded-l-lg bg-gray-50 text-gray-500">
                    {formData.currency}
                  </span>
                  <input
                    type="text"
                    name="minSalary"
                    value={formatCurrency(formData.minSalary, formData.currency)}
                    onChange={(e) => handleSalaryChange(e, 'minSalary')}
                    onBlur={() => handleSalaryBlur('minSalary')}
                    className="w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Max Salary
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 rounded-l-lg bg-gray-50 text-gray-500">
                    {formData.currency}
                  </span>
                  <input
                    type="text"
                    name="maxSalary"
                    value={formatCurrency(formData.maxSalary, formData.currency)}
                    onChange={(e) => handleSalaryChange(e, 'maxSalary')}
                    onBlur={() => handleSalaryBlur('maxSalary')}
                    className="w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="IDR">IDR (Rp)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JavaScript, React, Node.js"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Benefits
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Health insurance, Remote work, Stock options"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Work Type
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select work type</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleApply;