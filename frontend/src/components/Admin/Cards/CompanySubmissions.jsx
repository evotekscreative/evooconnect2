'use client'
import { useState } from 'react';
import { User, RefreshCw, Search } from 'lucide-react';

const CompanySubmissions = ({ color = "light" }) => {
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      user: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+628123456789",
        role: "Founder",
        joinDate: "2022-01-15"
      },
      company: {
        name: "Tech Innovators Inc",
        linkedin: "tech-innovators",
        website: "https://techinnovators.com",
        industry: "Information Technology",
        size: "51-200 employees",
        type: "Privately Held",
        logo: "https://via.placeholder.com/50",
        tagline: "Innovating for a better tomorrow"
      },
      submissionDate: "2023-05-10",
      status: "pending"
    },
    {
      id: 2,
      user: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+628987654321",
        role: "HR Director",
        joinDate: "2021-11-20"
      },
      company: {
        name: "Green Solutions",
        linkedin: "green-solutions",
        website: "https://greensolutions.co",
        industry: "Environmental Services",
        size: "11-50 employees",
        type: "Public Company",
        logo: "https://via.placeholder.com/50/00ff00",
        tagline: "Sustainable solutions for a greener planet"
      },
      submissionDate: "2023-05-12",
      status: "pending"
    },
    {
      id: 3,
      user: {
        name: "Michael Johnson",
        email: "michael.j@example.com",
        phone: "+628112233445",
        role: "CEO",
        joinDate: "2020-03-05"
      },
      company: {
        name: "Digital Creations",
        linkedin: "digital-creations",
        website: "https://digitalcreations.io",
        industry: "Digital Media",
        size: "201-500 employees",
        type: "Privately Held",
        logo: "https://via.placeholder.com/50/0000ff",
        tagline: "Creating digital experiences that matter"
      },
      submissionDate: "2023-05-15",
      status: "pending"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 10;

  const filteredData = submissions.filter(sub => 
    sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewUser = (submissionId) => {
    const submission = submissions.find(sub => sub.id === submissionId);
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <div className="relative flex flex-col w-full mb-6 shadow-lg rounded-lg border border-gray-900 bg-white">
      {/* Header Section */}
      <div className="rounded-t-lg px-6 py-4 border-b border-gray-900 bg-sky-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            Company Submissions
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-900 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center p-2.5 border border-gray-900 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border-b border-gray-900">
            <table className="min-w-full divide-y divide-gray-900">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white sticky left-0 z-10">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    LinkedIn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Website
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Logo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-900 bg-sky-800 text-white">
                    Tagline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-sky-800 text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-900">
                {paginatedData.length > 0 ? (
                  paginatedData.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-900 sticky left-0 z-10 bg-white">
                        {submission.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        {submission.company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 border-r border-gray-900">
                        <a href={`https://linkedin.com/company/${submission.company.linkedin}`} target="_blank" rel="noopener noreferrer">
                          {submission.company.linkedin}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 border-r border-gray-900">
                        <a href={submission.company.website} target="_blank" rel="noopener noreferrer">
                          {submission.company.website}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        {submission.company.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        {submission.company.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        {submission.company.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-900">
                        <img 
                          src={submission.company.logo} 
                          alt="Company Logo" 
                          className="h-10 w-10 rounded-md object-cover" 
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-900">
                        {submission.company.tagline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewUser(submission.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <User className="h-4 w-4 mr-2" />
                          View User
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-6 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white border-t border-gray-900 rounded-b-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
              <span className="font-medium">{filteredData.length}</span> results
            </div>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-900 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-900 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )} */}

      {/* User Info Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 py-5 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-xl leading-6 font-semibold text-gray-900 mb-6">
                      User Information - {selectedSubmission.user.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-900">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Telephone</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Role</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-900">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">Submission Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Join Date</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.user.joinDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Submission Date</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.submissionDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Company Filed</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{selectedSubmission.company.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                selectedSubmission.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : selectedSubmission.status === 'rejected' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {selectedSubmission.status === 'approved' 
                                  ? 'Approved' 
                                  : selectedSubmission.status === 'rejected' 
                                    ? 'Rejected' 
                                    : 'Pending Review'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-900">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800">Additional Notes</h4>
                      <p className="text-sm text-gray-500 italic">No additional notes from user.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-900">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full inline-flex justify-center rounded-md border border-gray-900 shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySubmissions;