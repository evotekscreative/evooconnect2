package repository

import (
	"context"
	"database/sql"

	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupInvitationRepositoryImpl struct {
}

func NewGroupInvitationRepository() GroupInvitationRepository {
	return &GroupInvitationRepositoryImpl{}
}

func (repository *GroupInvitationRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, invitation domain.GroupInvitation) domain.GroupInvitation {
	SQL := `INSERT INTO group_invitations(id, group_id, inviter_id, invitee_id, status, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6, $7)`
	_, err := tx.ExecContext(ctx, SQL,
		invitation.Id,
		invitation.GroupId,
		invitation.InviterId,
		invitation.InviteeId,
		invitation.Status,
		invitation.CreatedAt,
		invitation.UpdatedAt,
	)
	helper.PanicIfError(err)

	return invitation
}

func (repository *GroupInvitationRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, invitation domain.GroupInvitation) domain.GroupInvitation {
	SQL := `UPDATE group_invitations SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := tx.ExecContext(ctx, SQL,
		invitation.Status,
		invitation.UpdatedAt,
		invitation.Id,
	)
	helper.PanicIfError(err)

	return invitation
}

func (repository *GroupInvitationRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID) domain.GroupInvitation {
	SQL := `SELECT id, group_id, inviter_id, invitee_id, status, created_at, updated_at 
            FROM group_invitations WHERE id = $1`
	rows, err := tx.QueryContext(ctx, SQL, invitationId)
	helper.PanicIfError(err)
	defer rows.Close()

	invitation := domain.GroupInvitation{}
	if rows.Next() {
		err := rows.Scan(
			&invitation.Id,
			&invitation.GroupId,
			&invitation.InviterId,
			&invitation.InviteeId,
			&invitation.Status,
			&invitation.CreatedAt,
			&invitation.UpdatedAt,
		)
		helper.PanicIfError(err)
	}

	return invitation
}

func (repository *GroupInvitationRepositoryImpl) FindByInviteeId(ctx context.Context, tx *sql.Tx, inviteeId uuid.UUID) []domain.GroupInvitation {
	SQL := `SELECT id, group_id, inviter_id, invitee_id, status, created_at, updated_at 
            FROM group_invitations WHERE invitee_id = $1`
	rows, err := tx.QueryContext(ctx, SQL, inviteeId)
	helper.PanicIfError(err)
	defer rows.Close()

	var invitations []domain.GroupInvitation
	for rows.Next() {
		invitation := domain.GroupInvitation{}
		err := rows.Scan(
			&invitation.Id,
			&invitation.GroupId,
			&invitation.InviterId,
			&invitation.InviteeId,
			&invitation.Status,
			&invitation.CreatedAt,
			&invitation.UpdatedAt,
		)
		helper.PanicIfError(err)
		invitations = append(invitations, invitation)
	}

	return invitations
}

func (repository *GroupInvitationRepositoryImpl) FindByGroupIdAndInviteeId(ctx context.Context, tx *sql.Tx, groupId, inviteeId uuid.UUID) domain.GroupInvitation {
	SQL := `SELECT id, group_id, inviter_id, invitee_id, status, created_at, updated_at 
            FROM group_invitations WHERE group_id = $1 AND invitee_id = $2`
	rows, err := tx.QueryContext(ctx, SQL, groupId, inviteeId)
	helper.PanicIfError(err)
	defer rows.Close()

	invitation := domain.GroupInvitation{}
	if rows.Next() {
		err := rows.Scan(
			&invitation.Id,
			&invitation.GroupId,
			&invitation.InviterId,
			&invitation.InviteeId,
			&invitation.Status,
			&invitation.CreatedAt,
			&invitation.UpdatedAt,
		)
		helper.PanicIfError(err)
	}

	return invitation
}

func (repository *GroupInvitationRepositoryImpl) CancelRequest(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID) error {
	SQL := `DELETE FROM group_invitations WHERE id = $1`
	_, err := tx.ExecContext(ctx, SQL, invitationId)
	if err != nil {
		return err
	}
	return nil
}

func (repository *GroupInvitationRepositoryImpl) CountPendingInvitationsByInviteeId(ctx context.Context, tx *sql.Tx, inviteeId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM group_invitations WHERE invitee_id = $1 AND status = 'pending'`
	
	var count int
	err := tx.QueryRowContext(ctx, SQL, inviteeId).Scan(&count)
	if err != nil {
		return 0, err
	}
	
	return count, nil
}


