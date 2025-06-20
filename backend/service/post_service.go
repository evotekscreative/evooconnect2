package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type PostService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.CreatePostRequest, files []*multipart.FileHeader) web.PostResponse
	Update(ctx context.Context, postId uuid.UUID, userId uuid.UUID, request web.UpdatePostRequest, files []*multipart.FileHeader) web.PostResponse
	Delete(ctx context.Context, postId uuid.UUID, userId uuid.UUID)
	FindById(ctx context.Context, postId uuid.UUID, currentUserId uuid.UUID) web.PostResponse
	FindAll(ctx context.Context, limit, offset int, currentUserId uuid.UUID) []web.PostResponse
	FindByUserId(ctx context.Context, targetUserId uuid.UUID, limit, offset int, currentUserId uuid.UUID) []web.PostResponse
	LikePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
	UnlikePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse

	CreateGroupPost(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, request web.CreatePostRequest, files []*multipart.FileHeader) web.PostResponse
	FindByGroupId(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, limit, offset int) []web.PostResponse

	FindPendingPostsByGroupId(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, limit, offset int) []web.PendingPostResponse
	ApprovePost(ctx context.Context, pendingPostId uuid.UUID, userId uuid.UUID) web.PostResponse
	RejectPost(ctx context.Context, pendingPostId uuid.UUID, userId uuid.UUID)
	PinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
	UnpinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
	FindPendingPostsByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) []web.PendingPostResponse
	FindPendingPostsByUserIdAndGroupId(ctx context.Context, userId uuid.UUID, groupId uuid.UUID, limit, offset int) []web.PendingPostResponse
	
}
