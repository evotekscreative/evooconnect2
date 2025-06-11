export default function ProfileAbout({ user }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">About</h3>
      <p className="mt-3 text-base text-gray-600">
        {user.about || "No information provided yet."}
      </p>
    </div>
  );
}