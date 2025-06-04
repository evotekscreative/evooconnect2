package service

import (
	"context"
	"mime/multipart"

	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type GroupService interface {
	// Group management
	Create(ctx context.Context, userId uuid.UUID, request web.CreateGroupRequest, file *multipart.FileHeader) web.GroupResponse
	Update(ctx context.Context, groupId, userId uuid.UUID, request web.UpdateGroupRequest, file *multipart.FileHeader) web.GroupResponse
	Delete(ctx context.Context, groupId, userId uuid.UUID)
	FindById(ctx context.Context, groupId uuid.UUID) web.GroupResponse
	FindAll(ctx context.Context, limit, offset int) []web.GroupResponse
	FindMyGroups(ctx context.Context, userId uuid.UUID) []web.GroupResponse

	// Member management
	AddMember(ctx context.Context, groupId, userId, newMemberId uuid.UUID) web.GroupMemberResponse
	RemoveMember(ctx context.Context, groupId, userId, memberId uuid.UUID)
	UpdateMemberRole(ctx context.Context, groupId, userId, memberId uuid.UUID, role string) web.GroupMemberResponse
	GetMembers(ctx context.Context, groupId uuid.UUID) []web.GroupMemberResponse
	LeaveGroup(ctx context.Context, groupId, userId uuid.UUID) web.LeaveGroupResponse
	JoinPublicGroup(ctx context.Context, groupId, userId uuid.UUID) web.GroupMemberResponse

	// Invitation management
	CreateInvitation(ctx context.Context, groupId, userId, inviteeId uuid.UUID) web.GroupInvitationResponse
	AcceptInvitation(ctx context.Context, invitationId, userId uuid.UUID) web.GroupMemberResponse
	RejectInvitation(ctx context.Context, invitationId, userId uuid.UUID)
	GetMyInvitations(ctx context.Context, userId uuid.UUID) []web.GroupInvitationResponse
	CancelInvitation(ctx context.Context, invitationId, userId uuid.UUID) web.GroupInvitationResponse
	IsGroupModeratorOrAdmin(ctx context.Context, groupId, userId uuid.UUID) bool
	
	// Join request management
	CreateJoinRequest(ctx context.Context, userId uuid.UUID, groupId uuid.UUID, request web.CreateJoinRequestRequest) web.JoinRequestResponse
	FindJoinRequestsByGroupId(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, limit, offset int) []web.JoinRequestResponse
	AcceptJoinRequest(ctx context.Context, requestId uuid.UUID, userId uuid.UUID) web.JoinRequestResponse
	RejectJoinRequest(ctx context.Context, requestId uuid.UUID, userId uuid.UUID)
	CancelJoinRequest(ctx context.Context, requestId uuid.UUID, userId uuid.UUID)
	RemoveMemberWithBlock(ctx context.Context, groupId, userId, memberId uuid.UUID, block bool, reason string)
}
