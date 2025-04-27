package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type PostRepositoryImpl struct {
}

func NewPostRepository() PostRepository {
	return &PostRepositoryImpl{}
}

func (repository *PostRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, post domain.Post) domain.Post {
	// Generate a new UUID if not provided
	if post.Id == uuid.Nil {
		post.Id = uuid.New()
	}

	SQL := `INSERT INTO posts
        (id, user_id, content, images, visibility, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := tx.ExecContext(ctx, SQL,
		post.Id,
		post.UserId,
		post.Content,
		post.Images,
		post.Visibility,
		post.CreatedAt,
		post.UpdatedAt)
	helper.PanicIfError(err)

	return post
}

func (repository *PostRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, post domain.Post) domain.Post {
	SQL := `UPDATE posts SET 
        content = $1, 
        images = $2,
        visibility = $3,
        updated_at = $4
        WHERE id = $5`

	_, err := tx.ExecContext(ctx, SQL,
		post.Content,
		post.Images,
		post.Visibility,
		time.Now(),
		post.Id)
	helper.PanicIfError(err)

	return post
}

func (repository *PostRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, postId uuid.UUID) {
	SQL := "DELETE FROM posts WHERE id = $1"
	_, err := tx.ExecContext(ctx, SQL, postId)
	helper.PanicIfError(err)
}

func (repository *PostRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.Post, error) {
	SQL := `SELECT 
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, '')
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, postId)
	helper.PanicIfError(err)
	defer rows.Close()

	post := domain.Post{}
	user := domain.User{}

	if rows.Next() {
		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline)
		helper.PanicIfError(err)

		post.User = &user
		return post, nil
	} else {
		return post, errors.New("post not found")
	}
}

func (repository *PostRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.Post {
	SQL := `SELECT 
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, '')
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var posts []domain.Post

	for rows.Next() {
		post := domain.Post{}
		user := domain.User{}

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline)
		helper.PanicIfError(err)

		post.User = &user
		posts = append(posts, post)
	}

	return posts
}

func (repository *PostRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) []domain.Post {
	SQL := `SELECT 
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, '')
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var posts []domain.Post

	for rows.Next() {
		post := domain.Post{}
		user := domain.User{}

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline)
		helper.PanicIfError(err)

		post.User = &user
		posts = append(posts, post)
	}

	return posts
}

func (repository *PostRepositoryImpl) LikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error {
	// Check if the like already exists
	if repository.IsLiked(ctx, tx, postId, userId) {
		return errors.New("post already liked")
	}

	// Insert the like
	SQL := `INSERT INTO post_likes (id, post_id, user_id, created_at) VALUES ($1, $2, $3, $4)`
	_, err := tx.ExecContext(ctx, SQL, uuid.New(), postId, userId, time.Now())
	helper.PanicIfError(err)

	return nil
}

func (repository *PostRepositoryImpl) UnlikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error {
	// Check if the like exists
	if !repository.IsLiked(ctx, tx, postId, userId) {
		return errors.New("post not liked yet")
	}

	// Delete the like
	SQL := `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`
	_, err := tx.ExecContext(ctx, SQL, postId, userId)
	helper.PanicIfError(err)

	return nil
}

func (repository *PostRepositoryImpl) IsLiked(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) bool {
	SQL := `SELECT COUNT(*) FROM post_likes WHERE post_id = $1 AND user_id = $2`

	var count int
	err := tx.QueryRowContext(ctx, SQL, postId, userId).Scan(&count)
	helper.PanicIfError(err)

	return count > 0
}

func (repository *PostRepositoryImpl) GetLikesCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) int {
	SQL := `SELECT COUNT(*) FROM post_likes WHERE post_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, postId).Scan(&count)
	helper.PanicIfError(err)

	return count
}
