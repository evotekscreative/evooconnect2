import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X
} from "lucide-react";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-white" />,
  error: <XCircle className="w-5 h-5 text-white" />,
  info: <Info className="w-5 h-5 text-white" />,
  warning: <AlertTriangle className="w-5 h-5 text-white" />,
};

const bgColors = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-yellow-500",
};

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Tambahkan pengecekan untuk onClose
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
      <div
        className={`flex items-center gap-4 shadow-xl rounded-lg px-5 py-3 text-white ${bgColors[type]} min-w-[250px]`}
      >
        <div>{icons[type]}</div>
        <div className="flex-1 font-medium">{message}</div>
        <button 
          onClick={() => {
            // Tambahkan pengecekan untuk onClose saat tombol diklik
            if (typeof onClose === 'function') {
              onClose();
            }
          }} 
          className="hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Message = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false); 

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const closeToast = () => {
    setShowToast(false);
  };

  return (
    <div>
      <button onClick={() => showToastMessage("Berhasil membuat blog!", "success")}>
        Show Success Toast
      </button>
      <button onClick={() => showToastMessage("Terjadi kesalahan!", "error")}>
        Show Error Toast
      </button>

      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={closeToast} />
      )}
    </div>
  );
};

export default Toast;
