package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"

	"github.com/google/uuid"
)

type CompanyRepositoryImpl struct{}

func NewCompanyRepository() CompanyRepository {
	return &CompanyRepositoryImpl{}
}

func (repository *CompanyRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, company domain.Company) domain.Company {
	SQL := `INSERT INTO companies (id, owner_id, name, linkedin_url, website, industry, size, type, logo, tagline, is_verified, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	_, err := tx.ExecContext(ctx, SQL,
		company.Id, company.OwnerId, company.Name, company.LinkedinUrl, company.Website,
		company.Industry, company.Size, company.Type, company.Logo, company.Tagline,
		company.IsVerified, company.CreatedAt, company.UpdatedAt)
	helper.PanicIfError(err)

	return company
}

func (repository *CompanyRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, company domain.Company) domain.Company {
	SQL := `UPDATE companies SET 
            name = $1, linkedin_url = $2, website = $3, industry = $4, size = $5, 
            type = $6, logo = $7, tagline = $8, updated_at = $9
            WHERE id = $10`

	_, err := tx.ExecContext(ctx, SQL,
		company.Name, company.LinkedinUrl, company.Website, company.Industry, company.Size,
		company.Type, company.Logo, company.Tagline, company.UpdatedAt, company.Id)
	helper.PanicIfError(err)

	return company
}

func (repository *CompanyRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) error {
	SQL := `DELETE FROM companies WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL, companyId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to delete company"))
	}

	return nil
}

func (repository *CompanyRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) (domain.Company, error) {
	SQL := `SELECT id, owner_id, name, linkedin_url, website, industry, size, type, logo, tagline, is_verified, created_at, updated_at
            FROM companies WHERE id = $1`

	rows, err := tx.QueryContext(ctx, SQL, companyId)
	helper.PanicIfError(err)
	defer rows.Close()

	company := domain.Company{}
	if rows.Next() {
		var website, logo, tagline sql.NullString

		err := rows.Scan(
			&company.Id, &company.OwnerId, &company.Name, &company.LinkedinUrl, &website,
			&company.Industry, &company.Size, &company.Type, &logo, &tagline,
			&company.IsVerified, &company.CreatedAt, &company.UpdatedAt)
		helper.PanicIfError(err)

		company.Website = website.String
		company.Logo = logo.String
		company.Tagline = tagline.String

		return company, nil
	} else {
		return company, fmt.Errorf("company not found")
	}
}

func (repository *CompanyRepositoryImpl) FindByOwnerId(ctx context.Context, tx *sql.Tx, ownerId uuid.UUID) []domain.Company {
	SQL := `SELECT id, owner_id, name, linkedin_url, website, industry, size, type, logo, tagline, is_verified, created_at, updated_at
            FROM companies WHERE owner_id = $1 ORDER BY created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, ownerId)
	helper.PanicIfError(err)
	defer rows.Close()

	var companies []domain.Company
	for rows.Next() {
		company := domain.Company{}
		var website, logo, tagline sql.NullString

		err := rows.Scan(
			&company.Id, &company.OwnerId, &company.Name, &company.LinkedinUrl, &website,
			&company.Industry, &company.Size, &company.Type, &logo, &tagline,
			&company.IsVerified, &company.CreatedAt, &company.UpdatedAt)
		helper.PanicIfError(err)

		company.Website = website.String
		company.Logo = logo.String
		company.Tagline = tagline.String

		companies = append(companies, company)
	}

	return companies
}

func (repository *CompanyRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.Company {
	SQL := `SELECT id, owner_id, name, linkedin_url, website, industry, size, type, logo, tagline, is_verified, created_at, updated_at
            FROM companies ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var companies []domain.Company
	for rows.Next() {
		company := domain.Company{}
		var website, logo, tagline sql.NullString

		err := rows.Scan(
			&company.Id, &company.OwnerId, &company.Name, &company.LinkedinUrl, &website,
			&company.Industry, &company.Size, &company.Type, &logo, &tagline,
			&company.IsVerified, &company.CreatedAt, &company.UpdatedAt)
		helper.PanicIfError(err)

		company.Website = website.String
		company.Logo = logo.String
		company.Tagline = tagline.String

		companies = append(companies, company)
	}

	return companies
}
