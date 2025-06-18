package repository

import (
    "context"
    "database/sql"
    "evoconnect/backend/model/domain"
    "github.com/google/uuid"
)

type PendingPostRepository interface {
    Save(ctx context.Context, tx *sql.Tx, pendingPost domain.PendingPost) domain.PendingPost
    FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.PendingPost, error)
    FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, limit, offset int) []domain.PendingPost
    UpdateStatus(ctx context.Context, tx *sql.Tx, id uuid.UUID, status string) domain.PendingPost
    Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID)
}
