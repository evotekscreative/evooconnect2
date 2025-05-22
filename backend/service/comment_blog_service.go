package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
)

type CommentBlogService interface {
	Create(ctx context.Context, blogId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse
	GetByBlogId(ctx context.Context, blogId uuid.UUID, limit, offset int) web.CommentBlogListResponse
	GetById(ctx context.Context, commentId uuid.UUID) web.CommentBlogResponse
	Update(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse
	Delete(ctx context.Context, commentId uuid.UUID, userId uuid.UUID)
	Reply(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse
	GetReplies(ctx context.Context, commentId uuid.UUID, limit, offset int) web.CommentBlogListResponse
}