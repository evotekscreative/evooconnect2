package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type SavedJobRepository interface {
	Save(ctx context.Context, tx *sql.Tx, savedJob domain.SavedJob) domain.SavedJob
	Delete(ctx context.Context, tx *sql.Tx, userId, jobVacancyId uuid.UUID) error
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.SavedJob, error)
	FindByUserIdAndJobVacancyId(ctx context.Context, tx *sql.Tx, userId, jobVacancyId uuid.UUID) (domain.SavedJob, error)
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) []domain.SavedJob
	CountByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) int
	IsJobSaved(ctx context.Context, tx *sql.Tx, userId, jobVacancyId uuid.UUID) bool
}
