import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/CompanyDashboard/Sidebar/sidebar.jsx";
import AdminNavbar from "../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import TablePost from "../../components/CompanyDashboard/Table/TablePost.jsx";
import Case from "../../components/Case.jsx";

export default function CompanyDashboard() {
    return (
        <>
            <Sidebar />
            <div className="relative md:ml-64 bg-blueGray-100">
                <Case />
                <HeaderStats />
                <div className="px-4 md:px-10 mx-auto w-full pt-20 -m-44">
                    <div className="flex flex-wrap mt-4">
                        <div className="w-full mb-12 px-4">
                            <TablePost />
                        </div>
                    </div >
                </div>
            </div>
        </>
    );
}