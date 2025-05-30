package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"

	"github.com/google/uuid"
)

type AdminRepositoryImpl struct{}

func NewAdminRepository() AdminRepository {
	return &AdminRepositoryImpl{}
}

func (repository *AdminRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, admin domain.Admin) domain.Admin {
	SQL := `INSERT INTO admins (id, email, password, name, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := tx.ExecContext(ctx, SQL, admin.Id, admin.Email, admin.Password, admin.Name, admin.CreatedAt, admin.UpdatedAt)
	helper.PanicIfError(err)

	return admin
}

func (repository *AdminRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Admin, error) {
	SQL := `SELECT id, name, email, password, created_at, updated_at 
            FROM admins 
            WHERE id = $1`

	rows, err := tx.QueryContext(ctx, SQL, id)
	helper.PanicIfError(err)
	defer rows.Close()

	admin := domain.Admin{}
	if rows.Next() {
		err := rows.Scan(&admin.Id, &admin.Name, &admin.Email, &admin.Password, &admin.CreatedAt, &admin.UpdatedAt)
		helper.PanicIfError(err)
		return admin, nil
	} else {
		return admin, fmt.Errorf("admin not found")
	}
}

func (repository *AdminRepositoryImpl) FindByEmail(ctx context.Context, tx *sql.Tx, email string) (domain.Admin, error) {
	SQL := `SELECT id, name, email, password, created_at, updated_at 
            FROM admins 
            WHERE email = $1`

	rows, err := tx.QueryContext(ctx, SQL, email)
	helper.PanicIfError(err)
	defer rows.Close()

	admin := domain.Admin{}
	if rows.Next() {
		err := rows.Scan(&admin.Id, &admin.Name, &admin.Email, &admin.Password, &admin.CreatedAt, &admin.UpdatedAt)
		helper.PanicIfError(err)
		return admin, nil
	} else {
		return admin, fmt.Errorf("admin not found")
	}
}

func (repository *AdminRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, admin domain.Admin) domain.Admin {
	SQL := `UPDATE admins 
            SET name = $1, email = $2, password = $3, updated_at = $4 
            WHERE id = $5`

	_, err := tx.ExecContext(ctx, SQL, admin.Name, admin.Email, admin.Password, admin.UpdatedAt, admin.Id)
	helper.PanicIfError(err)

	return admin
}

func (repository *AdminRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID) {
	SQL := `DELETE FROM admins WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL, id)
	helper.PanicIfError(err)
}
