import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function JobBox() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs/suggestions');
        if (response.data.status === 'success') {
          setJobs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching job suggestions:', error);
        // Use mock data for now
        setJobs([
          {
            id: 1,
            title: 'Product Director',
            company: 'Spotify Inc.',
            location: 'India, Punjab',
            logo: '/img/l3.png',
            connections: [
              { id: 1, name: 'Sophia Lee', photo: '/img/p9.png' },
              { id: 2, name: 'John Doe', photo: '/img/p10.png' },
              { id: 3, name: 'Julia Cox', photo: '/img/p11.png' },
              { id: 4, name: 'Robert Cook', photo: '/img/p12.png' }
            ],
            posted_at: '3 Days ago'
          },
          {
            id: 2,
            title: '.NET Developer',
            company: 'Invision',
            location: 'London, UK',
            logo: '/img/l4.png',
            connections: [
              { id: 1, name: 'Sophia Lee', photo: '/img/p13.png' },
              { id: 2, name: 'John Doe', photo: '/img/p1.png' },
              { id: 3, name: 'Robert Cook', photo: '/img/p3.png' }
            ],
            posted_at: '3 Days ago'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border mb-3">
        <div className="border-b p-3">
          <h6 className="m-0 font-medium">Jobs</h6>
        </div>
        <div className="p-4 text-center">
          <div className="loader mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-3">
      <div className="border-b p-3">
        <h6 className="m-0 font-medium">Jobs</h6>
      </div>
      
      <div className="p-3">
        {jobs.map(job => (
          <Link to="/job-profile" key={job.id}>
            <div className="mb-3 last:mb-0 rounded bg-white shadow-sm border hover:shadow-md transition-shadow">
              {/* Job Header */}
              <div className="flex items-center p-3">
                <div className="mr-auto overflow-hidden">
                  <h6 className="font-medium text-gray-800 truncate mb-0">{job.title}</h6>
                  <div className="text-blue-600 truncate">{job.company}</div>
                  <div className="text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                </div>
                <img className="h-10 w-auto ml-3" src={job.logo} alt={job.company} />
              </div>
              
              {/* Job Connections */}
              <div className="border-t border-b flex items-center p-3">
                <div className="flex -space-x-2 mr-2">
                  {job.connections.slice(0, 4).map((connection, idx) => (
                    <img 
                      key={idx}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm" 
                      src={connection.photo} 
                      alt={connection.name}
                      title={connection.name}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {job.connections.length} connections
                </span>
              </div>
              
              {/* Job Footer */}
              <div className="p-3">
                <small className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Posted {job.posted_at}
                </small>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default JobBox;