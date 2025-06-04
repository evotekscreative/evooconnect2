package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"github.com/google/uuid"
	"time"
	"errors"
)

type GroupJoinRequestRepositoryImpl struct {
}

func NewGroupJoinRequestRepository() GroupJoinRequestRepository {
	return &GroupJoinRequestRepositoryImpl{}
}

func (repository *GroupJoinRequestRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, request domain.GroupJoinRequest) domain.GroupJoinRequest {
    SQL := `INSERT INTO group_join_requests(id, group_id, user_id, status, message, created_at, updated_at)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`

    result, err := tx.ExecContext(ctx, SQL,
        request.Id,
        request.GroupId,
        request.UserId,
        request.Status,
        request.Message,
        request.CreatedAt,
        request.UpdatedAt,
    )
    
    if err != nil {
        // Log error untuk debugging
        fmt.Printf("ERROR: Failed to save join request: %v\n", err)
        helper.PanicIfError(err)
    }
    
    // Verifikasi bahwa data berhasil disimpan
    rowsAffected, err := result.RowsAffected()
    if err != nil || rowsAffected == 0 {
        fmt.Printf("ERROR: No rows affected when saving join request: %v\n", err)
        helper.PanicIfError(errors.New("failed to save join request"))
    }

    return request
}

func (repository *GroupJoinRequestRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.GroupJoinRequest, error) {
	SQL := `SELECT id, group_id, user_id, status, message, created_at, updated_at
			FROM group_join_requests
			WHERE id = $1`

	var request domain.GroupJoinRequest
	err := tx.QueryRowContext(ctx, SQL, id).Scan(
		&request.Id,
		&request.GroupId,
		&request.UserId,
		&request.Status,
		&request.Message,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
	if err != nil {
		return domain.GroupJoinRequest{}, err
	}

	return request, nil
}

func (repository *GroupJoinRequestRepositoryImpl) FindByGroupIdAndUserId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, userId uuid.UUID) (domain.GroupJoinRequest, error) {
	SQL := `SELECT id, group_id, user_id, status, message, created_at, updated_at
			FROM group_join_requests
			WHERE group_id = $1 AND user_id = $2`

	var request domain.GroupJoinRequest
	err := tx.QueryRowContext(ctx, SQL, groupId, userId).Scan(
		&request.Id,
		&request.GroupId,
		&request.UserId,
		&request.Status,
		&request.Message,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
	if err != nil {
		return domain.GroupJoinRequest{}, err
	}

	return request, nil
}

func (repository *GroupJoinRequestRepositoryImpl) FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, limit, offset int) []domain.GroupJoinRequest {
	SQL := `SELECT id, group_id, user_id, status, message, created_at, updated_at
			FROM group_join_requests
			WHERE group_id = $1 AND status = 'pending'
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, groupId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var requests []domain.GroupJoinRequest
	for rows.Next() {
		var request domain.GroupJoinRequest
		err := rows.Scan(
			&request.Id,
			&request.GroupId,
			&request.UserId,
			&request.Status,
			&request.Message,
			&request.CreatedAt,
			&request.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("ERROR: Failed to scan join request: %v\n", err)
			continue
		}
		requests = append(requests, request)
	}

	return requests
}

func (repository *GroupJoinRequestRepositoryImpl) UpdateStatus(ctx context.Context, tx *sql.Tx, id uuid.UUID, status string) domain.GroupJoinRequest {
	SQL := `UPDATE group_join_requests
			SET status = $1, updated_at = $2
			WHERE id = $3
			RETURNING id, group_id, user_id, status, message, created_at, updated_at`

	now := time.Now()
	var request domain.GroupJoinRequest
	err := tx.QueryRowContext(ctx, SQL, status, now, id).Scan(
		&request.Id,
		&request.GroupId,
		&request.UserId,
		&request.Status,
		&request.Message,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
	helper.PanicIfError(err)

	return request
}

func (repository *GroupJoinRequestRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID) {
    SQL := `DELETE FROM group_join_requests WHERE id = $1`
    
    result, err := tx.ExecContext(ctx, SQL, id)
    if err != nil {
        fmt.Printf("ERROR: Failed to delete join request: %v\n", err)
        helper.PanicIfError(err)
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil || rowsAffected == 0 {
        fmt.Printf("WARNING: No rows affected when deleting join request: %v\n", err)
        // Tidak perlu panic di sini, karena mungkin request sudah dihapus
    }
}

