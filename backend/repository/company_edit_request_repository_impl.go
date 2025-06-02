package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"github.com/google/uuid"
)

type CompanyEditRequestRepositoryImpl struct{}

func NewCompanyEditRequestRepository() CompanyEditRequestRepository {
	return &CompanyEditRequestRepositoryImpl{}
}

func (repository *CompanyEditRequestRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, editRequest domain.CompanyEditRequest) domain.CompanyEditRequest {
	SQL := `INSERT INTO company_edit_requests (id, company_id, user_id, requested_changes, current_data, status, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := tx.ExecContext(ctx, SQL,
		editRequest.Id, editRequest.CompanyId, editRequest.UserId,
		editRequest.RequestedChanges, editRequest.CurrentData, editRequest.Status,
		editRequest.CreatedAt, editRequest.UpdatedAt)
	helper.PanicIfError(err)

	return editRequest
}

func (repository *CompanyEditRequestRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, editRequest domain.CompanyEditRequest) domain.CompanyEditRequest {
	SQL := `UPDATE company_edit_requests SET 
            status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = $4, updated_at = $5
            WHERE id = $6`

	_, err := tx.ExecContext(ctx, SQL,
		editRequest.Status, editRequest.RejectionReason, editRequest.ReviewedBy,
		editRequest.ReviewedAt, editRequest.UpdatedAt, editRequest.Id)
	helper.PanicIfError(err)

	return editRequest
}

func (repository *CompanyEditRequestRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, editRequestId uuid.UUID) (domain.CompanyEditRequest, error) {
	SQL := `SELECT 
                cer.id, cer.company_id, cer.user_id, cer.requested_changes, cer.current_data, 
                cer.status, cer.rejection_reason, cer.reviewed_by, cer.reviewed_at, 
                cer.created_at, cer.updated_at,
                c.name, c.linkedin_url, c.website, c.industry, c.size, c.type, c.logo, c.tagline, c.is_verified,
                u.id, u.name, u.email, u.username, u.photo
            FROM company_edit_requests cer
            LEFT JOIN companies c ON cer.company_id = c.id
            LEFT JOIN users u ON cer.user_id = u.id
            WHERE cer.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, editRequestId)
	helper.PanicIfError(err)
	defer rows.Close()

	editRequest := domain.CompanyEditRequest{}
	if rows.Next() {
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // FIXED: Removed pointer

		// Company fields with nullable handling
		var companyName, companyLinkedin, companyWebsite, companyIndustry sql.NullString
		var companySize, companyType, companyLogo, companyTagline sql.NullString
		var companyVerified sql.NullBool

		// User fields with nullable handling
		var userId, userName, userEmail, userUsername sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&editRequest.Id, &editRequest.CompanyId, &editRequest.UserId,
			&editRequest.RequestedChanges, &editRequest.CurrentData, &editRequest.Status,
			&rejectionReason, &reviewedBy, &reviewedAt, // Now correctly scanning into value
			&editRequest.CreatedAt, &editRequest.UpdatedAt,
			&companyName, &companyLinkedin, &companyWebsite, &companyIndustry,
			&companySize, &companyType, &companyLogo, &companyTagline, &companyVerified,
			&userId, &userName, &userEmail, &userUsername, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		editRequest.RejectionReason = rejectionReason.String
		editRequest.ReviewedBy = reviewedBy
		if reviewedAt.Valid {
			editRequest.ReviewedAt = &reviewedAt.Time // This will now work correctly
		}

		// Build Company object if data exists
		if companyName.Valid {
			editRequest.Company = &domain.Company{
				Id:          editRequest.CompanyId,
				Name:        companyName.String,
				LinkedinUrl: companyLinkedin.String,
				Website:     companyWebsite.String,
				Industry:    companyIndustry.String,
				Size:        companySize.String,
				Type:        companyType.String,
				Logo:        companyLogo.String,
				Tagline:     companyTagline.String,
				IsVerified:  companyVerified.Bool,
			}
		}

		// Build User object if data exists
		if userId.Valid {
			userUUID, err := uuid.Parse(userId.String)
			if err == nil {
				editRequest.User = &domain.User{
					Id:       userUUID,
					Name:     userName.String,
					Email:    userEmail.String,
					Username: userUsername.String,
					Photo:    userPhoto.String,
				}
			}
		}

		return editRequest, nil
	} else {
		return editRequest, fmt.Errorf("company edit request not found")
	}
}

func (repository *CompanyEditRequestRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) []domain.CompanyEditRequest {
	SQL := `SELECT 
                cer.id, cer.company_id, cer.user_id, cer.requested_changes, cer.current_data, 
                cer.status, cer.rejection_reason, cer.reviewed_by, cer.reviewed_at, 
                cer.created_at, cer.updated_at,
                u.name, u.email, u.username, u.photo
            FROM company_edit_requests cer
            LEFT JOIN users u ON cer.user_id = u.id
            WHERE cer.company_id = $1 
            ORDER BY cer.created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, companyId)
	helper.PanicIfError(err)
	defer rows.Close()

	var editRequests []domain.CompanyEditRequest
	for rows.Next() {
		editRequest := domain.CompanyEditRequest{}
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // FIXED: Removed pointer

		// User fields with nullable handling
		var userName, userEmail, userUsername sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&editRequest.Id, &editRequest.CompanyId, &editRequest.UserId,
			&editRequest.RequestedChanges, &editRequest.CurrentData, &editRequest.Status,
			&rejectionReason, &reviewedBy, &reviewedAt,
			&editRequest.CreatedAt, &editRequest.UpdatedAt,
			&userName, &userEmail, &userUsername, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		editRequest.RejectionReason = rejectionReason.String
		editRequest.ReviewedBy = reviewedBy
		if reviewedAt.Valid {
			editRequest.ReviewedAt = &reviewedAt.Time // Now works correctly
		}

		// Build User object if data exists
		if userName.Valid {
			editRequest.User = &domain.User{
				Id:       editRequest.UserId,
				Name:     userName.String,
				Email:    userEmail.String,
				Username: userUsername.String,
				Photo:    userPhoto.String,
			}
		}

		editRequests = append(editRequests, editRequest)
	}

	return editRequests
}

func (repository *CompanyEditRequestRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.CompanyEditRequest {
	SQL := `SELECT 
                cer.id, cer.company_id, cer.user_id, cer.requested_changes, cer.current_data, 
                cer.status, cer.rejection_reason, cer.reviewed_by, cer.reviewed_at, 
                cer.created_at, cer.updated_at,
                c.name
            FROM company_edit_requests cer
            LEFT JOIN companies c ON cer.company_id = c.id
            WHERE cer.user_id = $1 
            ORDER BY cer.created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	var editRequests []domain.CompanyEditRequest
	for rows.Next() {
		editRequest := domain.CompanyEditRequest{}
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // FIXED: Removed pointer
		var companyName sql.NullString

		err := rows.Scan(
			&editRequest.Id, &editRequest.CompanyId, &editRequest.UserId,
			&editRequest.RequestedChanges, &editRequest.CurrentData, &editRequest.Status,
			&rejectionReason, &reviewedBy, &reviewedAt,
			&editRequest.CreatedAt, &editRequest.UpdatedAt,
			&companyName)
		helper.PanicIfError(err)

		// Handle nullable fields
		editRequest.RejectionReason = rejectionReason.String
		editRequest.ReviewedBy = reviewedBy
		if reviewedAt.Valid {
			editRequest.ReviewedAt = &reviewedAt.Time // Now works correctly
		}

		// Build Company object if data exists
		if companyName.Valid {
			editRequest.Company = &domain.Company{
				Id:   editRequest.CompanyId,
				Name: companyName.String,
			}
		}

		editRequests = append(editRequests, editRequest)
	}

	return editRequests
}

func (repository *CompanyEditRequestRepositoryImpl) FindByStatus(ctx context.Context, tx *sql.Tx, status domain.CompanyEditRequestStatus, limit, offset int) []domain.CompanyEditRequest {
	SQL := `SELECT 
                cer.id, cer.company_id, cer.user_id, cer.requested_changes, cer.current_data, 
                cer.status, cer.rejection_reason, cer.reviewed_by, cer.reviewed_at, 
                cer.created_at, cer.updated_at,
                c.name, u.name, u.photo
            FROM company_edit_requests cer
            LEFT JOIN companies c ON cer.company_id = c.id
            LEFT JOIN users u ON cer.user_id = u.id
            WHERE cer.status = $1 
            ORDER BY cer.created_at DESC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, status, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var editRequests []domain.CompanyEditRequest
	for rows.Next() {
		editRequest := domain.CompanyEditRequest{}
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // FIXED: Removed pointer
		var companyName, userName sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&editRequest.Id, &editRequest.CompanyId, &editRequest.UserId,
			&editRequest.RequestedChanges, &editRequest.CurrentData, &editRequest.Status,
			&rejectionReason, &reviewedBy, &reviewedAt,
			&editRequest.CreatedAt, &editRequest.UpdatedAt,
			&companyName, &userName, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		editRequest.RejectionReason = rejectionReason.String
		editRequest.ReviewedBy = reviewedBy
		if reviewedAt.Valid {
			editRequest.ReviewedAt = &reviewedAt.Time // Now works correctly
		}

		// Build Company object if data exists
		if companyName.Valid {
			editRequest.Company = &domain.Company{
				Id:   editRequest.CompanyId,
				Name: companyName.String,
			}
		}

		// Build User object if data exists
		if userName.Valid {
			editRequest.User = &domain.User{
				Id:    editRequest.UserId,
				Name:  userName.String,
				Photo: userPhoto.String,
			}
		}

		editRequests = append(editRequests, editRequest)
	}

	return editRequests
}

func (repository *CompanyEditRequestRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.CompanyEditRequest {
	SQL := `SELECT 
                cer.id, cer.company_id, cer.user_id, cer.requested_changes, cer.current_data, 
                cer.status, cer.rejection_reason, cer.reviewed_by, cer.reviewed_at, 
                cer.created_at, cer.updated_at,
                c.name, u.name, u.photo
            FROM company_edit_requests cer
            LEFT JOIN companies c ON cer.company_id = c.id
            LEFT JOIN users u ON cer.user_id = u.id
            ORDER BY cer.created_at DESC
            LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	fmt.Println("Executing FindAll with limit:", limit, "and offset:", offset)
	var editRequests []domain.CompanyEditRequest
	for rows.Next() {
		editRequest := domain.CompanyEditRequest{}
		var rejectionReason sql.NullString
		var reviewedBy *uuid.UUID
		var reviewedAt sql.NullTime // FIXED: Removed pointer
		var companyName, userName sql.NullString
		var userPhoto sql.NullString

		err := rows.Scan(
			&editRequest.Id, &editRequest.CompanyId, &editRequest.UserId,
			&editRequest.RequestedChanges, &editRequest.CurrentData, &editRequest.Status,
			&rejectionReason, &reviewedBy, &reviewedAt,
			&editRequest.CreatedAt, &editRequest.UpdatedAt,
			&companyName, &userName, &userPhoto)
		helper.PanicIfError(err)

		// Handle nullable fields
		editRequest.RejectionReason = rejectionReason.String
		editRequest.ReviewedBy = reviewedBy
		if reviewedAt.Valid {
			editRequest.ReviewedAt = &reviewedAt.Time // Now works correctly
		}

		// Build Company object if data exists
		if companyName.Valid {
			editRequest.Company = &domain.Company{
				Id:   editRequest.CompanyId,
				Name: companyName.String,
			}
		}

		// Build User object if data exists
		if userName.Valid {
			editRequest.User = &domain.User{
				Id:    editRequest.UserId,
				Name:  userName.String,
				Photo: userPhoto.String,
			}
		}

		editRequests = append(editRequests, editRequest)
	}

	return editRequests
}

func (repository *CompanyEditRequestRepositoryImpl) HasPendingEdit(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) bool {
	SQL := `SELECT COUNT(*) FROM company_edit_requests WHERE company_id = $1 AND status = 'pending'`

	var count int
	err := tx.QueryRowContext(ctx, SQL, companyId).Scan(&count)
	helper.PanicIfError(err)

	return count > 0
}

func (repository *CompanyEditRequestRepositoryImpl) GetStatsByStatus(ctx context.Context, tx *sql.Tx) map[string]int {
	SQL := `SELECT status, COUNT(*) FROM company_edit_requests GROUP BY status`

	rows, err := tx.QueryContext(ctx, SQL)
	helper.PanicIfError(err)
	defer rows.Close()

	stats := make(map[string]int)
	for rows.Next() {
		var status string
		var count int
		err := rows.Scan(&status, &count)
		helper.PanicIfError(err)
		stats[status] = count
	}

	// Calculate total
	total := 0
	for _, count := range stats {
		total += count
	}
	stats["total"] = total

	return stats
}
