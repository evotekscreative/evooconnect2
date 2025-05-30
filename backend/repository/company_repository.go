package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type CompanyRepository interface {
	Create(ctx context.Context, tx *sql.Tx, company domain.Company) domain.Company
	FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Company, error)
	FindByOwnerId(ctx context.Context, tx *sql.Tx, ownerId uuid.UUID) (domain.Company, error)
	FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.Company
	Update(ctx context.Context, tx *sql.Tx, company domain.Company) domain.Company
	Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID)
}
