import { Link } from "react-router-dom";

export default function CompanyForm({ form, logoPreview, handleChange }) {
    return (
        <div className="w-2/3">
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name*</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Add your organization’s name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">linkedin.com/company/*</label>
                    <input
                        type="text"
                        name="url"
                        value={form.url}
                        onChange={handleChange}
                        placeholder="Add your unique LinkedIn address"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <a href="#" className="text-sm text-purple-600 font-semibold hover:underline">
                        Learn more about the Page Public URL
                    </a>
                </div>

                <div>
                    <label className="block text-sm font-medium">Website</label>
                    <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="Begin with http://, https:// or www."
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Industry*</label>
                    <input
                        type="text"
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        placeholder="ex: Information Services"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Organization size*</label>
                    <select
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    <label className="block text-sm font-medium">Organization type*</label>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    <label className="block text-sm font-medium">Logo</label>
                    <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Preview" className="w-32 h-32 object-contain" />
                        ) : (
                            <>
                                <span className="text-gray-500">Choose file</span>
                                <span className="text-xs text-gray-400 mt-1">Upload to see preview</span>
                            </>
                        )}
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={handleChange}
                            className="mt-2 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-center">
                            300 x 300px recommended. JPGs, JPEGs, and PNGs supported.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Tagline</label>
                    <textarea
                        name="tagline"
                        maxLength="120"
                        placeholder="ex: An information services firm helping small businesses succeed."
                        value={form.tagline}
                        onChange={handleChange}
                        className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Use your tagline to briefly describe what your organization does.
                    </p>
                </div>

                <div className="flex items-start">
                    <input
                        type="checkbox"
                        name="verified"
                        checked={form.verified}
                        onChange={handleChange}
                        className="mt-1 mr-2"
                    />
                    <label className="text-sm text-gray-700">
                        I verify that I am an authorized representative of this organization and have the right to
                        act on its behalf in the creation and management of this page.
                    </label>
                </div>

                <Link to="/terms" className="text-sm text-blue-600 hover:underline">
                    Read the EVOConnect Pages Terms
                </Link>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                    Create Page
                </button>
            </div>
        </div>
    );
}
