package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupJoinRequestRepository interface {
	Save(ctx context.Context, tx *sql.Tx, request domain.GroupJoinRequest) domain.GroupJoinRequest
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.GroupJoinRequest, error)
	FindByGroupIdAndUserId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, userId uuid.UUID) (domain.GroupJoinRequest, error)
	FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, limit, offset int) []domain.GroupJoinRequest
	UpdateStatus(ctx context.Context, tx *sql.Tx, id uuid.UUID, status string) domain.GroupJoinRequest
	Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID)
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) []domain.GroupJoinRequest
}