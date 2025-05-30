import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// components
import Navbar from "../../../components/Admin/Navbars/AuthNavbar.jsx";
import FooterSmall from "../../../components/Admin/Footers/FooterSmall.jsx";

// views
import Login from "../../../pages/Admin/AuthAdmin/Login.jsx";

// import gambar sebagai ESModule
import registerBg from "../../../assets/img/imgAdminregister_bg_2.png";

export default function Auth() {
  return (
    <>
      <Navbar transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-slate-800 bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${registerBg})`,
            }}
          ></div>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          </Routes>
          <FooterSmall absolute />
        </section>
      </main>
    </>
  );
}
