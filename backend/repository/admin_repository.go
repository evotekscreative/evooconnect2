package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type AdminRepository interface {
	Save(ctx context.Context, tx *sql.Tx, admin domain.Admin) domain.Admin
	FindByEmail(ctx context.Context, tx *sql.Tx, email string) (domain.Admin, error)
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Admin, error)
}
