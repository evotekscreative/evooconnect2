package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type CompanyRepositoryImpl struct{}

func NewCompanyRepository() CompanyRepository {
	return &CompanyRepositoryImpl{}
}

func (repository *CompanyRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, company domain.Company) domain.Company {
	SQL := `INSERT INTO companies (id, owner_id, name, linkedin_url, website, industry, size, type, logo, tagline, is_verified, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`

	var id uuid.UUID
	err := tx.QueryRowContext(ctx, SQL,
		company.Id, company.OwnerId, company.Name, company.LinkedinUrl,
		company.Website, company.Industry, company.Size, company.Type,
		company.Logo, company.Tagline, company.IsVerified,
		company.CreatedAt, company.UpdatedAt).Scan(&id)
	helper.PanicIfError(err)

	company.Id = id
	return company
}

func (repository *CompanyRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Company, error) {
	SQL := `SELECT c.id, c.owner_id, c.name, c.linkedin_url, c.website, c.industry, c.size, c.type, 
            c.logo, c.tagline, c.is_verified, c.created_at, c.updated_at,
            u.id, u.name, u.email, u.username, u.photo
            FROM companies c
            LEFT JOIN users u ON c.owner_id = u.id
            WHERE c.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, id)
	helper.PanicIfError(err)
	defer rows.Close()

	company := domain.Company{}
	if rows.Next() {
		var owner domain.User
		var website, logo, tagline sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&company.Id, &company.OwnerId, &company.Name, &company.LinkedinUrl,
			&website, &company.Industry, &company.Size, &company.Type,
			&logo, &tagline, &company.IsVerified, &company.CreatedAt, &company.UpdatedAt,
			&owner.Id, &owner.Name, &owner.Email, &owner.Username, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		company.Website = website.String
		company.Logo = logo.String
		company.Tagline = tagline.String
		owner.Photo = userPhoto.String

		company.Owner = &owner
		return company, nil
	} else {
		return company, fmt.Errorf("company not found")
	}
}

func (repository *CompanyRepositoryImpl) FindByOwnerId(ctx context.Context, tx *sql.Tx, ownerId uuid.UUID) (domain.Company, error) {
	SQL := `SELECT c.id, c.owner_id, c.name, c.linkedin_url, c.website, c.industry, c.size, c.type, 
            c.logo, c.tagline, c.is_verified, c.created_at, c.updated_at,
            u.id, u.name, u.email, u.username, u.photo
            FROM companies c
            LEFT JOIN users u ON c.owner_id = u.id
            WHERE c.owner_id = $1`

	rows, err := tx.QueryContext(ctx, SQL, ownerId)
	helper.PanicIfError(err)
	defer rows.Close()

	company := domain.Company{}
	if rows.Next() {
		var owner domain.User
		var website, logo, tagline sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&company.Id, &company.OwnerId, &company.Name, &company.LinkedinUrl,
			&website, &company.Industry, &company.Size, &company.Type,
			&logo, &tagline, &company.IsVerified, &company.CreatedAt, &company.UpdatedAt,
			&owner.Id, &owner.Name, &owner.Email, &owner.Username, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		company.Website = website.String
		company.Logo = logo.String
		company.Tagline = tagline.String
		owner.Photo = userPhoto.String

		company.Owner = &owner
		return company, nil
	} else {
		return company, fmt.Errorf("company not found")
	}
}

func (repository *CompanyRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.Company {
	SQL := `SELECT c.id, c.owner_id, c.name, c.linkedin_url, c.website, c.industry, c.size, c.type, 
            c.logo, c.tagline, c.is_verified, c.created_at, c.updated_at,
            u.id, u.name, u.email, u.username, u.photo
            FROM companies c
            LEFT JOIN users u ON c.owner_id = u.id
            ORDER BY c.created_at DESC
            LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var companies []domain.Company
	for rows.Next() {
		company := domain.Company{}
		owner := domain.User{}
		var website, logo, tagline sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&company.Id, &company.OwnerId, &company.Name, &company.LinkedinUrl,
			&website, &company.Industry, &company.Size, &company.Type,
			&logo, &tagline, &company.IsVerified, &company.CreatedAt, &company.UpdatedAt,
			&owner.Id, &owner.Name, &owner.Email, &owner.Username, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		company.Website = website.String
		company.Logo = logo.String
		company.Tagline = tagline.String
		owner.Photo = userPhoto.String

		company.Owner = &owner
		companies = append(companies, company)
	}

	return companies
}

func (repository *CompanyRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, company domain.Company) domain.Company {
	SQL := `UPDATE companies SET 
            name = $1, linkedin_url = $2, website = $3, industry = $4, size = $5, type = $6,
            logo = $7, tagline = $8, is_verified = $9, updated_at = $10
            WHERE id = $11`

	company.UpdatedAt = time.Now()

	_, err := tx.ExecContext(ctx, SQL,
		company.Name, company.LinkedinUrl, company.Website, company.Industry,
		company.Size, company.Type, company.Logo, company.Tagline,
		company.IsVerified, company.UpdatedAt, company.Id)
	helper.PanicIfError(err)

	return company
}

func (repository *CompanyRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID) {
	SQL := `DELETE FROM companies WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL, id)
	helper.PanicIfError(err)
}
