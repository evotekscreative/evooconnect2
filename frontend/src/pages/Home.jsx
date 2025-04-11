import { HeartIcon } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import React from 'react';

const Home = () => {
  return (
    <div className="bg-gray-200 min-h-screen px-2 py-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* KIRI - Profile Card & Views */}
        <div className="space-y-4">
          <div className="rounded border bg-white text-center shadow-sm">
            <div className="border-b px-3 py-4">
              <img src="#" className="w-20 h-20 rounded-full mx-auto mt-2" alt="Profile" />
              <h5 className="font-bold text-gray-800 mb-1 mt-4">Nama User</h5>
              <p className="text-gray-600 mb-0">Not Available</p>
            </div>
            <div className="flex">
              <div className="w-1/2 border-r p-3">
                <h6 className="font-bold text-gray-800 mb-1">50</h6>
                <p className="text-gray-500 text-xs mb-0">Connections</p>
              </div>
              <div className="w-1/2 p-3">
                <h6 className="font-bold text-gray-800 mb-1">300</h6>
                <p className="text-gray-500 text-xs mb-0">Views</p>
              </div>
            </div>
            <div className="border-t overflow-hidden">
              <a className="font-bold block p-3 hover:bg-gray-50" href="/profile">View my profile</a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-4">Profile Views</h3>
            <div className="flex">
              <div className="w-1/2 border-r p-3">
              <p className="text-blue-500 font-bold text-lg">08</p>
              <span>last 5 days</span>
              </div>
              <div className="w-1/2 p-3">
              <p className="text-green-500 font-bold text-lg">+43%</p>
              <span>Since last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* TENGAH - Post & Feed */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start gap-3 border-b pb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                <img src="#" alt="" className='w-9 h-9 rounded-full'/>
              </div>
              <div className="flex-grow">
                <textarea
                  placeholder="Write your thoughts..."
                  className="w-full border-none resize-none focus:outline-none"
                  rows={2}
                />
                <div className="flex gap-2 mt-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-[10px]">Public</button>
                  <button className="bg-gray-300 text-black px-3 py-1 rounded text-[10px]">Private</button>
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-[10px]">Only Connection</button>
                </div>
              </div>
            </div>
            <button className="mt-4 bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded text-sm">
              Share an update
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-3 items-center mb-2 border-b pb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                <img src="#" alt="" className='w-9 h-9 rounded-full'/>
              </div>
              <div>
                <p className="font-semibold">Teman User</p>
                <span className="text-sm text-gray-400">1 months ago</span>
              </div>
            </div>
            <p className='border-b pb-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <div className="mt-2 flex gap-3 text-sm text-blue-500">
              <button className='flex items-center bg-sky-100 px-3 py-1 gap-1 hover:bg-white cursor-pointer'><HeartIcon className='w-4 h-4' /> Like</button>
              <button className='flex items-center bg-sky-100 px-3 py-1 gap-1 hover:bg-white cursor-pointer'><MessageSquare className='w-4 h-4' /> Comment</button>
            </div>
          </div>
        </div>

        {/* KANAN - Suggestions & Promo */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">People you might know</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                <img src="#" alt="" className='w-9 h-9 rounded-full'/>
              </div>
              <div>
                <p className="font-medium">Bintang Asydqi</p>
                <p className="text-sm text-gray-500">Student at Alexander</p>
              </div>
              <button className="ml-auto text-blue-600 text-lg">🔗</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <img
              src="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7"
              alt="promo"
              className="w-full h-24 object-cover rounded mb-3"
            />
            <h3 className="text-yellow-700 font-semibold">EVOConnect Premium</h3>
            <p className="text-sm text-gray-500 mb-3">Grow & nurture your network</p>
            <button className="border border-yellow-700 text-yellow-700 px-4 py-1 rounded hover:bg-yellow-100">
              ACTIVATE
            </button>
          </div>

            <div className="mb-3 rounded border bg-white shadow-sm">
      <div className="border-b p-3">
        <h6 className="m-0 font-medium">Jobs</h6>
      </div>
      <div className="p-3">
        <a href="/job-profile" className="block">
          <div className="mb-3 rounded border bg-white shadow-sm">
            <div className="flex items-center p-3">
              <div className="mr-2 overflow-hidden">
                <h6 className="font-bold text-gray-800 truncate mb-0">Product Director</h6>
                <div className="truncate text-blue-500">Spotify Inc.</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <div className="w-3 h-3 mr-1" /> India, Punjab
                </div>
              </div>
              <img className="w-10 h-10 ml-auto" src="/img/l3.png" alt="" />
            </div>
            <div className="flex items-center border-t border-b p-3">
              <div className="flex -space-x-2">
                <img className="rounded-full w-6 h-6 shadow-sm" src="/img/p9.png" alt="Sophia Lee" title="Sophia Lee" />
                <img className="rounded-full w-6 h-6 shadow-sm" src="/img/p10.png" alt="John Doe" title="John Doe" />
                <img className="rounded-full w-6 h-6 shadow-sm" src="/img/p11.png" alt="Julia Cox" title="Julia Cox" />
                <img className="rounded-full w-6 h-6 shadow-sm" src="/img/p12.png" alt="Robert Cook" title="Robert Cook" />
              </div>
              <span className="font-bold text-gray-500 text-sm ml-2">18 connections</span>
            </div>
            <div className="p-3">
              <small className="text-gray-500 flex items-center">
                <div className="w-3 h-3 mr-1" /> Posted 3 Days ago
              </small>
            </div>
          </div>
        </a>
      </div>
    </div>
          </div>
        </div>
        </div>
  );
};

export default Home;
