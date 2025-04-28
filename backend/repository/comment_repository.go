package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CommentRepository interface {
	Save(ctx context.Context, tx *sql.Tx, comment domain.Comment) domain.Comment
	FindById(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) (domain.Comment, error)
	FindByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID, parentIdFilter *uuid.UUID, limit, offset int) ([]domain.Comment, error)
	CountByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error)
	Update(ctx context.Context, tx *sql.Tx, comment domain.Comment) (domain.Comment, error)
	Delete(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) error
	FindRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) []domain.Comment
	FindRepliesByParentIdSafe(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) ([]domain.Comment, error)
	CountRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) (int, error)
}
