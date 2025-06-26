package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type UserCvStorageRepository interface {
	Create(ctx context.Context, tx *sql.Tx, cvStorage domain.UserCvStorage) domain.UserCvStorage
	Update(ctx context.Context, tx *sql.Tx, cvStorage domain.UserCvStorage) domain.UserCvStorage
	Delete(ctx context.Context, tx *sql.Tx, userId uuid.UUID) error
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) (domain.UserCvStorage, error)
	ExistsByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) bool
}
