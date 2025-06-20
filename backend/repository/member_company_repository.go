package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/entity"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type MemberCompanyRepository interface {
	Create(ctx context.Context, tx *sql.Tx, memberCompany entity.MemberCompany) (entity.MemberCompany, error)
	Update(ctx context.Context, tx *sql.Tx, memberCompany entity.MemberCompany) (entity.MemberCompany, error)
	Delete(ctx context.Context, tx *sql.Tx, memberCompanyID uuid.UUID) error
	FindByID(ctx context.Context, tx *sql.Tx, memberCompanyID uuid.UUID) (entity.MemberCompany, error)
	FindByUserAndCompany(ctx context.Context, tx *sql.Tx, userID, companyID uuid.UUID) (entity.MemberCompany, error)
	FindByCompanyID(ctx context.Context, tx *sql.Tx, companyID uuid.UUID, limit, offset int) ([]entity.MemberCompany, int, error)
	FindByUserID(ctx context.Context, tx *sql.Tx, userID uuid.UUID, limit, offset int) ([]entity.MemberCompany, int, error)
	IsUserMemberOfCompany(ctx context.Context, tx *sql.Tx, userID, companyID uuid.UUID) (bool, error)
	GetUserRoleInCompany(ctx context.Context, tx *sql.Tx, userID, companyID uuid.UUID) (entity.MemberCompanyRole, error)
	CountByCompanyID(ctx context.Context, tx *sql.Tx, companyID uuid.UUID) (int, error)
	CountByRole(ctx context.Context, tx *sql.Tx, companyID uuid.UUID, role entity.MemberCompanyRole) (int, error)
	FindByCompanyIdAndRoles(ctx context.Context, tx *sql.Tx, companyID uuid.UUID, roles []entity.MemberCompanyRole, limit, offset int) ([]entity.MemberCompany, int, error)
}

type memberCompanyRepositoryImpl struct{}

func NewMemberCompanyRepository() MemberCompanyRepository {
	return &memberCompanyRepositoryImpl{}
}

func (repository *memberCompanyRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, memberCompany entity.MemberCompany) (entity.MemberCompany, error) {
	memberCompany.ID = uuid.New()
	memberCompany.CreatedAt = time.Now()
	memberCompany.UpdatedAt = time.Now()

	query := `
        INSERT INTO member_company (id, user_id, company_id, role, status, joined_at, left_at, approved_by, approved_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `

	_, err := tx.ExecContext(ctx, query,
		memberCompany.ID,
		memberCompany.UserID,
		memberCompany.CompanyID,
		memberCompany.Role,
		memberCompany.Status,
		memberCompany.JoinedAt,
		memberCompany.LeftAt,
		memberCompany.ApprovedBy,
		memberCompany.ApprovedAt,
		memberCompany.CreatedAt,
		memberCompany.UpdatedAt,
	)

	if err != nil {
		return entity.MemberCompany{}, fmt.Errorf("failed to create member company: %w", err)
	}

	return memberCompany, nil
}

func (repository *memberCompanyRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, memberCompany entity.MemberCompany) (entity.MemberCompany, error) {
	memberCompany.UpdatedAt = time.Now()

	query := `
        UPDATE member_company 
        SET role = $2, status = $3, joined_at = $4, left_at = $5, approved_by = $6, approved_at = $7, updated_at = $8
        WHERE id = $1
    `

	result, err := tx.ExecContext(ctx, query,
		memberCompany.ID,
		memberCompany.Role,
		memberCompany.Status,
		memberCompany.JoinedAt,
		memberCompany.LeftAt,
		memberCompany.ApprovedBy,
		memberCompany.ApprovedAt,
		memberCompany.UpdatedAt,
	)

	if err != nil {
		return entity.MemberCompany{}, fmt.Errorf("failed to update member company: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return entity.MemberCompany{}, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return entity.MemberCompany{}, fmt.Errorf("member company not found")
	}

	return memberCompany, nil
}

func (repository *memberCompanyRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, memberCompanyID uuid.UUID) error {
	query := `DELETE FROM member_company WHERE id = $1`

	result, err := tx.ExecContext(ctx, query, memberCompanyID)
	if err != nil {
		return fmt.Errorf("failed to delete member company: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("member company not found")
	}

	return nil
}

func (repository *memberCompanyRepositoryImpl) FindByID(ctx context.Context, tx *sql.Tx, memberCompanyID uuid.UUID) (entity.MemberCompany, error) {
	query := `
        SELECT mc.id, mc.user_id, mc.company_id, mc.role, mc.status, mc.joined_at, mc.left_at, mc.approved_by, mc.approved_at, mc.created_at, mc.updated_at,
               u.id, u.name, u.email, u.username, COALESCE(u.photo, '') as photo,
               c.id, c.name, COALESCE(c.linkedin_url, '') as linkedin_url, COALESCE(c.website, '') as website, 
               c.industry, c.size, c.type, COALESCE(c.logo, '') as logo, COALESCE(c.tagline, '') as tagline, c.is_verified
        FROM member_company mc
        LEFT JOIN users u ON mc.user_id = u.id
        LEFT JOIN companies c ON mc.company_id = c.id
        WHERE mc.id = $1
    `

	var memberCompany entity.MemberCompany
	var user domain.User
	var company domain.Company

	err := tx.QueryRowContext(ctx, query, memberCompanyID).Scan(
		&memberCompany.ID, &memberCompany.UserID, &memberCompany.CompanyID, &memberCompany.Role, &memberCompany.Status,
		&memberCompany.JoinedAt, &memberCompany.LeftAt, &memberCompany.ApprovedBy, &memberCompany.ApprovedAt,
		&memberCompany.CreatedAt, &memberCompany.UpdatedAt,
		&user.Id, &user.Name, &user.Email, &user.Username, &user.Photo,
		&company.Id, &company.Name, &company.LinkedinUrl, &company.Website, &company.Industry, &company.Size,
		&company.Type, &company.Logo, &company.Tagline, &company.IsVerified,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return entity.MemberCompany{}, fmt.Errorf("member company not found")
		}
		return entity.MemberCompany{}, fmt.Errorf("failed to find member company: %w", err)
	}

	memberCompany.User = &user
	memberCompany.Company = &company

	return memberCompany, nil
}

func (repository *memberCompanyRepositoryImpl) FindByUserAndCompany(ctx context.Context, tx *sql.Tx, userID, companyID uuid.UUID) (entity.MemberCompany, error) {
	query := `
        SELECT id, user_id, company_id, role, status, joined_at, left_at, approved_by, approved_at, created_at, updated_at
        FROM member_company
        WHERE user_id = $1 AND company_id = $2
    `

	var memberCompany entity.MemberCompany

	err := tx.QueryRowContext(ctx, query, userID, companyID).Scan(
		&memberCompany.ID, &memberCompany.UserID, &memberCompany.CompanyID, &memberCompany.Role, &memberCompany.Status,
		&memberCompany.JoinedAt, &memberCompany.LeftAt, &memberCompany.ApprovedBy, &memberCompany.ApprovedAt,
		&memberCompany.CreatedAt, &memberCompany.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return entity.MemberCompany{}, fmt.Errorf("member company not found")
		}
		return entity.MemberCompany{}, fmt.Errorf("failed to find member company: %w", err)
	}

	return memberCompany, nil
}

func (repository *memberCompanyRepositoryImpl) FindByCompanyID(ctx context.Context, tx *sql.Tx, companyID uuid.UUID, limit, offset int) ([]entity.MemberCompany, int, error) {
	query := `
        SELECT mc.id, mc.user_id, mc.company_id, mc.role, mc.status, mc.joined_at, mc.left_at, mc.approved_by, mc.approved_at, mc.created_at, mc.updated_at,
               u.id, u.name, u.email, u.username, COALESCE(u.photo, '') as photo
        FROM member_company mc
        LEFT JOIN users u ON mc.user_id = u.id
        WHERE mc.company_id = $1
        ORDER BY mc.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, query, companyID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find members by company: %w", err)
	}
	defer rows.Close()

	var members []entity.MemberCompany

	for rows.Next() {
		var memberCompany entity.MemberCompany
		var user domain.User

		err := rows.Scan(
			&memberCompany.ID, &memberCompany.UserID, &memberCompany.CompanyID, &memberCompany.Role, &memberCompany.Status,
			&memberCompany.JoinedAt, &memberCompany.LeftAt, &memberCompany.ApprovedBy, &memberCompany.ApprovedAt,
			&memberCompany.CreatedAt, &memberCompany.UpdatedAt,
			&user.Id, &user.Name, &user.Email, &user.Username, &user.Photo,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan member company: %w", err)
		}

		memberCompany.User = &user
		members = append(members, memberCompany)
	}

	// Get total count
	countQuery := `SELECT COUNT(*) FROM member_company WHERE company_id = $1`
	var total int
	err = tx.QueryRowContext(ctx, countQuery, companyID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count members: %w", err)
	}

	return members, total, nil
}

func (repository *memberCompanyRepositoryImpl) FindByUserID(ctx context.Context, tx *sql.Tx, userID uuid.UUID, limit, offset int) ([]entity.MemberCompany, int, error) {
	query := `
        SELECT mc.id, mc.user_id, mc.company_id, mc.role, mc.status, mc.joined_at, mc.left_at, mc.approved_by, mc.approved_at, mc.created_at, mc.updated_at,
               c.id, c.name, COALESCE(c.linkedin_url, '') as linkedin_url, COALESCE(c.website, '') as website, 
               c.industry, c.size, c.type, COALESCE(c.logo, '') as logo, COALESCE(c.tagline, '') as tagline, c.is_verified
        FROM member_company mc
        LEFT JOIN companies c ON mc.company_id = c.id
        WHERE mc.user_id = $1
        ORDER BY mc.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find companies by user: %w", err)
	}
	defer rows.Close()

	var members []entity.MemberCompany

	for rows.Next() {
		var memberCompany entity.MemberCompany
		var company domain.Company

		err := rows.Scan(
			&memberCompany.ID, &memberCompany.UserID, &memberCompany.CompanyID, &memberCompany.Role, &memberCompany.Status,
			&memberCompany.JoinedAt, &memberCompany.LeftAt, &memberCompany.ApprovedBy, &memberCompany.ApprovedAt,
			&memberCompany.CreatedAt, &memberCompany.UpdatedAt,
			&company.Id, &company.Name, &company.LinkedinUrl, &company.Website, &company.Industry, &company.Size,
			&company.Type, &company.Logo, &company.Tagline, &company.IsVerified,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan member company: %w", err)
		}

		memberCompany.Company = &company
		members = append(members, memberCompany)
	}

	// Get total count
	countQuery := `SELECT COUNT(*) FROM member_company WHERE user_id = $1`
	var total int
	err = tx.QueryRowContext(ctx, countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count companies: %w", err)
	}

	return members, total, nil
}

func (repository *memberCompanyRepositoryImpl) IsUserMemberOfCompany(ctx context.Context, tx *sql.Tx, userID, companyID uuid.UUID) (bool, error) {
	query := `SELECT COUNT(*) FROM member_company WHERE user_id = $1 AND company_id = $2 AND status = 'active'`

	var count int
	err := tx.QueryRowContext(ctx, query, userID, companyID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check membership: %w", err)
	}

	return count > 0, nil
}

func (repository *memberCompanyRepositoryImpl) GetUserRoleInCompany(ctx context.Context, tx *sql.Tx, userID, companyID uuid.UUID) (entity.MemberCompanyRole, error) {
	query := `SELECT role FROM member_company WHERE user_id = $1 AND company_id = $2 AND status = 'active'`

	var role entity.MemberCompanyRole
	err := tx.QueryRowContext(ctx, query, userID, companyID).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("user is not a member of this company")
		}
		return "", fmt.Errorf("failed to get user role: %w", err)
	}

	return role, nil
}

func (repository *memberCompanyRepositoryImpl) CountByCompanyID(ctx context.Context, tx *sql.Tx, companyID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM member_company WHERE company_id = $1 AND status = 'active'`

	var count int
	err := tx.QueryRowContext(ctx, query, companyID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count members: %w", err)
	}

	return count, nil
}

func (repository *memberCompanyRepositoryImpl) CountByRole(ctx context.Context, tx *sql.Tx, companyID uuid.UUID, role entity.MemberCompanyRole) (int, error) {
	query := `SELECT COUNT(*) FROM member_company WHERE company_id = $1 AND role = $2 AND status = 'active'`

	var count int
	err := tx.QueryRowContext(ctx, query, companyID, role).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count members by role: %w", err)
	}

	return count, nil
}

func (repository *memberCompanyRepositoryImpl) FindByCompanyIdAndRoles(ctx context.Context, tx *sql.Tx, companyID uuid.UUID, roles []entity.MemberCompanyRole, limit, offset int) ([]entity.MemberCompany, int, error) {
	// Convert []entity.MemberCompanyRole to []string for PostgreSQL compatibility
	roleStrings := make([]string, len(roles))
	for i, role := range roles {
		roleStrings[i] = string(role)
	}

	query := `
        SELECT mc.id, mc.user_id, mc.company_id, mc.role, mc.status, mc.joined_at, mc.left_at, mc.approved_by, mc.approved_at, mc.created_at, mc.updated_at,
               u.id, u.name, u.email, u.username, COALESCE(u.photo, '') as photo
        FROM member_company mc
        LEFT JOIN users u ON mc.user_id = u.id
        WHERE mc.company_id = $1 AND mc.role = ANY($2) AND mc.status = 'active'
        ORDER BY mc.created_at DESC
        LIMIT $3 OFFSET $4
    `

	rows, err := tx.QueryContext(ctx, query, companyID, pq.Array(roleStrings), limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find members by company and roles: %w", err)
	}
	defer rows.Close()

	var members []entity.MemberCompany

	for rows.Next() {
		var memberCompany entity.MemberCompany
		var user domain.User

		err := rows.Scan(
			&memberCompany.ID, &memberCompany.UserID, &memberCompany.CompanyID, &memberCompany.Role, &memberCompany.Status,
			&memberCompany.JoinedAt, &memberCompany.LeftAt, &memberCompany.ApprovedBy, &memberCompany.ApprovedAt,
			&memberCompany.CreatedAt, &memberCompany.UpdatedAt,
			&user.Id, &user.Name, &user.Email, &user.Username, &user.Photo,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan member company: %w", err)
		}

		memberCompany.User = &user
		members = append(members, memberCompany)
	}

	// Get total count
	countQuery := `SELECT COUNT(*) FROM member_company WHERE company_id = $1 AND role = ANY($2) AND status = 'active'`
	var total int
	err = tx.QueryRowContext(ctx, countQuery, companyID, pq.Array(roleStrings)).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count members by company and roles: %w", err)
	}

	return members, total, nil
}
