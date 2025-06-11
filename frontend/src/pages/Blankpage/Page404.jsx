import React from "react";
import { Typography } from "@material-tailwind/react";
import { FlagIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export function Page404() {
  return (
    <div className="h-screen mx-auto grid place-items-center text-center px-8">
      <div>
        <FlagIcon className="w-20 h-20 mx-auto" />
        <Typography
          variant="h1"
          color="blue-gray"
          className="mt-10 !text-3xl !leading-snug md:!text-4xl"
        >
          Error 404 <br /> Oops! We couldn’t find the page
        </Typography>
        <Typography className="mt-8 mb-14 text-[18px] font-normal text-gray-500 mx-auto md:max-w-sm">
          It might have been removed, renamed, or never existed at all.
        </Typography>
        <Link
          to="/"
          className="inline-block px-7 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all"
        >
          Back
        </Link>
      </div>
    </div>
  );
}

export default Page404;