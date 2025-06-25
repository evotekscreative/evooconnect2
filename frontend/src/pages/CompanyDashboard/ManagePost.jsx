import React, { useState, useEffect } from "react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/Sidebar";
import AdminNavbar from "../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import TablePost from "../../components/CompanyDashboard/Table/TablePost.jsx";
import Case from "../../components/Case.jsx";
import { useParams } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function ManagePost() {
  const { company_id } = useParams();

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Case />
        <HeaderStats />
        <div className="w-full px-4 pt-20 mx-auto -m-32 md:px-10">
          <div className="flex flex-wrap mt-4">
            <div className="w-full px-4 mb-12">
              <TablePost companyId={company_id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
