import React from "react";
import Navbar from "./Navbar";

export default function Case({ children }) {
    return (
        <>
        <Navbar />
        <section>{children}</section>
        </>
    );
}