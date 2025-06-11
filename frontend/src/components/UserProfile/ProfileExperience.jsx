import { Briefcase } from "lucide-react";

function formatDate(month, year) {
  if (month === "Month" || year === "Year") return "";
  return `${month} ${year}`;
}

export default function ProfileExperience({ experiences, apiUrl }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase size={20} className="text-[#00AEEF]" />
        <h3 className="text-lg font-semibold">Experience</h3>
      </div>
      {experiences?.length > 0 ? (
        <div className="mt-6 space-y-8">
          {experiences.map((exp) => (
            <div key={exp.id} className="pb-6 border-b last:border-b-0 last:pb-0">
              <div className="flex gap-4">
                {exp.photo ? (
                  <img
                    src={apiUrl + "/" + exp.photo}
                    alt="Company logo"
                    className="object-cover w-12 h-12 rounded-md"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-md">
                    <Briefcase className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{exp.job_title || exp.jobTitle}</h4>
                  <p className="text-gray-600">{exp.company_name || exp.companyName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(exp.start_month, exp.start_year)} -{" "}
                    {exp.end_month === "Month" || exp.end_year === "Year"
                      ? "Present"
                      : formatDate(exp.end_month, exp.end_year)}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-500">{exp.location}</p>
                  )}
                  {exp.caption && (
                    <p className="mt-2 text-gray-600">{exp.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 mt-4 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
          <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-base text-gray-500">No experience added yet.</p>
        </div>
      )}
    </div>
  );
}