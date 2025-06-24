package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CompanyPostRepository interface {
	Create(ctx context.Context, tx *sql.Tx, post domain.CompanyPost) (domain.CompanyPost, error)
	Update(ctx context.Context, tx *sql.Tx, post domain.CompanyPost) (domain.CompanyPost, error)
	Delete(ctx context.Context, tx *sql.Tx, postId uuid.UUID) error
	FindById(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.CompanyPost, error)
	FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) ([]domain.CompanyPost, int, error)
	FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) ([]domain.CompanyPost, int, error)
	FindWithFilters(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID, visibility string, creatorId *uuid.UUID, search string, limit, offset int) ([]domain.CompanyPost, int, error)
	CountByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) (int, error)
	GetCommentsCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error)

	// Like functionality - following same pattern as PostRepository
	LikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error
	UnlikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error
	IsLiked(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) bool
	GetLikesCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) int
}
