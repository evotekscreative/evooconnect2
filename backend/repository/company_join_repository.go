package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type CompanyJoinRequestRepository interface {
	Create(ctx context.Context, tx *sql.Tx, request domain.CompanyJoinRequest) domain.CompanyJoinRequest
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.CompanyJoinRequest, error)
	FindByUserIdAndCompanyId(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) (domain.CompanyJoinRequest, error)
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) []domain.CompanyJoinRequest
	FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status string, limit, offset int) []domain.CompanyJoinRequest
	Update(ctx context.Context, tx *sql.Tx, request domain.CompanyJoinRequest) domain.CompanyJoinRequest
	Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID)
	CountPendingByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) int
	IsPendingJoinRequest(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) bool
}
