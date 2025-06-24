package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type companyPostRepositoryImpl struct{}

func NewCompanyPostRepository() CompanyPostRepository {
	return &companyPostRepositoryImpl{}
}

func (repository *companyPostRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, post domain.CompanyPost) (domain.CompanyPost, error) {
	post.Id = uuid.New()
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()

	query := `
        INSERT INTO company_posts (id, company_id, creator_id, title, content, images, status, visibility, is_announcement, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `

	_, err := tx.ExecContext(ctx, query,
		post.Id,
		post.CompanyId,
		post.CreatorId,
		post.Title,
		post.Content,
		pq.Array(post.Images),
		post.Status,
		post.Visibility,
		post.IsAnnouncement,
		post.CreatedAt,
		post.UpdatedAt,
	)

	if err != nil {
		return domain.CompanyPost{}, fmt.Errorf("failed to create company post: %w", err)
	}

	return post, nil
}

func (repository *companyPostRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, post domain.CompanyPost) (domain.CompanyPost, error) {
	post.UpdatedAt = time.Now()

	query := `
        UPDATE company_posts 
        SET title = $2, content = $3, images = $4, status = $5, visibility = $6, is_announcement = $7, updated_at = $8
        WHERE id = $1
    `

	result, err := tx.ExecContext(ctx, query,
		post.Id,
		post.Title,
		post.Content,
		pq.Array(post.Images),
		post.Status,
		post.Visibility,
		post.IsAnnouncement,
		post.UpdatedAt,
	)

	if err != nil {
		return domain.CompanyPost{}, fmt.Errorf("failed to update company post: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return domain.CompanyPost{}, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return domain.CompanyPost{}, fmt.Errorf("company post not found")
	}

	return post, nil
}

func (repository *companyPostRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, postId uuid.UUID) error {
	query := `DELETE FROM company_posts WHERE id = $1`

	result, err := tx.ExecContext(ctx, query, postId)
	if err != nil {
		return fmt.Errorf("failed to delete company post: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("company post not found")
	}

	return nil
}

func (repository *companyPostRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.CompanyPost, error) {
	query := `
        SELECT cp.id, cp.company_id, cp.creator_id, cp.title, cp.content, cp.images, cp.status, cp.visibility, cp.is_announcement, cp.created_at, cp.updated_at, cp.taken_down_at,
               c.id, c.name, COALESCE(c.logo, '') as logo, c.industry, c.is_verified,
               u.id, u.name, u.username, COALESCE(u.photo, '') as photo
        FROM company_posts cp
        LEFT JOIN companies c ON cp.company_id = c.id
        LEFT JOIN users u ON cp.creator_id = u.id
        WHERE cp.id = $1
    `

	var post domain.CompanyPost
	var company domain.Company
	var user domain.User
	var images pq.StringArray
	var takenDownAt sql.NullTime

	err := tx.QueryRowContext(ctx, query, postId).Scan(
		&post.Id, &post.CompanyId, &post.CreatorId, &post.Title, &post.Content, &images, &post.Status, &post.Visibility, &post.IsAnnouncement, &post.CreatedAt, &post.UpdatedAt, &takenDownAt,
		&company.Id, &company.Name, &company.Logo, &company.Industry, &company.IsVerified,
		&user.Id, &user.Name, &user.Username, &user.Photo,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return domain.CompanyPost{}, fmt.Errorf("company post not found")
		}
		return domain.CompanyPost{}, fmt.Errorf("failed to find company post: %w", err)
	}

	post.Images = []string(images)
	post.Company = &company
	post.Creator = &user

	// Set taken_down_at jika tidak null
	if takenDownAt.Valid {
		post.TakenDownAt = &takenDownAt.Time
	}

	return post, nil
}

func (repository *companyPostRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) ([]domain.CompanyPost, int, error) {
	query := `
        SELECT cp.id, cp.company_id, cp.creator_id, cp.title, cp.content, cp.images, cp.status, cp.visibility, cp.is_announcement, cp.created_at, cp.updated_at, cp.taken_down_at,
               c.id, c.name, COALESCE(c.logo, '') as logo, c.industry, c.is_verified,
               u.id, u.name, u.username, COALESCE(u.photo, '') as photo
        FROM company_posts cp
        LEFT JOIN companies c ON cp.company_id = c.id
        LEFT JOIN users u ON cp.creator_id = u.id
        WHERE cp.company_id = $1 AND cp.status = 'published' AND cp.taken_down_at IS NULL
        ORDER BY cp.is_announcement DESC, cp.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, query, companyId, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find company posts: %w", err)
	}
	defer rows.Close()

	var posts []domain.CompanyPost

	for rows.Next() {
		var post domain.CompanyPost
		var company domain.Company
		var user domain.User
		var images pq.StringArray
		var takenDownAt sql.NullTime

		err := rows.Scan(
			&post.Id, &post.CompanyId, &post.CreatorId, &post.Title, &post.Content, &images, &post.Status, &post.Visibility, &post.IsAnnouncement, &post.CreatedAt, &post.UpdatedAt, &takenDownAt,
			&company.Id, &company.Name, &company.Logo, &company.Industry, &company.IsVerified,
			&user.Id, &user.Name, &user.Username, &user.Photo,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan company post: %w", err)
		}

		post.Images = []string(images)
		post.Company = &company
		post.Creator = &user

		// Set taken_down_at jika tidak null
		if takenDownAt.Valid {
			post.TakenDownAt = &takenDownAt.Time
		}

		posts = append(posts, post)
	}

	// Get total count
	countQuery := `SELECT COUNT(*) FROM company_posts WHERE company_id = $1 AND status = 'published' AND taken_down_at IS NULL`
	var total int
	err = tx.QueryRowContext(ctx, countQuery, companyId).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count company posts: %w", err)
	}

	return posts, total, nil
}

func (repository *companyPostRepositoryImpl) FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) ([]domain.CompanyPost, int, error) {
	query := `
        SELECT cp.id, cp.company_id, cp.creator_id, cp.title, cp.content, cp.images, cp.status, cp.visibility, cp.is_announcement, cp.created_at, cp.updated_at, cp.taken_down_at,
               c.id, c.name, COALESCE(c.logo, '') as logo, c.industry, c.is_verified,
               u.id, u.name, u.username, COALESCE(u.photo, '') as photo
        FROM company_posts cp
        LEFT JOIN companies c ON cp.company_id = c.id
        LEFT JOIN users u ON cp.creator_id = u.id
        WHERE cp.creator_id = $1 AND (cp.taken_down_at IS NULL OR cp.creator_id = $1)
        ORDER BY cp.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, query, creatorId, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find posts by creator: %w", err)
	}
	defer rows.Close()

	var posts []domain.CompanyPost

	for rows.Next() {
		var post domain.CompanyPost
		var company domain.Company
		var user domain.User
		var images pq.StringArray

		err := rows.Scan(
			&post.Id, &post.CompanyId, &post.CreatorId, &post.Title, &post.Content, &images, &post.Status, &post.Visibility, &post.IsAnnouncement, &post.CreatedAt, &post.UpdatedAt,
			&company.Id, &company.Name, &company.Logo, &company.Industry, &company.IsVerified,
			&user.Id, &user.Name, &user.Username, &user.Photo,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan company post: %w", err)
		}

		post.Images = []string(images)
		post.Company = &company
		post.Creator = &user
		posts = append(posts, post)
	}

	// Get total count
	countQuery := `SELECT COUNT(*) FROM company_posts WHERE creator_id = $1`
	var total int
	err = tx.QueryRowContext(ctx, countQuery, creatorId).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count posts by creator: %w", err)
	}

	return posts, total, nil
}

func (repository *companyPostRepositoryImpl) FindWithFilters(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID, status, visibility string, creatorId *uuid.UUID, search string, limit, offset int) ([]domain.CompanyPost, int, error) {
	whereConditions := []string{}
	args := []interface{}{}
	argIndex := 1

	baseQuery := `
        SELECT cp.id, cp.company_id, cp.creator_id, cp.title, cp.content, cp.images, cp.status, cp.visibility, cp.is_announcement, cp.created_at, cp.updated_at,
               c.id, c.name, COALESCE(c.logo, '') as logo, c.industry, c.is_verified,
               u.id, u.name, u.username, COALESCE(u.photo, '') as photo
        FROM company_posts cp
        LEFT JOIN companies c ON cp.company_id = c.id
        LEFT JOIN users u ON cp.creator_id = u.id
    `

	if companyId != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("cp.company_id = $%d", argIndex))
		args = append(args, *companyId)
		argIndex++
	}

	if status != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("cp.status = $%d", argIndex))
		args = append(args, status)
		argIndex++
	}

	if visibility != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("cp.visibility = $%d", argIndex))
		args = append(args, visibility)
		argIndex++
	}

	if creatorId != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("cp.creator_id = $%d", argIndex))
		args = append(args, *creatorId)
		argIndex++
	}

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(cp.title ILIKE $%d OR cp.content ILIKE $%d)", argIndex, argIndex))
		args = append(args, "%"+search+"%")
		argIndex++
	}

	if len(whereConditions) > 0 {
		baseQuery += " WHERE " + strings.Join(whereConditions, " AND ")
	}

	query := baseQuery + fmt.Sprintf(" ORDER BY cp.is_announcement DESC, cp.created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find company posts with filters: %w", err)
	}
	defer rows.Close()

	var posts []domain.CompanyPost

	for rows.Next() {
		var post domain.CompanyPost
		var company domain.Company
		var user domain.User
		var images pq.StringArray

		err := rows.Scan(
			&post.Id, &post.CompanyId, &post.CreatorId, &post.Title, &post.Content, &images, &post.Status, &post.Visibility, &post.IsAnnouncement, &post.CreatedAt, &post.UpdatedAt,
			&company.Id, &company.Name, &company.Logo, &company.Industry, &company.IsVerified,
			&user.Id, &user.Name, &user.Username, &user.Photo,
		)

		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan company post: %w", err)
		}

		post.Images = []string(images)
		post.Company = &company
		post.Creator = &user
		posts = append(posts, post)
	}

	// Get total count with same filters
	countArgs := args[:len(args)-2] // Remove limit and offset
	countQuery := "SELECT COUNT(*) FROM company_posts cp"

	if len(whereConditions) > 0 {
		countQuery += " WHERE " + strings.Join(whereConditions, " AND ")
	}

	var total int
	err = tx.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count company posts: %w", err)
	}

	return posts, total, nil
}

func (repository *companyPostRepositoryImpl) UpdateStatus(ctx context.Context, tx *sql.Tx, postId uuid.UUID, status string) error {
	query := `UPDATE company_posts SET status = $2, updated_at = $3 WHERE id = $1`

	result, err := tx.ExecContext(ctx, query, postId, status, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update post status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("company post not found")
	}

	return nil
}

func (repository *companyPostRepositoryImpl) CountByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM company_posts WHERE company_id = $1 AND status = 'published'`

	var count int
	err := tx.QueryRowContext(ctx, query, companyId).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count company posts: %w", err)
	}

	return count, nil
}

func (repository *companyPostRepositoryImpl) IsPostLiked(ctx context.Context, tx *sql.Tx, postId, userId uuid.UUID) (bool, error) {
	query := `SELECT COUNT(*) FROM company_post_likes WHERE post_id = $1 AND user_id = $2`

	var count int
	err := tx.QueryRowContext(ctx, query, postId, userId).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check if post is liked: %w", err)
	}

	return count > 0, nil
}

// func (repository *companyPostRepositoryImpl) GetLikesCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error) {
// 	query := `SELECT COUNT(*) FROM company_post_likes WHERE post_id = $1`

// 	var count int
// 	err := tx.QueryRowContext(ctx, query, postId).Scan(&count)
// 	if err != nil {
// 		return 0, fmt.Errorf("failed to get likes count: %w", err)
// 	}

// 	return count, nil
// }

func (repository *companyPostRepositoryImpl) GetCommentsCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM company_post_comments WHERE post_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, query, postId).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get comments count: %w", err)
	}

	return count, nil
}

func (repository *companyPostRepositoryImpl) LikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error {
	query := `
        INSERT INTO company_post_likes (post_id, user_id, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (post_id, user_id) DO NOTHING
    `

	_, err := tx.ExecContext(ctx, query, postId, userId)
	if err != nil {
		return fmt.Errorf("failed to like company post: %w", err)
	}

	return nil
}

func (repository *companyPostRepositoryImpl) UnlikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error {
	query := `DELETE FROM company_post_likes WHERE post_id = $1 AND user_id = $2`

	result, err := tx.ExecContext(ctx, query, postId, userId)
	if err != nil {
		return fmt.Errorf("failed to unlike company post: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("like not found")
	}

	return nil
}

func (repository *companyPostRepositoryImpl) IsLiked(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) bool {
	query := `SELECT COUNT(*) FROM company_post_likes WHERE post_id = $1 AND user_id = $2`

	var count int
	err := tx.QueryRowContext(ctx, query, postId, userId).Scan(&count)
	if err != nil {
		return false
	}

	return count > 0
}

func (repository *companyPostRepositoryImpl) GetLikesCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) int {
	query := `SELECT COUNT(*) FROM company_post_likes WHERE post_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, query, postId).Scan(&count)
	if err != nil {
		return 0
	}

	return count
}
