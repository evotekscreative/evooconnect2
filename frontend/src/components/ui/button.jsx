import React from "react";

export const Button = ({ children, variant = "default", className = "", ...props }) => {
  const base = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
