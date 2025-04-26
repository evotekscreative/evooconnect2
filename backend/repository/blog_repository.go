package repository

import (
	"context"
	"evoconnect/backend/model/domain"
)

type BlogRepository interface {
	Save(ctx context.Context, blog domain.Blog) domain.Blog
	FindAll(ctx context.Context) []domain.Blog
	Delete(ctx context.Context, blogId string) error // <-- tambahkan "error" return di sini
	FindBySlug(ctx context.Context, slug string) (domain.Blog, error)
}