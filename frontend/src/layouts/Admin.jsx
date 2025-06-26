import React from "react";
import AdminNavbar from "../components/Admin/Navbars/AdminNavbar.jsx";
import Sidebar from "../components/Admin/Sidebar/Sidebar.jsx";
import HeaderStats from "../components/Admin/Headers/HeaderStats.jsx";
import FooterAdmin from "../components/Admin/Footers/FooterAdmin.jsx";
import Case from "../components/Case.jsx";

export default function AdminLayout({ children }) {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Case />
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
