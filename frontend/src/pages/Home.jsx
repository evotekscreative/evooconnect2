import { useState } from 'react';

export default function SocialNetworkFeed() {
  const [postContent, setPostContent] = useState('');
  
  return (
    <div className="flex bg-gray-50">
      {/* Left Sidebar - Profile Section */}
      <div className="w-1/4 p-4">
        <div className="bg-white rounded-lg shadow mb-4 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-200 w-24 h-24 flex items-center justify-center text-4xl text-gray-600">
              PE
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-6">PPLG EVOTEKS</h2>
          
          <div className="flex justify-between border-t pt-4">
            <div className="text-center">
              <div className="text-xl font-semibold">358</div>
              <div className="text-gray-500 text-sm">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">85</div>
              <div className="text-gray-500 text-sm">Views</div>
            </div>
          </div>
          
          <button className="mt-4 text-blue-500 font-medium">View my profile</button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-4">Profile Views</h3>
          
          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-2xl font-semibold text-cyan-400">08</div>
              <div className="text-gray-500 text-sm">last 5 days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-500">+ 43%</div>
              <div className="text-gray-500 text-sm">Since last week</div>
            </div>
          </div>
          
          <div className="h-24 mt-2">
            {/* Chart placeholder */}
            <div className="w-full h-full bg-gradient-to-r from-cyan-300 to-cyan-400 rounded-md"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Feed */}
      <div className="w-1/2 p-4">
        {/* Post creation box */}
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <div className="flex items-center mb-4">
            <div className="tabs w-full flex border-b">
              <div className="tab flex-1 text-blue-500 border-b-2 border-blue-500 py-2 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path d="M16.94 17.5A9 9 0 1010 18.94V17h4v-2h-4v-2.896a3.5 3.5 0 00-.5-1.897A5 5 0 0113 7.5V6a1 1 0 012 0v1.5a3 3 0 01-1.5 2.793V12H15v1h-1.5v2.5h3.44z"></path>
                </svg>
                Share an update
              </div>
              <div className="tab flex-1 text-gray-500 py-2 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path>
                </svg>
                Write an article
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
              PE
            </div>
            <input 
              type="text" 
              className="flex-1 border-0 outline-none bg-transparent"
              placeholder="Write your thoughts..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
          </div>
          
          <div className="flex mb-3 ml-12">
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full mr-2">Public</span>
            <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full mr-2">Private</span>
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Only Connection</span>
            <button className="ml-2 text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Share an update
          </button>
        </div>
        
        {/* Posts */}
        <div className="space-y-4">
          {/* Post 1 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                FS
              </div>
              <div>
                <div className="font-medium text-blue-500">fazrie riesky saputra</div>
                <div className="text-gray-500 text-sm">1 months ago</div>
              </div>
              <div className="ml-auto">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.586l-2-2H6.414l-2 2H4zm10 5a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            
            <div className="mb-4">haii</div>
            
            <div className="flex items-center text-gray-500">
              <button className="flex items-center mr-4 text-blue-500">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                </svg>
                Like
              </button>
              <span className="mr-4">2</span>
              <button className="flex items-center text-blue-500">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
                </svg>
                Comment
              </button>
            </div>
          </div>
          
          {/* Post 2 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                MA
              </div>
              <div>
                <div className="font-medium text-blue-500">Muhamad Afghan Alzena</div>
                <div className="text-gray-500 text-sm">1 months ago</div>
              </div>
              <div className="ml-auto">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.586l-2-2H6.414l-2 2H4zm10 5a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            
            <div className="mb-4">HALO SEMUAAA</div>
            
            <div className="flex items-center text-gray-500">
              <button className="flex items-center mr-4 text-blue-500">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                </svg>
                Like
              </button>
              <span className="mr-4">2</span>
              <button className="flex items-center text-blue-500">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
                </svg>
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-1/4 p-4">
        {/* People You Might Know */}
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h3 className="font-medium text-lg mb-4">People you might know</h3>
          
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
              <img src="https://via.placeholder.com/48" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Bintang Asydqi</div>
              <div className="text-gray-500 text-sm">Student at Alexander</div>
            </div>
            <div className="text-blue-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Premium Banner */}
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <div className="mb-3">
            <img src="/api/placeholder/400/150" alt="Premium" className="w-full rounded" />
          </div>
          <h3 className="font-bold text-xl text-yellow-500 text-center mb-2">EVOConnect Premium</h3>
          <p className="text-gray-600 text-center mb-4">Grow & nurture your network</p>
          <button className="w-full border border-yellow-500 text-yellow-500 py-2 rounded-lg font-medium">
            ACTIVATE
          </button>
        </div>
        
        {/* Jobs */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-lg mb-4">Jobs</h3>
          
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="font-medium">Product Director</h4>
              <p className="text-blue-500">Spotify Inc.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.75 11.5a.75.75 0 01-1.5 0V8.25H7.75a.75.75 0 010-1.5h4.5v4.75z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}