package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupBlockedMemberRepositoryImpl struct {
}

func NewGroupBlockedMemberRepository() GroupBlockedMemberRepository {
	return &GroupBlockedMemberRepositoryImpl{}
}

func (repository *GroupBlockedMemberRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, blockedMember domain.GroupBlockedMember) domain.GroupBlockedMember {
	SQL := `INSERT INTO group_blocked_members(id, group_id, user_id, reason, blocked_by, blocked_at, visibility, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := tx.ExecContext(ctx, SQL,
		blockedMember.Id,
		blockedMember.GroupId,
		blockedMember.UserId,
		blockedMember.Reason,
		blockedMember.BlockedBy,
		blockedMember.BlockedAt,
		blockedMember.Visibility,
		blockedMember.CreatedAt,
		blockedMember.UpdatedAt,
	)
	helper.PanicIfError(err)

	return blockedMember
}

func (repository *GroupBlockedMemberRepositoryImpl) IsBlocked(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool {
	SQL := `SELECT COUNT(*) FROM group_blocked_members WHERE group_id = $1 AND user_id = $2`
	
	var count int
	err := tx.QueryRowContext(ctx, SQL, groupId, userId).Scan(&count)
	helper.PanicIfError(err)
	
	return count > 0
}

func (repository *GroupBlockedMemberRepositoryImpl) RemoveFromBlocklist(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) {
	SQL := `DELETE FROM group_blocked_members WHERE group_id = $1 AND user_id = $2`
	
	_, err := tx.ExecContext(ctx, SQL, groupId, userId)
	helper.PanicIfError(err)
}