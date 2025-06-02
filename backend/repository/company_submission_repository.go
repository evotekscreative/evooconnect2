package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CompanySubmissionRepository interface {
	Create(ctx context.Context, tx *sql.Tx, submission domain.CompanySubmission) domain.CompanySubmission
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.CompanySubmission, error)
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.CompanySubmission
	FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.CompanySubmission
	FindByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanySubmissionStatus, limit, offset int) []domain.CompanySubmission
	Update(ctx context.Context, tx *sql.Tx, submission domain.CompanySubmission) domain.CompanySubmission
	CountByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanySubmissionStatus) int
	HasPendingSubmission(ctx context.Context, tx *sql.Tx, userId uuid.UUID) bool
}
