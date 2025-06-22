package service

import (
    "context"
    "evoconnect/backend/model/web"
    "github.com/google/uuid"
)

type GroupPinnedPostService interface {
    PinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
    UnpinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse
    GetPinnedPosts(ctx context.Context, groupId uuid.UUID) []web.PostResponse
}