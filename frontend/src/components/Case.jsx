import React from "react";
import Navbar from "./navbar";

export default function Case({ children }) {
    return (
        <>
        <Navbar />
        <section>{children}</section>
        </>
    );
}