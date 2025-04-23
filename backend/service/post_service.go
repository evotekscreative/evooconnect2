package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type PostService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.CreatePostRequest) web.PostResponse
	Update(ctx context.Context, postId uuid.UUID, userId uuid.UUID, request web.UpdatePostRequest) web.PostResponse
	Delete(ctx context.Context, postId uuid.UUID, userId uuid.UUID)
	FindById(ctx context.Context, postId uuid.UUID, currentUserId uuid.UUID) web.PostResponse
	FindAll(ctx context.Context, limit, offset int, currentUserId uuid.UUID) []web.PostResponse
	FindByUserId(ctx context.Context, targetUserId uuid.UUID, limit, offset int, currentUserId uuid.UUID) []web.PostResponse
	LikePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
	UnlikePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
}
