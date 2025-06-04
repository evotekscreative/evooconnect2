package repository

import (
    "context"
    "database/sql"
    "evoconnect/backend/model/domain"
    "github.com/google/uuid"
)

type GroupPinnedPostRepository interface {
    Save(ctx context.Context, tx *sql.Tx, pinnedPost domain.GroupPinnedPost) domain.GroupPinnedPost
    FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupPinnedPost
    FindByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.GroupPinnedPost, error)
    Delete(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, postId uuid.UUID) error
    CountByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) (int, error)
}