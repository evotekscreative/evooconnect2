import CompanySubmissions from '../../../components/Admin/Cards/CompanySubmissions.jsx';
// import Case from "../../../components/Case.jsx";
import AdminNavbar from "../../../components/Admin/Navbars/AdminNavbar.jsx";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar.jsx";
import HeaderStats from "../../../components/Admin/Headers/HeaderStats.jsx";
import FooterAdmin from "../../../components/Admin/Footers/FooterAdmin.jsx";

export default function ListCompany() {
    return (
        <>
            {/* <Case> */}
                <Sidebar />
                <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
                    <AdminNavbar />
                    <HeaderStats />
                    <div className="px-4 md:px-10 mx-auto w-full -m-24">
                        <CompanySubmissions />
                        <FooterAdmin />
                    </div>
                </div>
            {/* </Case> */}
        </>
    );
}
