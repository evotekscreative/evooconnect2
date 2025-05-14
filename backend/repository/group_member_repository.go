package repository

import (
	"context"
	"database/sql"

	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupMemberRepository interface {
	AddMember(ctx context.Context, tx *sql.Tx, member domain.GroupMember) domain.GroupMember
	FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupMember
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.GroupMember
	FindByGroupIdAndUserId(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) domain.GroupMember
	IsMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool
	RemoveMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID)
	UpdateMemberRole(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID, role string) domain.GroupMember
	UpdateMemberActive(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID, isActive bool) domain.GroupMember
}
