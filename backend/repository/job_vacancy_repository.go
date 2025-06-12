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
	FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status string, limit, offset int) ([]domain.JobVacancy, int, error)
	FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) ([]domain.JobVacancy, int, error)
	FindWithFilters(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID, jobType, experienceLevel, location, status, search string, remoteWork *bool, salaryMin, salaryMax *float64, limit, offset int) ([]domain.JobVacancy, int, error)
	UpdateStatus(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status domain.JobVacancyStatus) error
	UpdateViewCount(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) error
	CountByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) (int, error)
	CountByStatus(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status domain.JobVacancyStatus) (int, error)
	GetStats(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID) (map[string]int, error)
}
