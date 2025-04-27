package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type ExperienceRepository interface {
	Save(ctx context.Context, tx *sql.Tx, experience domain.UserExperience) domain.UserExperience
	Update(ctx context.Context, tx *sql.Tx, experience domain.UserExperience) domain.UserExperience
	Delete(ctx context.Context, tx *sql.Tx, experienceId uuid.UUID)
	FindById(ctx context.Context, tx *sql.Tx, experienceId uuid.UUID) (domain.UserExperience, error)
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.UserExperience, int)
}
