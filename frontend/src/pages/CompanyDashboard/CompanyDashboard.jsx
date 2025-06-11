import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar.jsx";
import AdminNavbar from "../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";

export default function CompanyDashboard() {
    return (
        <>
            <Sidebar />
            <div className="relative md:ml-64 bg-blueGray-100">
                    <AdminNavbar />
                    <HeaderStats />
                  </div>
        </>
    );
}