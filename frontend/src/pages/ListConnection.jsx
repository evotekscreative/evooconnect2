import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Search, MoreHorizontal, ArrowLeft } from 'lucide-react';
import Case from '../components/Case.jsx';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from "../assets/img/logo-evo-2.png";

export default function ConnectionList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user);
  
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/${user.id}/connections?limit=100&offset=0`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
  
        let mappedConnections = []
        if(response.data.data.connections != null){
           mappedConnections = response.data.data.connections.map((connection) => ({
            id: connection.user.id,
            name: connection.user.name,
            headline: connection.user.headline || "No headline",
            connected: true,
            image: connection.user.photo || Profile,
            username: connection.user.username || "",
          }));
        }else {
          mappedConnections = []
        }

        console.log(mappedConnections);
        
  
        setConnections(mappedConnections);
      } catch (err) {
        console.error("Failed to fetch connections:", err);
        setError("Failed to load connections. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchConnections();
  }, []);
  

  const handleDisconnect = async (userId) => {
    const token = localStorage.getItem("token");
  
    try {
      await axios.delete(
        `http://localhost:3000/api/users/${userId}/connect`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
  
      setConnections(connections.filter(connection => connection.id !== userId));
    } catch (err) {
      console.error("Failed to disconnect:", err);
      alert("Failed to disconnect. Please try again.");
    }
  };
  

  const filteredConnections = connections.filter(connection => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (connection.role && connection.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Case>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Case>
    );
  }

  if (error) {
    return (
      <Case>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center py-20 text-red-500">{error}</div>
        </div>
      </Case>
    );
  }

  return (
    <Case>
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left side - People suggestions */}
          <div className="lg:col-span-3 space-y-4 bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">My Connections</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Connection List */}
        <div className="space-y-4">
          {filteredConnections.length > 0 ? (
            filteredConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={connection.image}
                    alt={connection.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = Profile;
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{connection.name}</h3>
                    <p className="text-sm text-gray-500">{connection.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/messages/${connection.username || connection.id}`} 
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition"
                  >
                    Message
                  </Link>
                  <button 
                    onClick={() => handleDisconnect(connection.id)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-white border bg-red-600 hover:bg-red-700 transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {connections.length === 0 
                ? "You don't have any connections yet." 
                : `No connections found matching "${searchTerm}"`}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredConnections.length} connection{filteredConnections.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          <p className="text-sm text-gray-600">
            Total connections: {connections.length}
          </p>
        </div>
              
        </div>

          {/* Right side - Manage network */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-medium mb-2 border-b pb-3 text-sm sm:text-base">
                Manage my network
              </h3>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li className="border-b pb-3">
                  <Link to="/list-connection" className="flex justify-between">
                    <span>Connections</span>
                    <span>
                      0
                    </span>
                  </Link>
                </li>
                <li className="border-b pb-3">
                  <Link to="/messages" className="flex justify-between">
                    <span>Contacts</span> <span>869</span>
                  </Link>
                </li>
                <li className="border-b pb-3">
                  <Link to="/groups" className="flex justify-between">
                    <span>Groups</span> <span>0</span>
                  </Link>
                </li>
                <li>
                  <Link to="/hashtags" className="flex justify-between">
                    <span>Hashtag</span> <span>8</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow p-4 text-center">
              <img
                src={Profile}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover"
              />
              <p className="text-xs sm:text-sm font-medium mb-1">
                Gurdeep, grow your career by following{" "}
                <span className="text-blue-600">Askbootsrap</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Stay up-to industry trends!
              </p>
              <button className="border border-blue-500 text-blue-500 rounded px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium">
                FOLLOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </Case>
  );
}