package repository

import (
	"context"
	"database/sql"

	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupRepository interface {
	Create(ctx context.Context, tx *sql.Tx, group domain.Group) domain.Group
	Update(ctx context.Context, tx *sql.Tx, group domain.Group) domain.Group
	Delete(ctx context.Context, tx *sql.Tx, groupId uuid.UUID)
	FindById(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) (domain.Group, error)
	FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.Group
	FindByCreator(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID) []domain.Group

	// Member management
	AddMember(ctx context.Context, tx *sql.Tx, member domain.GroupMember) domain.GroupMember
	RemoveMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID)
	UpdateMemberRole(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID, role string) domain.GroupMember
	FindMembers(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupMember
	IsMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool

	// Invitation management
	CreateInvitation(ctx context.Context, tx *sql.Tx, invitation domain.GroupInvitation) domain.GroupInvitation
	UpdateInvitationStatus(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID, status string) domain.GroupInvitation
	FindInvitationById(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID) (domain.GroupInvitation, error)
	FindInvitationsByUser(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.GroupInvitation
	FindInvitationsByGroup(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupInvitation
	Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.Group
    CountMembers(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) int
}
