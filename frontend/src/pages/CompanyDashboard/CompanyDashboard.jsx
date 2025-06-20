import React from "react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar";
import AdminNavbar from "../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import Case from "../../components/Case.jsx";

export default function CompanyDashboard() {
    return (
        <>
            <Sidebar />
            <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
                <AdminNavbar />
                <HeaderStats />
                <Case />
                {/* Konten dashboard lain */}
            </div>
        </>
    );
}