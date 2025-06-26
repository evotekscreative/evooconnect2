package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type CompanyJoinRequestRepositoryImpl struct {
}

func NewCompanyJoinRequestRepository() CompanyJoinRequestRepository {
	return &CompanyJoinRequestRepositoryImpl{}
}

func (repository *CompanyJoinRequestRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, request domain.CompanyJoinRequest) domain.CompanyJoinRequest {
	SQL := `INSERT INTO company_join_requests (id, user_id, company_id, message, status, requested_at, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := tx.ExecContext(ctx, SQL,
		request.Id,
		request.UserId,
		request.CompanyId,
		request.Message,
		request.Status,
		request.RequestedAt,
		request.CreatedAt,
		request.UpdatedAt,
	)
	helper.PanicIfError(err)

	return request
}

func (repository *CompanyJoinRequestRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.CompanyJoinRequest, error) {
	SQL := `SELECT id, user_id, company_id, message, status, requested_at, 
            COALESCE(responsed_at, '1970-01-01'::timestamp) as responsed_at,
            response_by, rejection_reason, created_at, updated_at
            FROM company_join_requests WHERE id = $1`

	rows, err := tx.QueryContext(ctx, SQL, id)
	if err != nil {
		return domain.CompanyJoinRequest{}, err
	}
	defer rows.Close()

	request := domain.CompanyJoinRequest{}
	if rows.Next() {
		var responsedAt time.Time
		err := rows.Scan(
			&request.Id,
			&request.UserId,
			&request.CompanyId,
			&request.Message,
			&request.Status,
			&request.RequestedAt,
			&responsedAt,
			&request.ResponseBy,
			&request.RejectionReason,
			&request.CreatedAt,
			&request.UpdatedAt,
		)
		if err != nil {
			return domain.CompanyJoinRequest{}, err
		}

		// Handle null responsed_at
		if responsedAt.Year() > 1970 {
			request.ResponsedAt = &responsedAt
		}

		return request, nil
	} else {
		return request, sql.ErrNoRows
	}
}

func (repository *CompanyJoinRequestRepositoryImpl) FindByUserIdAndCompanyId(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) (domain.CompanyJoinRequest, error) {
	SQL := `SELECT id, user_id, company_id, message, status, requested_at, 
			COALESCE(responsed_at, '1970-01-01'::timestamp) as responsed_at,
			response_by, rejection_reason, created_at, updated_at
			FROM company_join_requests 
			WHERE user_id = $1 AND company_id = $2 
			ORDER BY created_at DESC LIMIT 1`

	rows, err := tx.QueryContext(ctx, SQL, userId, companyId)
	if err != nil {
		return domain.CompanyJoinRequest{}, err
	}
	defer rows.Close()

	request := domain.CompanyJoinRequest{}
	if rows.Next() {
		var responsedAt time.Time
		err := rows.Scan(
			&request.Id,
			&request.UserId,
			&request.CompanyId,
			&request.Message,
			&request.Status,
			&request.RequestedAt,
			&responsedAt,
			&request.ResponseBy,
			&request.RejectionReason,
			&request.CreatedAt,
			&request.UpdatedAt,
		)
		if err != nil {
			return domain.CompanyJoinRequest{}, err
		}

		if responsedAt.Year() > 1970 {
			request.ResponsedAt = &responsedAt
		}

		fmt.Printf("Found join request: %+v\n", request)

		return request, nil
	} else {
		// Return a custom error or nil if no rows is an expected condition
		return domain.CompanyJoinRequest{}, nil
	}
}

func (repository *CompanyJoinRequestRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) []domain.CompanyJoinRequest {
	SQL := `SELECT cjr.id, cjr.user_id, cjr.company_id, cjr.message, cjr.status, 
            cjr.requested_at, COALESCE(cjr.responsed_at, '1970-01-01'::timestamp) as responsed_at,
            cjr.response_by, cjr.rejection_reason, cjr.created_at, cjr.updated_at,
            c.name, COALESCE(c.logo, '') as logo, c.industry, COALESCE(c.website, '') as website
            FROM company_join_requests cjr
            JOIN companies c ON cjr.company_id = c.id
            WHERE cjr.user_id = $1
            ORDER BY cjr.created_at DESC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var requests []domain.CompanyJoinRequest
	for rows.Next() {
		request := domain.CompanyJoinRequest{}
		company := domain.Company{}
		var responsedAt time.Time

		err := rows.Scan(
			&request.Id,
			&request.UserId,
			&request.CompanyId,
			&request.Message,
			&request.Status,
			&request.RequestedAt,
			&responsedAt,
			&request.ResponseBy,
			&request.RejectionReason,
			&request.CreatedAt,
			&request.UpdatedAt,
			&company.Name,
			&company.Logo,
			&company.Industry,
			&company.Website,
		)
		helper.PanicIfError(err)

		if responsedAt.Year() > 1970 {
			request.ResponsedAt = &responsedAt
		}

		company.Id = request.CompanyId
		request.Company = &company
		requests = append(requests, request)
	}

	return requests
}

func (repository *CompanyJoinRequestRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status string, limit, offset int) []domain.CompanyJoinRequest {
	SQL := `SELECT cjr.id, cjr.user_id, cjr.company_id, cjr.message, cjr.status, 
            cjr.requested_at, COALESCE(cjr.responsed_at, '1970-01-01'::timestamp) as responsed_at,
            cjr.response_by, cjr.rejection_reason, cjr.created_at, cjr.updated_at,
            u.name, u.username, COALESCE(u.photo, '') as photo, COALESCE(u.headline, '') as headline
            FROM company_join_requests cjr
            JOIN users u ON cjr.user_id = u.id
            WHERE cjr.company_id = $1`

	args := []interface{}{companyId}
	argCount := 1

	if status != "" {
		SQL += ` AND cjr.status = $` + strconv.Itoa(argCount+1)
		args = append(args, status)
		argCount++
	}

	SQL += ` ORDER BY cjr.created_at DESC LIMIT $` + strconv.Itoa(argCount+1) + ` OFFSET $` + strconv.Itoa(argCount+2)
	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, SQL, args...)
	helper.PanicIfError(err)
	defer rows.Close()

	var requests []domain.CompanyJoinRequest
	for rows.Next() {
		request := domain.CompanyJoinRequest{}
		user := domain.User{}
		var responsedAt time.Time

		err := rows.Scan(
			&request.Id,
			&request.UserId,
			&request.CompanyId,
			&request.Message,
			&request.Status,
			&request.RequestedAt,
			&responsedAt,
			&request.ResponseBy,
			&request.RejectionReason,
			&request.CreatedAt,
			&request.UpdatedAt,
			&user.Name,
			&user.Username,
			&user.Photo,
			&user.Headline,
		)
		helper.PanicIfError(err)

		if responsedAt.Year() > 1970 {
			request.ResponsedAt = &responsedAt
		}

		user.Id = request.UserId
		request.User = &user
		requests = append(requests, request)
	}

	return requests
}

func (repository *CompanyJoinRequestRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, request domain.CompanyJoinRequest) domain.CompanyJoinRequest {
	SQL := `UPDATE company_join_requests 
            SET status = $2, responsed_at = $3, response_by = $4, rejection_reason = $5, updated_at = $6
            WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL,
		request.Id,
		request.Status,
		request.ResponsedAt,
		request.ResponseBy,
		request.RejectionReason,
		request.UpdatedAt,
	)
	helper.PanicIfError(err)

	return request
}

func (repository *CompanyJoinRequestRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID) {
	SQL := "DELETE FROM company_join_requests WHERE id = $1"
	_, err := tx.ExecContext(ctx, SQL, id)
	helper.PanicIfError(err)
}

func (repository *CompanyJoinRequestRepositoryImpl) CountPendingByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) int {
	SQL := "SELECT COUNT(*) FROM company_join_requests WHERE company_id = $1 AND status = 'pending'"

	var count int
	err := tx.QueryRowContext(ctx, SQL, companyId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *CompanyJoinRequestRepositoryImpl) IsPendingJoinRequest(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) bool {
	SQL := `SELECT COUNT(*) FROM company_join_requests 
			WHERE user_id = $1 AND company_id = $2 AND status = 'pending'`

	var count int
	err := tx.QueryRowContext(ctx, SQL, userId, companyId).Scan(&count)
	helper.PanicIfError(err)

	return count > 0
}
