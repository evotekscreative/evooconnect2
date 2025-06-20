import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from "react-router-dom";

// Dropdown menerima selectedCompany, onCompanyChange, dan companyId dari Sidebar
const Dropdown = ({ selectedCompany, setSelectedCompany, onCompanyChange, companyId }) => {
    const [companies, setCompanies] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Ambil token dari localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000'}/api/my-companies`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (response.ok) {
                    const data = await response.json();
                    const companyList = Array.isArray(data.data) ? data.data : [];
                    setCompanies(companyList);

                    // Set selected company hanya jika id cocok, jika tidak ada id ambil pertama
                    let selected = null;
                    if (companyId) {
                        selected = companyList.find(c => c.id.toString() === companyId.toString());
                    }
                    if (!companyId || !selected) {
                        selected = companyList[0];
                    }
                    if (selected) {
                        setSelectedCompany(selected);
                        if (onCompanyChange) onCompanyChange(selected);
                    }
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };
        fetchCompanies();
        // eslint-disable-next-line
    }, [companyId, token]);

    const handleSelectCompany = (company) => {
        setSelectedCompany(company);
        setIsOpen(false);
        if (onCompanyChange) onCompanyChange(company);

        // Ganti companyId di path sekarang dengan id baru, support path baru
        const currentPath = location.pathname;
        // regex: cari angka/uuid setelah /company-dashboard atau /company-dashboard/manage-member
        const newPath = currentPath.replace(
            /(\/company-dashboard(?:\/manage-member)?\/)[^/]+/,
            `$1${company.id}`
        );
        navigate(newPath);
    };

    if (!selectedCompany) return <div>Loading...</div>;

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
            >
                <span className="truncate">{selectedCompany.name}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>

            {isOpen && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <div className="py-1 max-h-60 overflow-auto">
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => handleSelectCompany(company)}
                                className={`block w-full px-4 py-2 text-sm text-left ${company.id === selectedCompany.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                {company.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Sidebar() {
    const [collapseShow, setCollapseShow] = React.useState("hidden");
    const { companyId } = useParams();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const navigate = useNavigate(); // Tambahkan useNavigate di Sidebar

    // Callback jika company berubah
    const handleCompanyChange = (company) => {
        setSelectedCompany(company);
    };

    return (
        <>
            <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-visible shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
                <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
                    {/* Tombol Add Company */}
                    <button
                        className="mb-2 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 transition"
                        onClick={() => navigate('/create-company')}
                    >
                        + Add Company
                    </button>
                    <div className="mb-4">
                        <Dropdown
                            selectedCompany={selectedCompany}
                            setSelectedCompany={setSelectedCompany}
                            onCompanyChange={handleCompanyChange}
                            companyId={companyId}
                        />
                    </div>

                    <div className={
                        "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
                        collapseShow
                    }>
                        {/* Search bar */}
                        <form className="mt-6 mb-4 md:hidden">
                            <div className="mb-3 pt-0">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="border-0 px-3 py-2 h-12 border-gray-300 placeholder-gray-400 text-gray-700 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                                />
                            </div>
                        </form>

                        <hr className="my-4 md:min-w-full" />
                        <h6 className="md:min-w-full text-gray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
                            Company Dashboard
                        </h6>

                        {/* Sidebar Links */}
                        <ul className="md:flex-col md:min-w-full flex flex-col list-none">
                            <li className="items-center">
                                <Link
                                    className={`text-xs uppercase py-3 font-bold block ${window.location.href.includes("/admin/dashboard") ? "text-sky-500 hover:text-sky-600" : "text-gray-700 hover:text-gray-500"
                                        }`}
                                    to={`/company-dashboard/${selectedCompany ? selectedCompany.id : ""}`}
                                >
                                    <i className={`fas fa-tv mr-2 text-sm ${window.location.href.includes("/admin/dashboard") ? "opacity-75" : "text-gray-300"
                                        }`}></i>{" "}
                                    Dashboard
                                </Link>
                            </li>

                            <li className="items-center">
                                <Link
                                    className="text-xs uppercase py-3 font-bold block text-gray-700 hover:text-gray-500"
                                    to="#"
                                >
                                    <i className="fas fa-tools mr-2 text-sm text-gray-300"></i>{" "}
                                    Manage Post
                                </Link>
                            </li>

                            <li className="items-center">
                                <Link
                                    className="text-xs uppercase py-3 font-bold block text-gray-700 hover:text-gray-500"
                                    to="#"
                                >
                                    <i className="fas fa-table mr-2 text-sm text-gray-300"></i>{" "}
                                    Manage Vacancy
                                </Link>
                            </li>

                            <li className="items-center">
                                <Link
                                    className={`text-xs uppercase py-3 font-bold block ${window.location.pathname.includes("/manage-member") ? "text-sky-500 hover:text-sky-600" : "text-gray-700 hover:text-gray-500"
                                        }`}
                                    to={`/company-dashboard/manage-member/${selectedCompany ? selectedCompany.id : ""}`}
                                >
                                    {/* Pastikan link ini membawa companyId yang dipilih */}
                                    <i className={`fas fa-table mr-2 text-sm ${window.location.pathname.includes("/manage-member") ? "opacity-75" : "text-gray-300"
                                        }`}></i>{" "}
                                    Manage Member
                                </Link>
                            </li>

                            <li className="items-center">
                                <Link
                                    className="text-xs uppercase py-3 font-bold block text-gray-700 hover:text-gray-500"
                                    to="#"
                                >
                                    <i className="fas fa-table mr-2 text-sm text-gray-300"></i>{" "}
                                    Company Setting
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}