import { useState } from 'react';
import { UserPlus, UserMinus, Search, MoreHorizontal, ArrowLeft } from 'lucide-react';
import Case from '../components/Case.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function ConnectionList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); 
  const [connections, setConnections] = useState([
    {
      id: 1,
      name: 'Jane Doe',
      role: 'Developer',
      connected: true,
      image: 'https://i.prphoto.cc/100?img=1',
    },
    {
      id: 2,
      name: 'John Smith',
      role: 'Designer',
      connected: false,
      image: 'https://i.prphoto.cc/100?img=2',
    },
  ]);

  const toggleConnection = (id) => {
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, connected: !conn.connected } : conn
    ));
  };

  const handleDisconnect = (id) => {
    setConnections(connections.filter(connection => connection.id !== id));
  };

  const filteredConnections = connections.filter(connection => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Case>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
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
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{connection.name}</h3>
                    <p className="text-sm text-gray-500">{connection.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link to="/messages" className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition">
                    Message
                  </Link>
                  <button 
                    onClick={() => handleDisconnect(connection.id)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-white border bg-red-600 hover:bg-red-400 transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No connections found matching your search.
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
            Total connections: {connections.filter(c => c.connected).length}
          </p>
        </div>
      </div>
    </Case>
  );
}