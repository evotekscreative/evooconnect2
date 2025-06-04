package repository

import (
	"context"
	"database/sql"

	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupBlockedMemberRepository interface {
	Save(ctx context.Context, tx *sql.Tx, blockedMember domain.GroupBlockedMember) domain.GroupBlockedMember
	IsBlocked(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool
	RemoveFromBlocklist(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID)
}