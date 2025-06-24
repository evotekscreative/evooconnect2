import React from "react";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar";
import AdminNavbar from "../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import Case from "../../components/Case";
import Navbar from "../../components/Navbar.jsx";

export default function ManagePost() {
    return (
        <>
    
            
            <div className="relative md:ml-64 bg-blueGray-100">
                <Case/>
                <Sidebar />
                <HeaderStats />
            </div>
        </>
    );
}