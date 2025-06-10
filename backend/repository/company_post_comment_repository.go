package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CompanyPostCommentRepository interface {
	// CRUD Operations
	Create(ctx context.Context, tx *sql.Tx, comment domain.CompanyPostComment) (domain.CompanyPostComment, error)
	FindById(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) (domain.CompanyPostComment, error)
	Update(ctx context.Context, tx *sql.Tx, comment domain.CompanyPostComment) (domain.CompanyPostComment, error)
	Delete(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) error

	// Query Operations
	FindMainCommentsByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID, limit, offset int) ([]domain.CompanyPostComment, int, error)
	FindRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID, limit, offset int) ([]domain.CompanyPostComment, int, error)

	// Count Operations
	CountMainCommentsByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error)
	CountRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) (int, error)
}
