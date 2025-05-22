import { Check, X } from "lucide-react";

export default function InvitationCard({ invitation, onAccept, onReject }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            className="w-10 h-10 rounded-full"
            src={invitation.group.image || "/default-group.png"}
            alt="Group"
            onError={(e) => {
              e.target.src = "/default-group.png";
            }}
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{invitation.group.name}</div>
          <p className="text-sm text-gray-600">
            Invited by <span className="font-medium">{invitation.inviter.name}</span>
          </p>
          <div className="mt-1 text-xs text-gray-500">
            {invitation.group.members_count} members
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {invitation.group.description}
          </p>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-3">
        <button
          onClick={() => onReject(invitation.id)}
          className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
        >
          <X size={16} className="mr-1" /> Decline
        </button>
        <button
          onClick={() => onAccept(invitation.id)}
          className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          <Check size={16} className="mr-1" /> Accept
        </button>
      </div>
    </div>
  );
}