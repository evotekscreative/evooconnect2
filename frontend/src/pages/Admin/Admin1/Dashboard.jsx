import React from "react";

// components
import CardLineChart from "../../../components/Admin/Cards/CardLineChart.jsx";
import CardBarChart from "../../../components/Admin/Cards/CardBarChart.jsx";
import CardPageVisits from "../../../components/Admin/Cards/CardPageVisits.jsx";
import CardSocialTraffic from "../../../components/Admin/Cards/CardSocialTraffic.jsx";
import AdminNavbar from "../../../components/Admin/Navbars/AdminNavbar.jsx";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar.jsx";
import HeaderStats from "../../../components/Admin/Headers/HeaderStats.jsx";
import FooterAdmin from "../../../components/Admin/Footers/FooterAdmin.jsx";

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
        <AdminNavbar />
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          {/* Section 1: Charts */}
          <div className="flex flex-wrap">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
              <CardLineChart />
            </div>
            <div className="w-full xl:w-4/12 px-4">
              <CardBarChart />
            </div>
          </div>

          {/* Section 2: Visits and Traffic */}
          <div className="flex flex-wrap mt-4">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
              <CardPageVisits />
            </div>
            <div className="w-full xl:w-4/12 px-4">
              <CardSocialTraffic />
            </div>
          </div>

          {/* Footer */}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
