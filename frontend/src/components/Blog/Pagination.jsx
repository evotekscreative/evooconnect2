const Pagination = ({ currentPage, pageGroup, totalGroups, currentPageNumbers, setCurrentPage, setPageGroup }) => (
    <div className="flex justify-center mt-12 gap-2 flex-wrap">
      {pageGroup > 0 && (
        <button
          onClick={() => setPageGroup((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition font-semibold"
        >
          &laquo;
        </button>
      )}
  
      {currentPageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-4 py-2 rounded-full ${
            currentPage === page
              ? "bg-blue-700 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-blue-600 hover:text-white transition font-semibold`}
        >
          {page}
        </button>
      ))}
  
      {pageGroup < totalGroups - 1 && (
        <button
          onClick={() => setPageGroup((prev) => prev + 1)}
          className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition font-semibold"
        >
          &raquo;
        </button>
      )}
    </div>
  );
  
  export default Pagination;
  