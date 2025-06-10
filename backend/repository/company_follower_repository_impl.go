package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type CompanyFollowerRepositoryImpl struct{}

func NewCompanyFollowerRepository() CompanyFollowerRepository {
	return &CompanyFollowerRepositoryImpl{}
}

func (repository *CompanyFollowerRepositoryImpl) Follow(ctx context.Context, tx *sql.Tx, follower domain.CompanyFollower) domain.CompanyFollower {
	if follower.Id == uuid.Nil {
		follower.Id = uuid.New()
	}

	if follower.CreatedAt.IsZero() {
		follower.CreatedAt = time.Now()
	}

	SQL := `INSERT INTO company_followers (id, company_id, user_id, created_at) 
            VALUES ($1, $2, $3, $4)`

	_, err := tx.ExecContext(ctx, SQL, follower.Id, follower.CompanyId, follower.UserId, follower.CreatedAt)
	helper.PanicIfError(err)

	return follower
}

func (repository *CompanyFollowerRepositoryImpl) Unfollow(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) error {
	SQL := `DELETE FROM company_followers WHERE user_id = $1 AND company_id = $2`

	result, err := tx.ExecContext(ctx, SQL, userId, companyId)
	if err != nil {
		return fmt.Errorf("failed to unfollow company: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("follow relationship not found")
	}

	return nil
}

func (repository *CompanyFollowerRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.CompanyFollower, error) {
	SQL := `SELECT cf.id, cf.company_id, cf.user_id, cf.created_at,
                   c.name as company_name, c.logo as company_logo,
                   u.name as user_name, u.username as user_username, u.avatar as user_avatar
            FROM company_followers cf
            LEFT JOIN companies c ON cf.company_id = c.id
            LEFT JOIN users u ON cf.user_id = u.id
            WHERE cf.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, id)
	if err != nil {
		return domain.CompanyFollower{}, fmt.Errorf("failed to find company follower: %w", err)
	}
	defer rows.Close()

	var follower domain.CompanyFollower
	var companyName, companyLogo, userName, userUsername, userAvatar sql.NullString

	if rows.Next() {
		err := rows.Scan(
			&follower.Id, &follower.CompanyId, &follower.UserId, &follower.CreatedAt,
			&companyName, &companyLogo, &userName, &userUsername, &userAvatar,
		)
		if err != nil {
			return domain.CompanyFollower{}, fmt.Errorf("failed to scan company follower: %w", err)
		}

		// Set company info if available
		if companyName.Valid {
			follower.Company = &domain.Company{
				Id:   follower.CompanyId,
				Name: companyName.String,
				Logo: companyLogo.String,
			}
		}

		// Set user info if available
		if userName.Valid {
			follower.User = &domain.UserBasicInfo{
				Id:       follower.UserId,
				Name:     userName.String,
				Username: userUsername.String,
				Avatar:   userAvatar.String,
			}
		}

		return follower, nil
	}

	return domain.CompanyFollower{}, fmt.Errorf("company follower not found")
}

func (repository *CompanyFollowerRepositoryImpl) FindByUserIdAndCompanyId(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) (domain.CompanyFollower, error) {
	SQL := `SELECT id, company_id, user_id, created_at
            FROM company_followers 
            WHERE user_id = $1 AND company_id = $2`

	rows, err := tx.QueryContext(ctx, SQL, userId, companyId)
	if err != nil {
		return domain.CompanyFollower{}, fmt.Errorf("failed to find company follower: %w", err)
	}
	defer rows.Close()

	var follower domain.CompanyFollower
	if rows.Next() {
		err := rows.Scan(&follower.Id, &follower.CompanyId, &follower.UserId, &follower.CreatedAt)
		if err != nil {
			return domain.CompanyFollower{}, fmt.Errorf("failed to scan company follower: %w", err)
		}
		return follower, nil
	}

	return domain.CompanyFollower{}, fmt.Errorf("company follower not found")
}

func (repository *CompanyFollowerRepositoryImpl) FindFollowersByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) ([]domain.CompanyFollower, int, error) {
	// First, get the total count
	countQuery := `SELECT COUNT(*) FROM company_followers WHERE company_id = $1`
	var total int
	err := tx.QueryRowContext(ctx, countQuery, companyId).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count followers: %w", err)
	}

	// Get the followers with user and company details
	query := `
        SELECT 
            cf.id, cf.company_id, cf.user_id, cf.created_at,
            u.id, u.name, u.username, u.photo,
            c.id, c.name, c.logo
        FROM company_followers cf
        LEFT JOIN users u ON cf.user_id = u.id
        LEFT JOIN companies c ON cf.company_id = c.id
        WHERE cf.company_id = $1
        ORDER BY cf.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, query, companyId, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query followers: %w", err)
	}
	defer rows.Close()

	var followers []domain.CompanyFollower
	for rows.Next() {
		var follower domain.CompanyFollower
		var user domain.UserBasicInfo
		var company domain.Company

		// Variables for nullable fields
		var userPhoto sql.NullString
		var companyLogo sql.NullString

		err := rows.Scan(
			&follower.Id, &follower.CompanyId, &follower.UserId, &follower.CreatedAt,
			&user.Id, &user.Name, &user.Username, &userPhoto,
			&company.Id, &company.Name, &companyLogo,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan follower: %w", err)
		}

		// Set nullable fields
		if userPhoto.Valid {
			user.Avatar = userPhoto.String
		}
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}

		// Attach relations
		follower.User = &user
		follower.Company = &company

		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating followers: %w", err)
	}

	return followers, total, nil
}

func (repository *CompanyFollowerRepositoryImpl) FindFollowingByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.CompanyFollower, int, error) {
	// Get total count
	countSQL := `SELECT COUNT(*) FROM company_followers WHERE user_id = $1`
	var total int
	err := tx.QueryRowContext(ctx, countSQL, userId).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count following companies: %w", err)
	}

	// Get following companies
	SQL := `SELECT cf.id, cf.company_id, cf.user_id, cf.created_at,
                   c.name as company_name, c.logo as company_logo
            FROM company_followers cf
            LEFT JOIN companies c ON cf.company_id = c.id
            WHERE cf.user_id = $1
            ORDER BY cf.created_at DESC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find following companies: %w", err)
	}
	defer rows.Close()

	var following []domain.CompanyFollower
	for rows.Next() {
		var follower domain.CompanyFollower
		var companyName, companyLogo sql.NullString

		err := rows.Scan(
			&follower.Id, &follower.CompanyId, &follower.UserId, &follower.CreatedAt,
			&companyName, &companyLogo,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan following company: %w", err)
		}

		// Set company info if available
		if companyName.Valid {
			follower.Company = &domain.Company{
				Id:   follower.CompanyId,
				Name: companyName.String,
				Logo: companyLogo.String,
			}
		}

		following = append(following, follower)
	}

	return following, total, nil
}

func (repository *CompanyFollowerRepositoryImpl) IsFollowing(ctx context.Context, tx *sql.Tx, userId, companyId uuid.UUID) bool {
	SQL := `SELECT EXISTS(SELECT 1 FROM company_followers WHERE user_id = $1 AND company_id = $2)`

	var exists bool
	err := tx.QueryRowContext(ctx, SQL, userId, companyId).Scan(&exists)
	if err != nil {
		return false
	}

	return exists
}

func (repository *CompanyFollowerRepositoryImpl) CountFollowersByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) int {
	SQL := `SELECT COUNT(*) FROM company_followers WHERE company_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, companyId).Scan(&count)
	if err != nil {
		return 0
	}

	return count
}

func (repository *CompanyFollowerRepositoryImpl) CountFollowingByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) int {
	SQL := `SELECT COUNT(*) FROM company_followers WHERE user_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, userId).Scan(&count)
	if err != nil {
		return 0
	}

	return count
}

func (repository *CompanyFollowerRepositoryImpl) GetFollowStatusForCompanies(ctx context.Context, tx *sql.Tx, userId uuid.UUID, companyIds []uuid.UUID) map[uuid.UUID]bool {
	if len(companyIds) == 0 {
		return make(map[uuid.UUID]bool)
	}

	SQL := `SELECT company_id FROM company_followers WHERE user_id = $1 AND company_id = ANY($2)`

	rows, err := tx.QueryContext(ctx, SQL, userId, pq.Array(companyIds))
	if err != nil {
		return make(map[uuid.UUID]bool)
	}
	defer rows.Close()

	result := make(map[uuid.UUID]bool)

	// Initialize all as false
	for _, companyId := range companyIds {
		result[companyId] = false
	}

	// Set followed companies as true
	for rows.Next() {
		var companyId uuid.UUID
		if err := rows.Scan(&companyId); err == nil {
			result[companyId] = true
		}
	}

	return result
}
