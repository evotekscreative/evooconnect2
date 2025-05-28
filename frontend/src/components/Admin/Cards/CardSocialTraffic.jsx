import React from "react";

export default function CardSocialTraffic() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-base">
              Social traffic
            </h3>
          </div>
          <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
            <button
              className="bg-primary text-white active:bg-blue-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
            >
              See all
            </button>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th className="px-6 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Referral
              </th>
              <th className="px-6 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Visitors
              </th>
              <th className="px-6 bg-gray-100 text-gray-500 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left min-w-[140px]"></th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Facebook", visitors: "1,480", percent: 60, color: "bg-red-500", bg: "bg-red-200" },
              { name: "Facebook", visitors: "5,480", percent: 70, color: "bg-emerald-500", bg: "bg-emerald-200" },
              { name: "Google", visitors: "4,807", percent: 80, color: "bg-purple-500", bg: "bg-purple-200" },
              { name: "Instagram", visitors: "3,678", percent: 75, color: "bg-sky-500", bg: "bg-sky-200" },
              { name: "Twitter", visitors: "2,645", percent: 30, color: "bg-emerald-500", bg: "bg-orange-200" },
            ].map((row, index) => (
              <tr key={index}>
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  {row.name}
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  {row.visitors}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex items-center">
                    <span className="mr-2">{row.percent}%</span>
                    <div className="relative w-full">
                      <div className={`overflow-hidden h-2 text-xs flex rounded ${row.bg}`}>
                        <div
                          style={{ width: `${row.percent}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${row.color}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
