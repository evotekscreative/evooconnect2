import { GraduationCap, Pencil } from "lucide-react";

export default function ProfileEducation({
  educations,
  apiUrl,
  formatDate,
  onAdd,
  onEdit,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap size={20} className="text-[#00AEEF]" />
          <h3 className="font-semibold text-lg">Education</h3>
        </div>
        <button
          className="text-sm bg-[#00AEEF] text-white px-4 py-2 rounded-md hover:bg-[#0099d6] transition flex items-center gap-1"
          onClick={onAdd}
        >
          + Add Education
        </button>
      </div>
      {educations?.length > 0 ? (
        <div className="mt-6 space-y-8">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="border-b pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex gap-4">
                {edu.photo ? (
                  <img
                    src={apiUrl + "/" + edu.photo}
                    alt="School logo"
                    className="w-12 h-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                    <GraduationCap className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{edu.major}</h4>
                    <button
                      onClick={() => onEdit(edu)}
                      className="text-gray-500 hover:text-[#00AEEF] transition"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  <p className="text-gray-600">{edu.institute_name}</p>
                  <p className="text-gray-500 text-sm">
                    {formatDate(edu.start_month, edu.start_year)} -{" "}
                    {edu.end_month === "Month" ||
                    edu.end_year === "Year"
                      ? "Present"
                      : formatDate(edu.end_month, edu.end_year)}
                  </p>
                  {edu.location && (
                    <p className="text-gray-500 text-sm">
                      {edu.location}
                    </p>
                  )}
                  {edu.caption && (
                    <p className="text-gray-600 mt-2">{edu.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300 mt-4">
          <GraduationCap
            size={40}
            className="mx-auto text-gray-300 mb-3"
          />
          <p className="text-base text-gray-500">
            No education added yet.
          </p>
        </div>
      )}
    </div>
  );
}