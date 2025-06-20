package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type JobApplicationRepository interface {
	Create(ctx context.Context, tx *sql.Tx, jobApplication domain.JobApplication) domain.JobApplication
	Update(ctx context.Context, tx *sql.Tx, jobApplication domain.JobApplication) domain.JobApplication
	Delete(ctx context.Context, tx *sql.Tx, jobApplicationId uuid.UUID) error
	FindById(ctx context.Context, tx *sql.Tx, jobApplicationId uuid.UUID) (domain.JobApplication, error)
	FindByJobVacancyId(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status string, limit, offset int) ([]domain.JobApplication, int, error)
	FindByApplicantId(ctx context.Context, tx *sql.Tx, applicantId uuid.UUID, status string, limit, offset int) ([]domain.JobApplication, int, error)
	FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status string, limit, offset int) ([]domain.JobApplication, int, error)
	FindWithFilters(ctx context.Context, tx *sql.Tx, jobVacancyId, applicantId, reviewedBy, companyId *uuid.UUID, status, search string, limit, offset int) ([]domain.JobApplication, int, error)
	HasApplied(ctx context.Context, tx *sql.Tx, jobVacancyId, applicantId uuid.UUID) bool
	CountByJobVacancyId(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) (int, error)
	CountByStatus(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID, status domain.JobApplicationStatus) (int, error)
	GetStats(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID) (map[string]int, error)
}
