package repository

import (
    "context"
    "evoconnect/backend/model/domain"
    "github.com/google/uuid"
    "database/sql"
)

type BlogRepository interface {
	FindAll(ctx context.Context) ([]domain.Blog, error) // Perbarui tanda tangan di sini
    FindBySlug(ctx context.Context, slug string) (domain.Blog, error)
    Save(ctx context.Context, blog domain.Blog) (domain.Blog, error)
    Delete(ctx context.Context, blogID string) error
    FindUserByID(ctx context.Context, userID uuid.UUID) (domain.User, error) // Tambahkan ini
	Update(ctx context.Context, blog domain.Blog) error // Tambahkan ini

	FindByID(ctx context.Context, blogID string) (domain.Blog, error) // Tambahkan ini
	GetRandomBlogs(ctx context.Context, limit int) ([]domain.Blog, error)
     Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.Blog
}