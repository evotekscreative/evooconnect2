package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type UserEducationRepository interface {
	Save(ctx context.Context, tx *sql.Tx, education domain.UserEducation) domain.UserEducation
	Update(ctx context.Context, tx *sql.Tx, education domain.UserEducation) domain.UserEducation
	Delete(ctx context.Context, tx *sql.Tx, educationId uuid.UUID) error
	FindById(ctx context.Context, tx *sql.Tx, educationId uuid.UUID) (domain.UserEducation, error)
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.UserEducation, error)
	CountByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) (int, error)
}
