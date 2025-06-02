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

func (repository *CompanySubmissionRepositoryImpl) FindByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanySubmissionStatus, limit, offset int) []domain.CompanySubmission {
	SQL := `SELECT 
                cs.id, cs.user_id, cs.name, cs.linkedin_url, cs.website, cs.industry, 
                cs.size, cs.type, cs.logo, cs.tagline, cs.status, cs.rejection_reason,
                cs.reviewed_by, cs.reviewed_at, cs.created_at, cs.updated_at,
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

		// Handle nullable submission fields
		var submissionWebsite, submissionLogo, submissionTagline sql.NullString
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // Changed from *sql.NullTime to sql.NullTime

		// Handle nullable user fields - FIXED
		var userId, userName, userEmail, userUsername sql.NullString
		var userPhoto sql.NullString // Changed from string to sql.NullString

		err := rows.Scan(
			&submission.Id, &submission.UserId, &submission.Name, &submission.LinkedinUrl,
			&submissionWebsite, &submission.Industry, &submission.Size, &submission.Type,
			&submissionLogo, &submissionTagline, &submission.Status, &rejectionReason,
			&reviewedBy, &reviewedAt, &submission.CreatedAt, &submission.UpdatedAt,
			&userId, &userName, &userEmail, &userUsername, &userPhoto) // Fixed here
		helper.PanicIfError(err)

		// Handle nullable submission fields
		submission.Website = submissionWebsite.String
		submission.Logo = submissionLogo.String
		submission.Tagline = submissionTagline.String
		submission.RejectionReason = rejectionReason.String
		submission.ReviewedBy = reviewedBy

		// FIXED: Uncomment and properly handle ReviewedAt
		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}

		// Build User object if data exists - FIXED NULL HANDLING
		if userId.Valid {
			userUUID, err := uuid.Parse(userId.String)
			if err == nil {
				submission.User = &domain.User{
					Id:       userUUID,
					Name:     userName.String,
					Email:    userEmail.String,
					Username: userUsername.String,
					Photo:    userPhoto.String, // Now safely handles NULL values
				}
			}
		}

		submissions = append(submissions, submission)
	}

	return submissions
}

func (repository *CompanySubmissionRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.CompanySubmission {
	fmt.Println("Fetching all company submissions with limit:", limit, "and offset:", offset)
	SQL := `SELECT 
                cs.id, cs.user_id, cs.name, cs.linkedin_url, cs.website, cs.industry, 
                cs.size, cs.type, cs.logo, cs.tagline, cs.status, cs.rejection_reason,
                cs.reviewed_by, cs.reviewed_at, cs.created_at, cs.updated_at,
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
		fmt.Println("Processing a row in company submissions")
		submission := domain.CompanySubmission{}

		// Handle nullable submission fields
		var submissionWebsite, submissionLogo, submissionTagline sql.NullString
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // Changed from *sql.NullTime to sql.NullTime

		// Handle nullable user fields - THIS IS THE FIX
		var userId, userName, userEmail, userUsername sql.NullString
		var userPhoto sql.NullString // Changed from string to sql.NullString

		fmt.Println("Scanning row into submission and user fields")
		err := rows.Scan(
			&submission.Id, &submission.UserId, &submission.Name, &submission.LinkedinUrl,
			&submissionWebsite, &submission.Industry, &submission.Size, &submission.Type,
			&submissionLogo, &submissionTagline, &submission.Status, &rejectionReason,
			&reviewedBy, &reviewedAt, &submission.CreatedAt, &submission.UpdatedAt,
			&userId, &userName, &userEmail, &userUsername, &userPhoto) // Fixed here
		helper.PanicIfError(err)

		fmt.Println("Row scanned successfully, handling nullable fields")
		// Handle nullable submission fields
		submission.Website = submissionWebsite.String
		submission.Logo = submissionLogo.String
		submission.Tagline = submissionTagline.String
		submission.RejectionReason = rejectionReason.String
		submission.ReviewedBy = reviewedBy

		fmt.Println("Checking if reviewedAt is valid")
		// FIXED: Uncomment and properly handle ReviewedAt
		if reviewedAt.Valid {
			fmt.Println("Setting ReviewedAt time")
			submission.ReviewedAt = &reviewedAt.Time
		}

		fmt.Println("Building User object if userId is valid")
		// Build User object if data exists - FIXED NULL HANDLING
		if userId.Valid {
			userUUID, err := uuid.Parse(userId.String)
			if err == nil {
				submission.User = &domain.User{
					Id:       userUUID,
					Name:     userName.String,
					Email:    userEmail.String,
					Username: userUsername.String,
					Photo:    userPhoto.String, // Now safely handles NULL values
				}
			}
		}

		submissions = append(submissions, submission)
	}

	return submissions
}

func (repository *CompanySubmissionRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, submissionId uuid.UUID) (domain.CompanySubmission, error) {
	SQL := `SELECT 
                cs.id, cs.user_id, cs.name, cs.linkedin_url, cs.website, cs.industry, 
                cs.size, cs.type, cs.logo, cs.tagline, cs.status, cs.rejection_reason,
                cs.reviewed_by, cs.reviewed_at, cs.created_at, cs.updated_at,
                u.id, u.name, u.email, u.username, u.photo
            FROM company_submissions cs
            LEFT JOIN users u ON cs.user_id = u.id
            WHERE cs.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, submissionId)
	helper.PanicIfError(err)
	defer rows.Close()

	submission := domain.CompanySubmission{}
	if rows.Next() {
		// Handle nullable submission fields
		var submissionWebsite, submissionLogo, submissionTagline sql.NullString
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // Changed from *sql.NullTime to sql.NullTime

		// Handle nullable user fields - THIS IS THE FIX
		var userId, userName, userEmail, userUsername sql.NullString
		var userPhoto sql.NullString // Changed from string to sql.NullString

		fmt.Println("Scanning row into submission and user fields")
		err := rows.Scan(
			&submission.Id, &submission.UserId, &submission.Name, &submission.LinkedinUrl,
			&submissionWebsite, &submission.Industry, &submission.Size, &submission.Type,
			&submissionLogo, &submissionTagline, &submission.Status, &rejectionReason,
			&reviewedBy, &reviewedAt, &submission.CreatedAt, &submission.UpdatedAt,
			&userId, &userName, &userEmail, &userUsername, &userPhoto) // Fixed here
		helper.PanicIfError(err)

		fmt.Println("Row scanned successfully, handling nullable fields")
		// Handle nullable submission fields
		submission.Website = submissionWebsite.String
		submission.Logo = submissionLogo.String
		submission.Tagline = submissionTagline.String
		submission.RejectionReason = rejectionReason.String
		submission.ReviewedBy = reviewedBy

		fmt.Println("Checking if reviewedAt is valid")
		// FIXED: Uncomment and properly handle ReviewedAt
		if reviewedAt.Valid {
			fmt.Println("Setting ReviewedAt time")
			submission.ReviewedAt = &reviewedAt.Time
		}

		fmt.Println("Building User object if userId is valid")
		// Build User object if data exists - FIXED NULL HANDLING
		if userId.Valid {
			userUUID, err := uuid.Parse(userId.String)
			if err == nil {
				submission.User = &domain.User{
					Id:       userUUID,
					Name:     userName.String,
					Email:    userEmail.String,
					Username: userUsername.String,
					Photo:    userPhoto.String, // Now safely handles NULL values
				}
			}
		}

		return submission, nil
	} else {
		return submission, fmt.Errorf("company submission not found")
	}
}

func (repository *CompanySubmissionRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.CompanySubmission {
	SQL := `SELECT 
                id, user_id, name, linkedin_url, website, industry, 
                size, type, logo, tagline, status, rejection_reason,
                reviewed_by, reviewed_at, created_at, updated_at
            FROM company_submissions 
            WHERE user_id = $1
            ORDER BY created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	var submissions []domain.CompanySubmission
	for rows.Next() {
		submission := domain.CompanySubmission{}

		// Handle nullable fields
		var website, logo, tagline sql.NullString
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // FIXED: Remove the pointer (*) here

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
		submission.ReviewedBy = reviewedBy

		// FIXED: Now this syntax will work consistently
		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}

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
