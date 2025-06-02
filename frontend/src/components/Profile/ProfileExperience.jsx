import { Briefcase, Pencil } from "lucide-react";

export default function ProfileExperience({
  experiences,
  apiUrl,
  formatDate,
  onEditExperience,
  onAddExperience,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-[#00AEEF]" />
          <h3 className="font-semibold text-lg">Experience</h3>
        </div>
        <button
          className="text-sm bg-[#00AEEF] text-white px-4 py-2 rounded-md hover:bg-[#0099d6] transition flex items-center gap-1"
          onClick={onAddExperience}
        >
          + Add Experience
        </button>
      </div>
      {experiences?.length > 0 ? (
        <div className="mt-6 space-y-8">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="border-b pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex gap-4">
                {exp.photo ? (
                  <img
                    src={apiUrl + "/" + exp.photo}
                    alt="Company logo"
                    className="w-12 h-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                    <Briefcase className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{exp.jobTitle}</h4>
                  <p className="text-gray-600">{exp.companyName}</p>
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{exp.job_title}</h4>
                    <button
                      onClick={() => onEditExperience(exp)}
                      className="text-gray-500 hover:text-[#00AEEF] transition"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  <p className="text-gray-600">{exp.company_name}</p>
                  <p className="text-gray-500 text-sm">
                    {formatDate(exp.start_month, exp.start_year)} -{" "}
                    {exp.end_month === "Month" ||
                    exp.end_year === "Year"
                      ? "Now"
                      : formatDate(exp.end_month, exp.end_year)}
                  </p>
                  {exp.location && (
                    <p className="text-gray-500 text-sm">{exp.location}</p>
                  )}
                  {exp.caption && (
                    <p className="text-gray-600 mt-2">{exp.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
          <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-base text-gray-500">
            No experience added yet.
          </p>
        </div>
      )}
    </div>
  );
}