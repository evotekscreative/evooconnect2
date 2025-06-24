import React from "react";
import Navbar from "./Navbar";

export default function Case({ children, className }) {
    return (
        <>
        <Navbar className={className} />
        <section>{children}</section>
        </>
    );
}