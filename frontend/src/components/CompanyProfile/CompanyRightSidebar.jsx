import React, { useState, useEffect } from 'react';
import job1 from "../../assets/img/job1.png";
import { Link } from 'react-router-dom';

// Komponen reusable untuk tombol Follow/Unfollow
const FollowButton = ({ isFollowing, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`text-sm py-2 px-4 rounded-md text-white transition-colors ${
      isFollowing ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {isFollowing ? 'Followed' : 'Follow'}
  </button>
);

export default function CompanyRightSidebar({
  isFollowingAmazon,
  setIsFollowingAmazon,
  isConnectedSophia,
  setIsConnectedSophia
}) {
  const [companies, setCompanies] = useState([]);
  const [followed, setFollowed] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const fetchRandomCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/companies-random`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        setCompanies(result.data.companies);
        
        // Initialize followed state with API data
        const initialFollowed = {};
        result.data.companies.forEach(company => {
          if (company.is_following) {
            initialFollowed[company.id] = true;
          }
        });
        setFollowed(initialFollowed);
      } catch (error) {
        console.error('Error fetching random companies:', error);
      }
    };

    fetchRandomCompanies();
  }, []);

  const toggleFollowCompany = async (companyId, currentlyFollowing, companyName = 'this company') => {
    await performFollowAction(companyId, currentlyFollowing);
  };

  const performFollowAction = async (companyId, currentlyFollowing) => {
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;

    setLoadingFollow((prev) => ({ ...prev, [companyId]: true }));

    const endpoint = currentlyFollowing
      ? `${baseUrl}/api/company-follow/unfollow`
      : `${baseUrl}/api/company-follow/follow`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_id: companyId })
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setFollowed((prev) => ({
          ...prev,
          [companyId]: !currentlyFollowing
        }));
      } else if (response.status === 400 && result.data === "Already following this company") {
        // User is already following, update state to reflect this
        setFollowed((prev) => ({
          ...prev,
          [companyId]: true
        }));
      } else {
        console.error("Failed to toggle follow:", result);
      }
    } catch (err) {
      console.error("Error during follow/unfollow request:", err);
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [companyId]: false }));
    }
  };



  return (
    <div className="lg:col-span-3 space-y-3">

      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-4">Similar Pages</h2>
        <div className="space-y-4">
          {companies.length > 0 ? (
            companies.map((company) => {
              const isFollowing = company.is_following || !!followed[company.id];
              return (
                <div key={company.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={'base_url' in company ? `${company.base_url}/${company.logo}` : "/default-company-logo.png"}
                      alt={company.name} 
                      className="w-12 h-12 rounded-full bg-gray-200 object-cover" 
                    />
                    <div>
                      <Link to={`/company-detail/${company.id}`} className="text-black-600 hover:underline">
                      <p className="font-medium">{company.name}</p>
                      </Link>
                      <p className="text-sm text-gray-400">{company.industry || 'Company'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={job1} alt="Amazon" className="w-12 h-12 rounded-full bg-gray-200" />
                <div>
                  <p className="font-medium">Amazon</p>
                  <p className="text-sm text-gray-400">Internet</p>
                </div>
              </div>
              <FollowButton
                isFollowing={isFollowingAmazon}
                onClick={() => setIsFollowingAmazon(!isFollowingAmazon)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-md text-center">
        <p className="font-bold text-lg mb-1">EVOConnect Premium</p>
        <p className="text-sm text-gray-700">Grow & nurture your network</p>
        <button className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-4 rounded">
          ACTIVATE
        </button>
      </div>
    </div>
  );
}
