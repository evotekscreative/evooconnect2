package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
)

type CompanyPostCommentService interface {
	CreateComment(ctx context.Context, userId, postId uuid.UUID, request web.CreateCompanyPostCommentRequest) web.CompanyPostCommentResponse
	CreateReply(ctx context.Context, userId, postId uuid.UUID, request web.CreateCompanyPostReplyRequest) web.CompanyPostCommentResponse
	CreateSubReply(ctx context.Context, userId, postId uuid.UUID, request web.CreateCompanyPostSubReplyRequest) web.CompanyPostCommentResponse
	Update(ctx context.Context, userId, commentId uuid.UUID, request web.UpdateCompanyPostCommentRequest) web.CompanyPostCommentResponse
	Delete(ctx context.Context, userId, commentId uuid.UUID)
	FindById(ctx context.Context, commentId uuid.UUID, userId uuid.UUID) web.CompanyPostCommentResponse
	GetCommentsByPostId(ctx context.Context, postId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostCommentListResponse
	GetRepliesByParentId(ctx context.Context, parentId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostCommentListResponse
}
