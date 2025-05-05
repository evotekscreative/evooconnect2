import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProfileBox() {
  const [user, setUser] = useState({
    name: '',
    headline: '',
    profile_image: '',
    connections_count: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        if (response.data.status === 'success') {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Set mock data for development
        setUser({
          name: 'John Doe',
          headline: 'Software Engineer',
          profile_image: '/img/p1.png',
          connections_count: 42
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-3 text-center overflow-hidden">
      <div className="border-b px-3 py-4">
        <img 
          src={user.profile_image || '/img/default-photo.png'} 
          className="mx-auto rounded-full mt-2 w-[75px] h-[75px] object-cover"
          alt={user.name} 
        />
        <h5 className="font-bold text-gray-800 mb-1 mt-4">
          {user.name || 'Loading...'}
        </h5>
        <p className="text-gray-500 mb-0">{user.headline || 'No headline'}</p>
      </div>
      
      <div className="flex">
        <div className="w-1/2 border-r p-3">
          <h6 className="font-bold text-gray-800 mb-1">
            {user.connections_count}
          </h6>
          <p className="text-gray-500 text-sm mb-0">Connections</p>
        </div>
        <div className="w-1/2 p-3">
          <h6 className="font-bold text-gray-800 mb-1">0</h6>
          <p className="text-gray-500 text-sm mb-0">Views</p>
        </div>
      </div>
      
      <div className="border-t overflow-hidden">
        <Link 
          to="/profile" 
          className="block p-3 font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
        >
          View my profile
        </Link>
      </div>
    </div>
  );
}

export default ProfileBox;