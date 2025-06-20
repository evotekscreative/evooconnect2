package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type JobVacancyRepository interface {
	Create(ctx context.Context, tx *sql.Tx, jobVacancy domain.JobVacancy) domain.JobVacancy
	Update(ctx context.Context, tx *sql.Tx, jobVacancy domain.JobVacancy) domain.JobVacancy
	Delete(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) error
	FindById(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) (domain.JobVacancy, error)
	FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) []domain.JobVacancy
	FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) []domain.JobVacancy
	FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.JobVacancy
	FindActiveJobs(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.JobVacancy
	SearchJobs(ctx context.Context, tx *sql.Tx, filters map[string]interface{}, limit, offset int) []domain.JobVacancy
	CountByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) int
	CountByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID) int
	CountAll(ctx context.Context, tx *sql.Tx) int
	CountActiveJobs(ctx context.Context, tx *sql.Tx) int
	CountSearchResults(ctx context.Context, tx *sql.Tx, filters map[string]interface{}) int
	UpdateStatus(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status domain.JobVacancyStatus) error
}
