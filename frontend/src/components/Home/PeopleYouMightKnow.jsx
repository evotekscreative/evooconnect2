import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PeopleYouMightKnow() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get('/api/connections/suggestions');
        if (response.data.status === 'success') {
          setPeople(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching connection suggestions:', error);
        // Use mock data for now
        setPeople([
          {
            id: 1,
            name: 'Bintang Asydqi',
            headline: 'Student at Alexander',
            profile_photo_url: '/img/p8.png',
            is_online: true,
            is_connected: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, []);
  
  const handleConnect = async (personId) => {
    try {
      await axios.post(`/api/connections/request/${personId}`);
      
      // Update UI to show connection request sent
      setPeople(people.map(person => {
        if (person.id === personId) {
          return { ...person, is_connected: true };
        }
        return person;
      }));
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border mb-3">
        <div className="p-4 text-center">
          <div className="loader mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-3">
      <div className="border-b p-3">
        <h6 className="m-0 font-medium">People you might know</h6>
      </div>
      
      <div className="p-3">
        {people.length > 0 ? (
          people.map(person => (
            <div key={person.id} className="flex items-center mb-3 last:mb-0">
              <div className="mr-3 relative">
                <img 
                  className="w-10 h-10 rounded-full" 
                  src={person.profile_photo_url || '/img/default-avatar.png'} 
                  alt={person.name} 
                />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${
                  person.is_online ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <div className="font-medium mr-auto">
                <div className="text-sm truncate">{person.name}</div>
                <div className="text-xs text-gray-500">{person.headline}</div>
              </div>
              
              <button 
                type="button"
                className={`ml-2 p-2 rounded-full ${
                  person.is_connected 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                onClick={() => handleConnect(person.id)}
                disabled={person.is_connected}
              >
                {person.is_connected ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-2">No suggestions available</p>
        )}
      </div>
    </div>
  );
}

export default PeopleYouMightKnow;