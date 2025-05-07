package service

import (
	"context"
	"mime/multipart"

	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type GroupService interface {
	// Group management
	Create(ctx context.Context, userId uuid.UUID, request web.CreateGroupRequest) web.GroupResponse
	Update(ctx context.Context, groupId, userId uuid.UUID, request web.UpdateGroupRequest) web.GroupResponse
	Delete(ctx context.Context, groupId, userId uuid.UUID)
	FindById(ctx context.Context, groupId uuid.UUID) web.GroupResponse
	FindAll(ctx context.Context, limit, offset int) []web.GroupResponse
	FindMyGroups(ctx context.Context, userId uuid.UUID) []web.GroupResponse
	UploadPhoto(ctx context.Context, groupId, userId uuid.UUID, file multipart.File, fileHeader *multipart.FileHeader) string

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
}
