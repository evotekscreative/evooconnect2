export default function ProfileSkills({ skills }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="font-semibold text-lg">Skills</h3>
      {skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
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