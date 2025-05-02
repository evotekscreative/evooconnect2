package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
)

type CommentService interface {
	// Interface mendefinisikan Create dengan 4 parameter dan 1 return value
	Create(ctx context.Context, postId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse
	GetByPostId(ctx context.Context, postId uuid.UUID, limit, offset int) web.CommentListResponse
	GetById(ctx context.Context, commentId uuid.UUID) web.CommentResponse
	Update(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse
	Delete(ctx context.Context, commentId uuid.UUID, userId uuid.UUID)
	Reply(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse
	GetReplies(ctx context.Context, commentId uuid.UUID, limit, offset int) web.CommentListResponse
}
