const CompanyPreview = ({ form, logoPreview }) => (
  <div className="w-full">
    <div className="p-4 bg-white border shadow rounded-xl">
      <div className="mb-4">
        <h3 className="flex items-center gap-1 text-sm font-semibold text-gray-700">
          Page preview
          <span className="text-xs text-gray-400 cursor-help">?</span>
        </h3>
      </div>
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center w-full h-40 mb-4 bg-gray-200 rounded">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="object-contain h-full"
            />
          ) : form.logo ? (
            <img
              src={`${
                import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"
              }/${form.logo.replace(/^\/+/, "")}`}
              alt="Company Logo"
              className="object-contain h-full"
            />
          ) : (
            <span className="text-sm text-gray-400">Logo preview</span>
          )}
        </div>
        <h4 className="text-lg font-bold text-gray-900">
          {form.name || "Company name"}
        </h4>
        <p className="text-base text-gray-500">{form.tagline || "Tagline"}</p>
        <p className="text-sm text-gray-400">{form.industry || "Industry"}</p>
        <p className="mt-1 text-sm text-gray-400">
          {form.size || "Company size"}
        </p>
        <button
          type="button"
          className="px-4 py-2 mt-4 text-base font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          + Follow
        </button>
      </div>
    </div>
  </div>
);

export default CompanyPreview;
