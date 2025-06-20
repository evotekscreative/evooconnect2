package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type CompanyPostService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.CreateCompanyPostRequest, files []*multipart.FileHeader) web.CompanyPostResponse
	Update(ctx context.Context, userId, postId uuid.UUID, request web.UpdateCompanyPostRequest, files []*multipart.FileHeader) web.CompanyPostResponse
	Delete(ctx context.Context, userId, postId uuid.UUID)
	FindById(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.CompanyPostResponse
	FindByCompanyId(ctx context.Context, companyId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostListResponse
	FindByCreatorId(ctx context.Context, creatorId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostListResponse
	FindWithFilters(ctx context.Context, userId uuid.UUID, filter web.CompanyPostFilterRequest) web.CompanyPostListResponse
	UpdateStatus(ctx context.Context, userId, postId uuid.UUID, status string) web.CompanyPostResponse

	// Like functionality - following same pattern as PostService
	LikePost(ctx context.Context, userId, postId uuid.UUID)
	UnlikePost(ctx context.Context, userId, postId uuid.UUID)
}
