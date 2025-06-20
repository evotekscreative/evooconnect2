import React from "react";
import { createPopper } from "@popperjs/core";

const NotificationDropdown = () => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "left-start",
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <a
        className="text-gray-500 py-1 px-3 cursor-pointer"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <i className="fas fa-ellipsis-v"></i>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-[12rem]"
        }
      >
        <a
          href="#pablo"
          className="text-sm py-2 px-4 block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
          onClick={(e) => e.preventDefault()}
        >
          Action
        </a>
        <a
          href="#pablo"
          className="text-sm py-2 px-4 block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
          onClick={(e) => e.preventDefault()}
        >
          Another action
        </a>
        <a
          href="#pablo"
          className="text-sm py-2 px-4 block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
          onClick={(e) => e.preventDefault()}
        >
          Something else here
        </a>
      </div>
    </>
  );
};

export default NotificationDropdown;
