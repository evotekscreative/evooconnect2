package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CommentBlogRepository interface {
	Save(ctx context.Context, tx *sql.Tx, comment domain.CommentBlog) domain.CommentBlog
	FindById(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) (domain.CommentBlog, error)
	FindByBlogId(ctx context.Context, tx *sql.Tx, blogId uuid.UUID, parentIdFilter *uuid.UUID, limit, offset int) ([]domain.CommentBlog, error)
	CountByBlogId(ctx context.Context, tx *sql.Tx, blogId uuid.UUID) (int, error)
	Update(ctx context.Context, tx *sql.Tx, comment domain.CommentBlog) (domain.CommentBlog, error)
	Delete(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) error
	FindRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) []domain.CommentBlog
	FindRepliesByParentIdSafe(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) ([]domain.CommentBlog, error)
	CountRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) (int, error)
}