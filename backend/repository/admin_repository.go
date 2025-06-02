package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type AdminRepository interface {
	Create(ctx context.Context, tx *sql.Tx, admin domain.Admin) domain.Admin
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Admin, error)
	FindByEmail(ctx context.Context, tx *sql.Tx, email string) (domain.Admin, error)
	Update(ctx context.Context, tx *sql.Tx, admin domain.Admin) domain.Admin
	Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID)
}
