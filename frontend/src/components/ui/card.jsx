import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardHeader = ({ children, className = "" }) => {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = "" }) => {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
};

export const CardDescription = ({ children, className = "" }) => {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
};
