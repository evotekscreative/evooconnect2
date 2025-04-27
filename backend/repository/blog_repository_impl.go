package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"fmt"
)

type BlogRepositoryImpl struct {
	DB *sql.DB
}

func NewBlogRepository(db *sql.DB) BlogRepository {
	return &BlogRepositoryImpl{DB: db}
}

func (r *BlogRepositoryImpl) Save(ctx context.Context, blog domain.Blog) domain.Blog {
	_, err := r.DB.ExecContext(ctx, `
        INSERT INTO tb_blog (id, title, slug, category, content, image, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
		blog.ID, blog.Title, blog.Slug, blog.Category, blog.Content, blog.Image, blog.UserID, blog.CreatedAt, blog.UpdatedAt,
	)
	if err != nil {
		panic(err)
	}
	return blog
}

func (r *BlogRepositoryImpl) FindAll(ctx context.Context) []domain.Blog {
	rows, err := r.DB.QueryContext(ctx, `
        SELECT id, title, slug, category, content, image, user_id, created_at, updated_at
        FROM tb_blog
    `)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var blogs []domain.Blog
	for rows.Next() {
		var blog domain.Blog
		err := rows.Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Category, &blog.Content, &blog.Image, &blog.UserID, &blog.CreatedAt, &blog.UpdatedAt)
		if err != nil {
			panic(err)
		}
		blogs = append(blogs, blog)
	}
	return blogs
}

func (r *BlogRepositoryImpl) Delete(ctx context.Context, blogID string) error {
	query := "DELETE FROM tb_blog WHERE id = $1"
	_, err := r.DB.ExecContext(ctx, query, blogID)
	if err != nil {
		return fmt.Errorf("gagal menghapus blog: %w", err)
	}
	return nil
}

func (r *BlogRepositoryImpl) FindBySlug(ctx context.Context, slug string) (domain.Blog, error) {
	query := `
        SELECT id, title, slug, category, content, image, user_id, created_at, updated_at
        FROM tb_blog
        WHERE slug = $1
        LIMIT 1
    `

	row := r.DB.QueryRowContext(ctx, query, slug)

	var blog domain.Blog
	err := row.Scan(
		&blog.ID,
		&blog.Title,
		&blog.Slug,
		&blog.Category,
		&blog.Content,
		&blog.Image,
		&blog.UserID,
		&blog.CreatedAt,
		&blog.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.Blog{}, fmt.Errorf("not found")
		}
		return domain.Blog{}, err
	}

	return blog, nil
}
