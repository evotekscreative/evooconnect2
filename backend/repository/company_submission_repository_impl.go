package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"github.com/google/uuid"
	"time"
)

type CompanySubmissionRepositoryImpl struct{}

func NewCompanySubmissionRepository() CompanySubmissionRepository {
	return &CompanySubmissionRepositoryImpl{}
}

func (repository *CompanySubmissionRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, submission domain.CompanySubmission) domain.CompanySubmission {
	SQL := `INSERT INTO company_submissions (id, user_id, name, linkedin_url, website, industry, size, type, logo, tagline, status, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`

	var id uuid.UUID
	err := tx.QueryRowContext(ctx, SQL,
		submission.Id, submission.UserId, submission.Name, submission.LinkedinUrl,
		submission.Website, submission.Industry, submission.Size, submission.Type,
		submission.Logo, submission.Tagline, submission.Status,
		submission.CreatedAt, submission.UpdatedAt).Scan(&id)
	helper.PanicIfError(err)

	submission.Id = id
	return submission
}

func (repository *CompanySubmissionRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.CompanySubmission, error) {
	// Pisah query menjadi lebih sederhana untuk debug
	SQL := `SELECT 
            cs.id, 
            cs.user_id, 
            cs.name, 
            cs.linkedin_url, 
            cs.website, 
            cs.industry, 
            cs.size, 
            cs.type, 
            cs.logo, 
            cs.tagline, 
            cs.status, 
            cs.rejection_reason, 
            cs.reviewed_by, 
            cs.reviewed_at, 
            cs.created_at, 
            cs.updated_at,
            u.id as user_id, 
            u.name as user_name, 
            u.email as user_email, 
            u.username as user_username, 
            u.photo as user_photo,
            a.id as admin_id, 
            a.name as admin_name, 
            a.email as admin_email
            FROM company_submissions cs
            LEFT JOIN users u ON cs.user_id = u.id
            LEFT JOIN admins a ON cs.reviewed_by = a.id
            WHERE cs.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, id)
	helper.PanicIfError(err)
	defer rows.Close()

	submission := domain.CompanySubmission{}
	if rows.Next() {
		var user domain.User
		var reviewedByAdmin domain.Admin
		var rejectionReason, website, logo, tagline sql.NullString
		var reviewedBy sql.NullString
		var reviewedAt sql.NullTime
		var userPhoto sql.NullString
		var adminId, adminName, adminEmail sql.NullString

		err := rows.Scan(
			&submission.Id,
			&submission.UserId,
			&submission.Name,
			&submission.LinkedinUrl,
			&website,
			&submission.Industry,
			&submission.Size,
			&submission.Type,
			&logo,
			&tagline,
			&submission.Status,
			&rejectionReason,
			&reviewedBy,
			&reviewedAt,
			&submission.CreatedAt,
			&submission.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&userPhoto,
			&adminId,
			&adminName,
			&adminEmail)
		helper.PanicIfError(err)

		// Handle nullable fields
		submission.Website = website.String
		submission.Logo = logo.String
		submission.Tagline = tagline.String
		submission.RejectionReason = rejectionReason.String
		user.Photo = userPhoto.String

		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}

		if reviewedBy.Valid {
			reviewedByUUID, _ := uuid.Parse(reviewedBy.String)
			submission.ReviewedBy = &reviewedByUUID
		}

		submission.User = &user

		if adminId.Valid {
			reviewedByAdmin.Id, _ = uuid.Parse(adminId.String)
			reviewedByAdmin.Name = adminName.String
			reviewedByAdmin.Email = adminEmail.String
			submission.ReviewedByAdmin = &reviewedByAdmin
		}

		return submission, nil
	} else {
		return submission, fmt.Errorf("company submission not found")
	}
}

func (repository *CompanySubmissionRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) ([]domain.CompanySubmission, error) {
	SQL := `SELECT cs.id, cs.user_id, cs.name, cs.linkedin_url, cs.website, cs.industry, cs.size, cs.type, 
            cs.logo, cs.tagline, cs.status, cs.rejection_reason, cs.reviewed_by, cs.reviewed_at, 
            cs.created_at, cs.updated_at
            FROM company_submissions cs
            WHERE cs.user_id = $1
            ORDER BY cs.created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	var submissions []domain.CompanySubmission
	for rows.Next() {
		submission := domain.CompanySubmission{}
		var rejectionReason, website, logo, tagline sql.NullString
		var reviewedBy sql.NullString
		var reviewedAt sql.NullTime

		err := rows.Scan(
			&submission.Id, &submission.UserId, &submission.Name, &submission.LinkedinUrl,
			&website, &submission.Industry, &submission.Size, &submission.Type,
			&logo, &tagline, &submission.Status, &rejectionReason,
			&reviewedBy, &reviewedAt, &submission.CreatedAt, &submission.UpdatedAt)
		helper.PanicIfError(err)

		// Handle nullable fields
		submission.Website = website.String
		submission.Logo = logo.String
		submission.Tagline = tagline.String
		submission.RejectionReason = rejectionReason.String

		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}

		if reviewedBy.Valid {
			reviewedByUUID, _ := uuid.Parse(reviewedBy.String)
			submission.ReviewedBy = &reviewedByUUID
		}

		submissions = append(submissions, submission)
	}

	return submissions, nil
}

func (repository *CompanySubmissionRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.CompanySubmission {
	SQL := `SELECT cs.id, cs.user_id, cs.name, cs.linkedin_url, cs.website, cs.industry, cs.size, cs.type, 
            cs.logo, cs.tagline, cs.status, cs.rejection_reason, cs.reviewed_by, cs.reviewed_at, 
            cs.created_at, cs.updated_at,
            u.id, u.name, u.email, u.username, u.photo
            FROM company_submissions cs
            LEFT JOIN users u ON cs.user_id = u.id
            ORDER BY cs.created_at DESC
            LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var submissions []domain.CompanySubmission
	for rows.Next() {
		submission := domain.CompanySubmission{}
		user := domain.User{}
		var rejectionReason, website, logo, tagline sql.NullString
		var reviewedBy sql.NullString
		var reviewedAt sql.NullTime

		err := rows.Scan(
			&submission.Id, &submission.UserId, &submission.Name, &submission.LinkedinUrl,
			&website, &submission.Industry, &submission.Size, &submission.Type,
			&logo, &tagline, &submission.Status, &rejectionReason,
			&reviewedBy, &reviewedAt, &submission.CreatedAt, &submission.UpdatedAt,
			&user.Id, &user.Name, &user.Email, &user.Username, &user.Photo)
		helper.PanicIfError(err)

		// Handle nullable fields
		submission.Website = website.String
		submission.Logo = logo.String
		submission.Tagline = tagline.String
		submission.RejectionReason = rejectionReason.String

		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}

		if reviewedBy.Valid {
			reviewedByUUID, _ := uuid.Parse(reviewedBy.String)
			submission.ReviewedBy = &reviewedByUUID
		}

		submission.User = &user
		submissions = append(submissions, submission)
	}

	return submissions
}

func (repository *CompanySubmissionRepositoryImpl) FindByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanySubmissionStatus, limit, offset int) []domain.CompanySubmission {
	SQL := `SELECT cs.id, cs.user_id, cs.name, cs.linkedin_url, cs.website, cs.industry, cs.size, cs.type, 
            cs.logo, cs.tagline, cs.status, cs.rejection_reason, cs.reviewed_by, cs.reviewed_at, 
            cs.created_at, cs.updated_at,
            u.id, u.name, u.email, u.username, u.photo
            FROM company_submissions cs
            LEFT JOIN users u ON cs.user_id = u.id
            WHERE cs.status = $1
            ORDER BY cs.created_at DESC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, status, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var submissions []domain.CompanySubmission
	for rows.Next() {
		submission := domain.CompanySubmission{}
		user := domain.User{}
		var rejectionReason, website, logo, tagline sql.NullString
		var reviewedBy sql.NullString
		var reviewedAt sql.NullTime

		err := rows.Scan(
			&submission.Id, &submission.UserId, &submission.Name, &submission.LinkedinUrl,
			&website, &submission.Industry, &submission.Size, &submission.Type,
			&logo, &tagline, &submission.Status, &rejectionReason,
			&reviewedBy, &reviewedAt, &submission.CreatedAt, &submission.UpdatedAt,
			&user.Id, &user.Name, &user.Email, &user.Username, &user.Photo)
		helper.PanicIfError(err)

		// Handle nullable fields
		submission.Website = website.String
		submission.Logo = logo.String
		submission.Tagline = tagline.String
		submission.RejectionReason = rejectionReason.String

		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}

		if reviewedBy.Valid {
			reviewedByUUID, _ := uuid.Parse(reviewedBy.String)
			submission.ReviewedBy = &reviewedByUUID
		}

		submission.User = &user
		submissions = append(submissions, submission)
	}

	return submissions
}

func (repository *CompanySubmissionRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, submission domain.CompanySubmission) domain.CompanySubmission {
	SQL := `UPDATE company_submissions SET 
            status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = $4, updated_at = $5
            WHERE id = $6`

	submission.UpdatedAt = time.Now()

	_, err := tx.ExecContext(ctx, SQL,
		submission.Status, submission.RejectionReason, submission.ReviewedBy,
		submission.ReviewedAt, submission.UpdatedAt, submission.Id)
	helper.PanicIfError(err)

	return submission
}

func (repository *CompanySubmissionRepositoryImpl) CountByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanySubmissionStatus) int {
	SQL := `SELECT COUNT(*) FROM company_submissions WHERE status = $1`

	rows, err := tx.QueryContext(ctx, SQL, status)
	helper.PanicIfError(err)
	defer rows.Close()

	var count int
	if rows.Next() {
		err := rows.Scan(&count)
		helper.PanicIfError(err)
	}

	return count
}

func (repository *CompanySubmissionRepositoryImpl) HasPendingSubmission(ctx context.Context, tx *sql.Tx, userId uuid.UUID) bool {
	SQL := `SELECT COUNT(*) FROM company_submissions WHERE user_id = $1 AND status = 'pending'`

	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	var count int
	if rows.Next() {
		err := rows.Scan(&count)
		helper.PanicIfError(err)
	}

	return count > 0
}
