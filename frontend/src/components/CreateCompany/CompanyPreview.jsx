export default function CompanyPreview({ form, logoPreview }) {
    return (
        <div className="w-1/3">
            <div className="sticky top-8 bg-white p-4 rounded-xl shadow border">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Page preview
                        <span className="text-gray-400 cursor-help text-xs">?</span>
                    </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="w-full h-28 bg-gray-200 rounded mb-4 flex items-center justify-center">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="object-contain h-full" />
                        ) : (
                            <span className="text-gray-400 text-sm">Logo preview</span>
                        )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{form.name || "Company name"}</h4>
                    <p className="text-gray-500 text-sm">{form.tagline || "Tagline"}</p>
                    <p className="text-gray-400 text-xs">{form.industry || "Industry"}</p>
                    <button
                        type="button"
                        className="mt-4 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-blue-700"
                    >
                        + Follow
                    </button>
                </div>
            </div>
        </div>
    );
}
