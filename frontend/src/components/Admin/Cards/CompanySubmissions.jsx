'use client'
import { useState, useEffect } from 'react';
import { User, RefreshCw, Search } from 'lucide-react';
import TableDropdown from "../../../components/Admin/Dropdowns/TableDropdown.jsx";

const CompanySubmissions = ({ color = "light" }) => {
  // Data contoh (biasanya data ini akan didapat dari API)
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

  const isLight = color === "light";
  const headerClass = "px-6 py-3 text-xs uppercase font-semibold text-left border-b border-sky-700 bg-sky-800 text-white";
  const lightHeader = "bg-gray-100 text-gray-500 border-sky-700";
  const darkHeader = "bg-sky-800 text-sky-200 border-sky-700";
  const textColor = isLight ? "text-gray-800" : "text-gray-800";
  const borderColor = isLight ? "border-gray-200" : "border-sky-700";

  // Filter data berdasarkan search term
  const filteredData = submissions.filter(sub => 
    sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hitung total halaman
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Potong data untuk halaman saat ini
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
    // Di sini bisa ditambahkan fungsi untuk fetch data terbaru dari API
  };

  // Handle view user info
  const handleViewUser = (submissionId) => {
    const submission = submissions.find(sub => sub.id === submissionId);
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <div className={`relative flex flex-col w-full mb-6 shadow-lg rounded`}>
      <div className="rounded-t mb-0 px-4 py-3 border-b border-sky-700 bg-sky-800">
        <div className="flex flex-wrap items-center">
          <div className="w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-white">
              Company Submissions
            </h3>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="block w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Fixed 5 columns */}
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader} sticky left-0 z-10`}>
                    User
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Company
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    LinkedIn
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Website
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Industry
                  </th>
                  
                  {/* Scrollable columns */}
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Size
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Type
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Logo
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Tagline
                  </th>
                  <th scope="col" className={`${headerClass} ${isLight ? lightHeader : darkHeader}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      {/* Fixed 5 columns */}
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textColor} sticky left-0 z-10 bg-white`}>
                        <span className="font-bold">{submission.user.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <a href={`https://linkedin.com/company/${submission.company.linkedin}`} target="_blank" rel="noopener noreferrer">
                          {submission.company.linkedin}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <a href={submission.company.website} target="_blank" rel="noopener noreferrer">
                          {submission.company.website}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.company.industry}
                      </td>
                      
                      {/* Scrollable columns */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.company.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.company.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <img 
                          src={submission.company.logo} 
                          alt="Company Logo" 
                          className="h-10 w-10 rounded-md object-cover" 
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {submission.company.tagline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewUser(submission.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <User className="h-4 w-4" />
                          <span>View User</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  &laquo;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informasi User */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      User Information - {selectedSubmission.user.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-semibold mb-2">Basic Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Name</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.user.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.user.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Telephone</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.user.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Role</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.user.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-semibold mb-2">Submission Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Join Date</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.user.joinDate}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Submission Date</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.submissionDate}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Company Filed</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedSubmission.company.name}</p>
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
                                    ? 'Disetujui' 
                                    : selectedSubmission.status === 'rejected' 
                                      ? 'Ditolak' 
                                      : 'Waiting for Review'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-2">Additional Notes</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 italic">No additional notes from user.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Closed
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