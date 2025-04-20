import React from 'react';
import { Bell, MoreHorizontal, MapPin } from 'lucide-react';
import Case from '../components/Case';

const NotificationPage = () => {
  return (
    <Case>
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-6xl flex">
        {/* Left Column */}
        <div className="w-1/4 p-4">
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="">
                <img src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                </div>
            <div className="p-4">
            <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Notification</h2>
          <p className="text-gray-600">You're all caught up! Check back later for new notifications</p>
        </div>
              <div className="mt-4">
                <button className="border border-blue-500 text-blue-500 rounded-full px-6 py-1 w-full">View settings</button>
              </div>
            </div>
          </div>

          <div className="max-w-sm rounded-lg bg-white shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Envato</h2>
          <p className="text-gray-500">Melbourne, AU</p>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Posted</span>
          <span className="font-medium">1 day ago</span>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Applicant Rank</span>
          <span className="font-medium">25</span>
        </div>
      </div>
    </div>
        </div>

        {/* Center Column */}
        <div className="w-2/4 p-4">
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Recent</h2>
            </div>

            {/* First notification */}
            <div className="p-4 flex border-b hover:bg-gray-50">
              <div className="mr-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                  <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">DAILY RUNDOWN: WEDNESDAY</h3>
                    <p className="text-gray-600 text-sm">Income tax sops on the cards, The bias in VC funding, and other top news for you</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 text-sm">3d</span>
                    <button className="ml-2 text-gray-500 rounded-full hover:bg-gray-200 p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Second notification */}
            <div className="p-4 flex border-b hover:bg-gray-50">
              <div className="mr-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  <img src="/api/placeholder/40/40" alt="P" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-gray-800">We found a job at askbootstrap Ltd that you may be interested in Vivamus imperdiet venenatis est...</p>
                    <button className="mt-2 border border-blue-500 text-blue-500 rounded-full px-4 py-1">View Jobs</button>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 text-sm">4d</span>
                    <button className="ml-2 text-gray-500 rounded-full hover:bg-gray-200 p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Earlier</h2>
            </div>

            {/* Third notification */}
            <div className="p-4 flex hover:bg-gray-50">
              <div className="mr-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  <img src="/api/placeholder/40/40" alt="P" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">DAILY RUNDOWN: MONDAY</h3>
                    <p className="text-gray-600 text-sm">Nunc purus metus, aliquam vitae venenatis sit amet, porta non est.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 text-sm">3d</span>
                    <button className="ml-2 text-gray-500 rounded-full hover:bg-gray-200 p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/4 p-4">
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="p-4 border-b">
              <button className="bg-red-500 text-white rounded-lg flex items-center justify-center py-2 px-4 w-full">
                <Bell className="mr-2" size={18} />
                Set alert for jobs
              </button>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4 border-b">Similar Jobs</h2>
              
              <div className="mb-4">
                <div className='bg-gray-100 p-4 rounded-lg '>
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold">Product Director</h3>
                  <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                    <img src="/api/placeholder/24/24" alt="Company Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <p className="text-blue-500">Spotify Inc.</p>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin size={14} className="mr-1" />
                  <span>India, Punjab</span>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                  </div>
                  <span className="text-gray-600 text-sm ml-2">18 connections</span>
                </div>
              </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Who viewed your profile</h2>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-3 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/api/placeholder/48/48" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">Sophia Lee</p>
                    <p className="text-gray-600 text-sm">@Harvard</p>
                  </div>
                </div>
                <button className="border border-blue-500 text-blue-500 rounded-full px-4 py-1">Connect</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Case>
  );
};


export default NotificationPage;