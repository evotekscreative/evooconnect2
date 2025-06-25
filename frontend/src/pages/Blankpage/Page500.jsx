import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import img from "../../assets/img/image404.png";

const Page500 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[80px] font-bold text-gray-700 leading-none mb-2">404</h1>
          <p className="text-2xl font-bold text-black mb-2">
            Oops! We couldn’t find the page
          </p>
          <p className="text-base text-gray-600 mb-6">
            It might have been removed, renamed, or never existed at all.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-7 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
          >
            Go Back
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="/images/404-illustration.svg"
            alt="404 illustration"
            className="max-w-xs w-full"
          />
        </div>
      </div>
    </div>
  );
};  

export default Page500;
