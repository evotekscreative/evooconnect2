package service

import (
	"context"
	"evoconnect/backend/model/web"
)

type BlogService interface {
	Create(ctx context.Context, req web.BlogCreateRequest, userID string) web.BlogResponse
	FindAll(ctx context.Context) ([]web.BlogResponse, error)
	FindBySlug(ctx context.Context, slug string) (web.BlogResponse, error)
	Delete(ctx context.Context, blogID string) error
}
