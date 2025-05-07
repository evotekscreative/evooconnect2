package repository

import (
	"context"
	"database/sql"

	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupMemberRepositoryImpl struct {
}

func NewGroupMemberRepository() GroupMemberRepository {
	return &GroupMemberRepositoryImpl{}
}

func (repository *GroupMemberRepositoryImpl) AddMember(ctx context.Context, tx *sql.Tx, member domain.GroupMember) domain.GroupMember {
	// Use PostgreSQL's ON CONFLICT to handle duplicates
	SQL := `INSERT INTO group_members(group_id, user_id, role, joined_at, is_active) 
            VALUES($1, $2, $3, $4, $5)
            ON CONFLICT (group_id, user_id) DO UPDATE 
            SET role = EXCLUDED.role,
                is_active = EXCLUDED.is_active,
                joined_at = CASE WHEN group_members.is_active = false THEN EXCLUDED.joined_at ELSE group_members.joined_at END`

	_, err := tx.ExecContext(ctx, SQL,
		member.GroupId,
		member.UserId,
		member.Role,
		member.JoinedAt,
		member.IsActive,
	)
	helper.PanicIfError(err)

	return repository.FindByGroupIdAndUserId(ctx, tx, member.GroupId, member.UserId)
}

func (repository *GroupMemberRepositoryImpl) FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupMember {
	SQL := `SELECT group_id, user_id, role, joined_at, is_active FROM group_members WHERE group_id = $1`
	rows, err := tx.QueryContext(ctx, SQL, groupId)
	helper.PanicIfError(err)
	defer rows.Close()

	var members []domain.GroupMember
	for rows.Next() {
		member := domain.GroupMember{}
		err := rows.Scan(
			&member.GroupId,
			&member.UserId,
			&member.Role,
			&member.JoinedAt,
			&member.IsActive,
		)
		helper.PanicIfError(err)
		members = append(members, member)
	}

	return members
}

func (repository *GroupMemberRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.GroupMember {
	SQL := `SELECT group_id, user_id, role, joined_at, is_active FROM group_members WHERE user_id = $1 AND is_active = true`
	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	var members []domain.GroupMember
	for rows.Next() {
		member := domain.GroupMember{}
		err := rows.Scan(
			&member.GroupId,
			&member.UserId,
			&member.Role,
			&member.JoinedAt,
			&member.IsActive,
		)
		helper.PanicIfError(err)
		members = append(members, member)
	}

	return members
}

func (repository *GroupMemberRepositoryImpl) FindByGroupIdAndUserId(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) domain.GroupMember {
	SQL := `SELECT group_id, user_id, role, joined_at, is_active FROM group_members WHERE group_id = $1 AND user_id = $2`
	rows, err := tx.QueryContext(ctx, SQL, groupId, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	member := domain.GroupMember{}
	if rows.Next() {
		err := rows.Scan(
			&member.GroupId,
			&member.UserId,
			&member.Role,
			&member.JoinedAt,
			&member.IsActive,
		)
		helper.PanicIfError(err)
	}

	return member
}

func (repository *GroupMemberRepositoryImpl) IsMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool {
	member := repository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
	return member.GroupId != uuid.Nil && member.IsActive
}

func (repository *GroupMemberRepositoryImpl) RemoveMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) {
	SQL := `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`
	_, err := tx.ExecContext(ctx, SQL, groupId, userId)
	helper.PanicIfError(err)
}

func (repository *GroupMemberRepositoryImpl) UpdateMemberRole(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID, role string) domain.GroupMember {
	SQL := `UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3`
	_, err := tx.ExecContext(ctx, SQL, role, groupId, userId)
	helper.PanicIfError(err)

	return repository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
}

func (repository *GroupMemberRepositoryImpl) UpdateMemberActive(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID, isActive bool) domain.GroupMember {
	SQL := `UPDATE group_members SET is_active = $1 WHERE group_id = $2 AND user_id = $3`
	_, err := tx.ExecContext(ctx, SQL, isActive, groupId, userId)
	helper.PanicIfError(err)

	return repository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
}
