import React from "react";
import Sidebar from "../../../components/CompanyDashboard/Sidebar/sidebar.jsx";
import Navbar from "../../../components/CompanyDashboard/Navbar/Navbar.jsx";
import HeaderStats from "../../../components/CompanyDashboard/Navbar/HeaderStats.jsx";
import List from "../../../components/CompanyDashboard/ListApplicants/List.jsx";

export default function ListApplicants() {
    return (
        <>
            <Sidebar />
            <div className="relative md:ml-64 bg-blueGray-100">
                <Navbar />
                <HeaderStats />
                <div className="px-4 z-20 relative md:px-10 mx-auto w-full pt-20 -m-44">
                    <div className="flex flex-wrap mt-4">
                        <div className="w-full mb-12 px-4">
                            <List />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}