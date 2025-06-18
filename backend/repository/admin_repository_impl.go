package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type AdminRepositoryImpl struct {
}

func NewAdminRepository() AdminRepository {
	return &AdminRepositoryImpl{}
}

func (repository *AdminRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, admin domain.Admin) domain.Admin {
	id := uuid.New()
	now := time.Now()

	SQL := "INSERT INTO administrators (id, username, email, password, name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
	_, err := tx.ExecContext(ctx, SQL, id, admin.Username, admin.Email, admin.Password, admin.Name, admin.Role, now, now)
	helper.PanicIfError(err)

	admin.Id = id
	admin.CreatedAt = now
	admin.UpdatedAt = now

	return admin
}

func (repository *AdminRepositoryImpl) FindByEmail(ctx context.Context, tx *sql.Tx, email string) (domain.Admin, error) {
	SQL := "SELECT id, username, email, password, name, role, created_at, updated_at FROM administrators WHERE email = $1"
	rows, err := tx.QueryContext(ctx, SQL, email)
	helper.PanicIfError(err)
	defer rows.Close()

	admin := domain.Admin{}
	if rows.Next() {
		err := rows.Scan(&admin.Id, &admin.Username, &admin.Email, &admin.Password, &admin.Name, &admin.Role, &admin.CreatedAt, &admin.UpdatedAt)
		helper.PanicIfError(err)
		return admin, nil
	} else {
		return admin, errors.New("admin not found")
	}
}

func (repository *AdminRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Admin, error) {
	SQL := "SELECT id, username, email, password, name, role, created_at, updated_at FROM administrators WHERE id = $1"
	rows, err := tx.QueryContext(ctx, SQL, id)
	helper.PanicIfError(err)
	defer rows.Close()

	admin := domain.Admin{}
	if rows.Next() {
		err := rows.Scan(&admin.Id, &admin.Username, &admin.Email, &admin.Password, &admin.Name, &admin.Role, &admin.CreatedAt, &admin.UpdatedAt)
		helper.PanicIfError(err)
		return admin, nil
	} else {
		return admin, errors.New("admin not found")
	}
}
