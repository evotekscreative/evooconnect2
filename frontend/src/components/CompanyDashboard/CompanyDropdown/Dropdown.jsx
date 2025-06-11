import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, User, Settings, LogOut, SquareArrowOutUpRight } from "lucide-react";

const CompanyDropdown = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                type="button"
                className="flex items-center justify-between bg-white px-4 py-3 rounded-lg space-x-3 shadow-md hover:shadow-lg transition-shadow duration-200 w-56 border border-gray-200"
            >
                <div className="flex items-center space-x-2 truncate">
                    <img
                        src="/b55b507a-32a1-4ec9-a56e-bcb704e59eb5.png"
                        alt="Company"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-gray-800 font-medium truncate">Company 1</span>
                </div>
                <div className="flex items-center gap-1">

                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "transform rotate-180" : ""}`}
                    />
                    <SquareArrowOutUpRight className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                </div>
            </button>

            {open && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-[1000]">
                    <ul className="py-1">
                        <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2">
                            <div className="flex items-center space-x-2 truncate">
                                <img
                                    src="/b55b507a-32a1-4ec9-a56e-bcb704e59eb5.png"
                                    alt="Company"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-gray-800 font-medium truncate normal-case">Company 2</span>
                            </div>
                        </li>
                        <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2">
                            <div className="flex items-center space-x-2 truncate">
                                <img
                                    src="/b55b507a-32a1-4ec9-a56e-bcb704e59eb5.png"
                                    alt="Company"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-gray-800 font-medium truncate normal-case">Company 3</span>
                            </div>
                        </li>
                        <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2">
                            <div className="flex items-center space-x-2 truncate">
                                <img
                                    src="/b55b507a-32a1-4ec9-a56e-bcb704e59eb5.png"
                                    alt="Company"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-gray-800 font-medium truncate normal-case">Company 4</span>
                            </div>
                        </li>
                    </ul>
                    <div className="border-t border-gray-200 px-3 py-2">
                        <button className="w-full text-sm text-primary font-medium hover:underline text-left">
                            + Create Company
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDropdown;