
import { Link } from "react-router-dom";

export default function CompanyCard({ company }) {
    
    return (
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start">
                <div>
                    <Link to={`/company-profile/${company.id}`}>
                        <h4 className="text-md font-semibold">{company.name}</h4>
                    </Link>
                    <p className="text-sm text-gray-600">{company.description}</p>
                    <div className="mt-2 flex items-center gap-1 text-yellow-400">
                        {[...Array(Math.floor(company.rating))].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.85 1.416 8.241L12 18.897l-7.416 4.617L6 15.273 0 9.423l8.332-1.268z" />
                            </svg>
                        ))}
                        {company.rating % 1 > 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.85 1.416 8.241L12 18.897l-7.416 4.617L6 15.273 0 9.423l8.332-1.268z" />
                            </svg>
                        )}
                        <span className="ml-1 text-xs text-gray-600">({company.rating})</span>
                    </div>
                </div>
                <img
                    src={company.logo}
                    alt="logo"
                    className="w-12 h-12 rounded-full object-cover"
                />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="text-gray-500">Industry:</span>
                    <span className="ml-2">{company.industry}</span>
                </div>
                <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2">{company.location}</span>
                </div>
                <div>
                    <span className="text-gray-500">Employees:</span>
                    <span className="ml-2">{company.employees}</span>
                </div>
            </div>
        </div>
    );
}
