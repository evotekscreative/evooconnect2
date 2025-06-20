package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type CompanyFollowerRepository interface {
	// Core operations
	Follow(ctx context.Context, tx *sql.Tx, follower domain.CompanyFollower) domain.CompanyFollower
	Unfollow(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) error

	// Query operations
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.CompanyFollower, error)
	FindByUserIdAndCompanyId(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) (domain.CompanyFollower, error)
	FindFollowersByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) ([]domain.CompanyFollower, int, error)
	FindFollowingByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.CompanyFollower, int, error)

	// Check operations
	IsFollowing(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) bool

	// Count operations
	CountFollowersByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) int
	CountFollowingByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) int

	// Batch operations
	GetFollowStatusForCompanies(ctx context.Context, tx *sql.Tx, userId uuid.UUID, companyIds []uuid.UUID) map[uuid.UUID]bool
}
