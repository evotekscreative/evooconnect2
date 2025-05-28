import React from "react";

// components
import CardSettings from "../../../components/Admin/Cards/CardSettings.jsx";
import CardProfile from "../../../components/Admin/Cards/CardProfile.jsx";
import AdminNavbar from "../../../components/Admin/Navbars/AdminNavbar.jsx";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar.jsx";
import HeaderStats from "../../../components/Admin/Headers/HeaderStats.jsx";
import FooterAdmin from "../../../components/Admin/Footers/FooterAdmin.jsx";

export default function Settings() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        <HeaderStats />

        <div className="px-4 md:px-10 mx-auto w-full -m-44">
          <div className="flex flex-wrap mt-24">
            <div className="w-full lg:w-8/12 px-4">
              <CardSettings />
            </div>
            <div className="w-full lg:w-4/12 px-4">
              <CardProfile />
            </div>
          </div>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
