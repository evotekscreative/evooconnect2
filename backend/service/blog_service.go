package service

import (
    "context"
    "evoconnect/backend/model/web"
	"mime/multipart"
)

type BlogService interface {
    Create(ctx context.Context, req web.BlogCreateRequest, userID string) (web.BlogResponse, error)
    FindAll(ctx context.Context) ([]web.BlogResponse, error)
    Delete(ctx context.Context, blogID string) error
    FindBySlug(ctx context.Context, slug string) (web.BlogResponse, error)
    UpdateWithImagePath(ctx context.Context, blogID string, req web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error)
	UploadPhoto(ctx context.Context, blogId string, userId string, file multipart.File, fileHeader *multipart.FileHeader) (string, error)
	GetRandomBlogs(ctx context.Context, limit int) ([]web.BlogResponse, error)
    CreateWithImagePath(ctx context.Context, req web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error)
    FindById(ctx context.Context, blogID string) (web.BlogResponse, error)
    // UpdateWithImagePath(ctx context.Context, blogID string, req web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error)
    
}