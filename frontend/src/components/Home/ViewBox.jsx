import { useEffect, useState } from 'react';

function ViewBox() {
  // You'd normally fetch this data from an API
  const [stats, setStats] = useState({
    last5Days: 8,
    weeklyGrowth: 43
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-3 overflow-hidden">
      <div className="border-b p-3">
        <h6 className="m-0 font-medium">Profile Views</h6>
      </div>
      
      <div className="flex text-center">
        <div className="w-1/2 border-r p-4">
          <h5 className="font-bold text-blue-500 mb-1 flex items-center justify-center">
            {stats.last5Days} 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </h5>
          <p className="text-gray-500 text-sm mb-0">last 5 days</p>
        </div>
        
        <div className="w-1/2 p-4">
          <h5 className="font-bold text-green-500 mb-1 flex items-center justify-center">
            + {stats.weeklyGrowth}% 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </h5>
          <p className="text-gray-500 text-sm mb-0">Since last week</p>
        </div>
      </div>
      
      <div className="border-t overflow-hidden text-center">
        <img src="/img/chart.png" className="w-full" alt="View statistics chart" />
      </div>
    </div>
  );
}

export default ViewBox;