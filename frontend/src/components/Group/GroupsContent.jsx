import { Link } from 'react-router-dom';
import { Trash2, LogOut, Check, X } from "lucide-react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import GroupCard from "./GroupCard";
import InvitationCard from "./InvitationCard";

export default function GroupsContent({
  activeTab,
  adminGroups,
  joinedGroups,
  invitations,
  loadingInvitations,
  handleDeleteGroup,
  handleLeaveGroup,
  handleAcceptInvitation,
  handleRejectInvitation
}) {
  const [showAllAdminGroups, setShowAllAdminGroups] = useState(false);
  const [showAllJoinedGroups, setShowAllJoinedGroups] = useState(false);

  const pendingInvitations = invitations.filter(inv => inv.status === "pending");
  const processedInvitations = invitations.filter(inv => inv.status !== "pending");

  return (
    <>
      {activeTab === 'myGroups' ? (
        <>
          {/* Groups You Created */}
          {adminGroups.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="text-lg font-medium">Groups You Created</h3>
                {adminGroups.length > 3 && (
                  <button
                    onClick={() => setShowAllAdminGroups(!showAllAdminGroups)}
                    className="text-blue-600 text-sm flex items-center"
                  >
                    {showAllAdminGroups ? (
                      <>
                        <ChevronUp size={16} className="mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-1" /> Show All ({adminGroups.length})
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {(showAllAdminGroups ? adminGroups : adminGroups.slice(0, 3)).map((group) => (
                  <GroupCard
                    key={`admin-${group.id}`}
                    group={group}
                    isAdmin={true}
                    onDelete={handleDeleteGroup}
                    onLeave={handleLeaveGroup}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Groups You've Joined */}
          {joinedGroups.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="text-lg font-medium">Groups You've Joined</h3>
                {joinedGroups.length > 3 && (
                  <button
                    onClick={() => setShowAllJoinedGroups(!showAllJoinedGroups)}
                    className="text-blue-600 text-sm flex items-center"
                  >
                    {showAllJoinedGroups ? (
                      <>
                        <ChevronUp size={16} className="mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-1" /> Show All ({joinedGroups.length})
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {(showAllJoinedGroups ? joinedGroups : joinedGroups.slice(0, 3)).map((group) => (
                  <GroupCard
                    key={`joined-${group.id}`}
                    group={group}
                    isAdmin={false}
                    onDelete={handleDeleteGroup}
                    onLeave={handleLeaveGroup}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {adminGroups.length === 0 && joinedGroups.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">You haven't joined any groups yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Create your first group
              </button>
            </div>
          )}
        </>
      ) : (
        activeTab === 'invitations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pending Invitations</h3>

            {loadingInvitations ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingInvitations.length > 0 ? (
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <InvitationCard
                    key={`invite-${invitation.id}`}
                    invitation={invitation}
                    onAccept={handleAcceptInvitation}
                    onReject={handleRejectInvitation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You don't have any pending invitations.</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium">Invitation History</h3>
              <div className="mt-2 space-y-2">
                {processedInvitations.length > 0 ? (
                  processedInvitations.map((invitation) => (
                    <InvitationHistoryItem 
                      key={`history-${invitation.id}`} 
                      invitation={invitation} 
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2">No invitation history yet.</p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}

function InvitationHistoryItem({ invitation }) {
  return (
    <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <img
            className="w-8 h-8 rounded-full"
            src={invitation.group.image || "/default-group.png"}
            alt="Group"
            onError={(e) => {
              e.target.src = "/default-group.png";
            }}
          />
        </div>
        <div>
          <p className="text-sm">
            {invitation.inviter.name}'s invitation to {invitation.group.name}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(invitation.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded ${invitation.status === "accepted"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
          }`}
      >
        {invitation.status === "accepted" ? "Accepted" : "Declined"}
      </span>
    </div>
  );
}