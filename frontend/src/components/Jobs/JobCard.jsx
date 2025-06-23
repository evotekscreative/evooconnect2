import { Link } from "react-router-dom";

export default function JobCard({ job }) {
    const rating = job.rating || 0;
    const ratingStars = Math.max(0, Math.min(5, Math.floor(rating)));
    
    return (
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${job.id}`}>
                        <h4 className="text-md font-semibold truncate">{job.title}</h4>
                    </Link>
                    <p className="text-sm text-[#0A66C2] truncate">{job.company?.name || job.company}</p>
                    <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(ratingStars)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.85 1.416 8.241L12 18.897l-7.416 4.617L6 15.273 0 9.423l8.332-1.268z" />
                            </svg>
                        ))}
                        {rating % 1 > 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.85 1.416 8.241L12 18.897l-7.416 4.617L6 15.273 0 9.423l8.332-1.268z" />
                            </svg>
                        )}
                        <span className="ml-1 text-xs text-gray-600">({rating})</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{job.location}</p>
                </div>
                <div className="flex-shrink-0">
                    {job.company?.logo ? (
                        <img
                            src={'baseUrl' in job.company && job.company.logo.startsWith('http') ? job.company.logo : `${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${job.company.logo}`}
                            alt="logo"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">{(job.company?.name || job.company || 'C').charAt(0)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 text-sm text-gray-600 line-clamp-2">{job.description}</div>
            <div className="mt-3 flex justify-between text-xs text-gray-400">
                <span>{job.job_type || job.employmentType}</span>
                <span>Posted {Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24)) || 0} days ago</span>
            </div>
        </div>
    );
}