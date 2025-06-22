import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FollowersModal = ({ isOpen, onClose, companyId, companyName }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && companyId) {
      fetchFollowers();
    }
    // eslint-disable-next-line
  }, [isOpen, companyId]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '{{base_url}}';
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${baseUrl}/api/company-follow/${companyId}/followers`,
        {
          params: { limit: 10, offset: 0 },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFollowers(response.data.data?.followers || []);
    } catch (err) {
      setError('Failed to load followers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Followers{companyName ? ` of ${companyName}` : ''}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : followers.length === 0 ? (
          <p className="text-gray-500">No followers yet.</p>
        ) : (
          <ul className="space-y-3">
            {followers.map(user => (
              <li key={user.id} className="flex items-center gap-3">
                <img
                  src={user.photo ? `${baseUrl}/${user.photo}` : '/default-avatar.png'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FollowersModal;