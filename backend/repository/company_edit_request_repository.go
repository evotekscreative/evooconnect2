package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CompanyEditRequestRepository interface {
	Create(ctx context.Context, tx *sql.Tx, editRequest domain.CompanyEditRequest) domain.CompanyEditRequest
	Update(ctx context.Context, tx *sql.Tx, editRequest domain.CompanyEditRequest) domain.CompanyEditRequest
	FindById(ctx context.Context, tx *sql.Tx, editRequestId uuid.UUID) (domain.CompanyEditRequest, error)
	FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) []domain.CompanyEditRequest
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.CompanyEditRequest
	FindByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanyEditRequestStatus, limit, offset int) []domain.CompanyEditRequest
	FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.CompanyEditRequest
	HasPendingEdit(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) bool
	GetStatsByStatus(ctx context.Context, tx *sql.Tx) map[string]int
	Delete(ctx context.Context, tx *sql.Tx, editRequestId uuid.UUID) error
}
