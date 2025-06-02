import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react"; 

export default function CreateCompanyStatus() {
   return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <CheckCircle className="text-green-500 w-32 h-32 mb-6" />
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Create Company
      </h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Successfully
      </h2>
      <button
        className="bg-green-500 text-white font-medium py-2 px-6 rounded-lg text-sm shadow-md"
        disabled
      >
        Pending...
      </button>
    </div>
  );
}