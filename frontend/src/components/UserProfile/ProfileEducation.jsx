import { GraduationCap } from "lucide-react";

function formatDate(month, year) {
  if (month === "Month" || year === "Year") return "";
  return `${month} ${year}`;
}

export default function ProfileEducation({ educations, apiUrl }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={20} className="text-[#00AEEF]" />
        <h3 className="text-lg font-semibold">Education</h3>
      </div>
      {educations?.length > 0 ? (
        <div className="mt-6 space-y-8">
          {educations.map((edu) => (
            <div key={edu.id} className="pb-6 border-b last:border-b-0 last:pb-0">
              <div className="flex gap-4">
                {edu.photo ? (
                  <img
                    src={apiUrl + "/" + edu.photo}
                    alt="School logo"
                    className="object-cover w-12 h-12 rounded-md"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-md">
                    <GraduationCap className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{edu.major}</h4>
                  <p className="text-gray-600">{edu.institute_name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(edu.start_month, edu.start_year)} -{" "}
                    {edu.end_month === "Month" || edu.end_year === "Year"
                      ? "Present"
                      : formatDate(edu.end_month, edu.end_year)}
                  </p>
                  {edu.location && (
                    <p className="text-sm text-gray-500">{edu.location}</p>
                  )}
                  {edu.caption && (
                    <p className="mt-2 text-gray-600">{edu.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 mt-4 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
          <GraduationCap size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-base text-gray-500">No education added yet.</p>
        </div>
      )}
    </div>
  );
}         