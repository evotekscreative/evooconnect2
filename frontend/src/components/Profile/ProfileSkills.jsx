export default function ProfileSkills({ skills }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="font-semibold text-lg">Skills</h3>
      {skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-4 py-1 rounded-full border border-blue-200 text-blue-600 text-sm font-medium bg-white shadow-md"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-base text-gray-500 mt-1">
          No skills added yet
        </p>
      )}
    </div>
  );
}