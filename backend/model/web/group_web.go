package web

import (
	"time"

	"github.com/google/uuid"
)

type CreateGroupRequest struct {
	Name         string `json:"name" validate:"required,min=3,max=100"`
	Description  string `json:"description"`
	Rule         string `json:"rule"`
	Image        string `json:"image"`
	PrivacyLevel string `json:"privacy_level" validate:"required,oneof=public private"`
	InvitePolicy string `json:"invite_policy" validate:"required,oneof=admin all_members"`
	PostApproval bool   `json:"post_approval"` // Tambahkan field ini
}

type UpdateGroupRequest struct {
	Name         string `json:"name" validate:"required,min=3,max=100"`
	Description  string `json:"description"`
	Rule         string `json:"rule"`
	Image        string `json:"image"`
	PrivacyLevel string `json:"privacy_level" validate:"required,oneof=public private"`
	InvitePolicy string `json:"invite_policy" validate:"required,oneof=admin all_members"`
	PostApproval bool   `json:"post_approval"` // Tambahkan field ini
}

type GroupBrief struct {
	Id           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Image        *string   `json:"image"`
	PrivacyLevel string    `json:"privacy_level"`
	MembersCount int       `json:"members_count"`
}

// ## GroupResponse
type GroupResponse struct {
	Id           uuid.UUID          `json:"id"`
	Name         string             `json:"name"`
	Description  string             `json:"description"`
	Rule         string             `json:"rule"`
	Image        *string            `json:"image"`
	PrivacyLevel string             `json:"privacy_level"`
	InvitePolicy string             `json:"invite_policy"`
	PostApproval bool               `json:"post_approval"` // Tambahkan field ini
	CreatorId    uuid.UUID          `json:"creator_id"`
	Creator      UserBriefResponse  `json:"creator,omitempty"`
	Members      []GroupMemberBrief `json:"members,omitempty"`
	MembersCount int                `json:"members_count"`
	IsJoined	bool               `json:"is_joined"`
	JoinedAt     string             `json:"joined_at,omitempty"`
	CreatedAt    time.Time          `json:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at"`
}

type GroupMemberResponse struct {
	GroupId  uuid.UUID         `json:"group_id"`
	UserId   uuid.UUID         `json:"user_id"`
	User     UserBriefResponse `json:"user"`
	Role     string            `json:"role"`
	JoinedAt string            `json:"joined_at"`
	IsActive bool              `json:"is_active"`
}

type GroupMemberBrief struct {
	UserId   uuid.UUID         `json:"user_id"`
	User     UserBriefResponse `json:"user"`
	Role     string            `json:"role"`
	JoinedAt time.Time         `json:"joined_at"`
	IsActive bool              `json:"is_active"`
}

type GroupInvitationResponse struct {
	Id        uuid.UUID          `json:"id"`
	GroupId   uuid.UUID          `json:"group_id"`
	Group     GroupBriefResponse `json:"group"`
	InviterId uuid.UUID          `json:"inviter_id"`
	Inviter   UserBriefResponse  `json:"inviter"`
	InviteeId uuid.UUID          `json:"invitee_id"`
	Invitee   UserBriefResponse  `json:"invitee"`
	Status    string             `json:"status"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
}

type GroupBriefResponse struct {
	Id           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Image        *string   `json:"image"`
	PrivacyLevel string    `json:"privacy_level"`
	MembersCount int       `json:"members_count"`
}

type LeaveGroupResponse struct {
	Message string    `json:"message"`
	GroupId uuid.UUID `json:"group_id"`
	UserId  uuid.UUID `json:"user_id"`
	LeftAt  time.Time `json:"left_at"`
}

type RemoveMemberRequest struct {
	Block  bool   `json:"block"`
	Reason string `json:"reason"`
}
