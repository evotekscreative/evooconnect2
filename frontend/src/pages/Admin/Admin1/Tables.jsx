import React from "react";

// components
import CardTable from "../../../components/Admin/Cards/CardTable.jsx";
import AdminNavbar from "../../../components/Admin/Navbars/AdminNavbar.jsx";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar.jsx";
import HeaderStats from "../../../components/Admin/Headers/HeaderStats.jsx";
import FooterAdmin from "../../../components/Admin/Footers/FooterAdmin.jsx";

export default function Tables() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-white min-h-screen">
        <AdminNavbar />
        <HeaderStats />

        <div className="px-4 md:px-10 mx-auto w-full pt-20 -m-44">
          <div className="flex flex-wrap mt-4">
            <div className="w-full mb-12 px-4">
              <CardTable />
            </div>
            <div className="w-full mb-12 px-4">
              <CardTable color="dark" />
            </div>
          </div>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
