export default function ProfileAbout({ about }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-lg">About</h3>
      <p className="text-base text-gray-600 mt-3">
        {about || "No information provided yet."}
      </p>
    </div>
  );
}