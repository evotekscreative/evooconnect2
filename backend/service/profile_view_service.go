package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
)

type ProfileViewService interface {
	RecordView(ctx context.Context, profileUserId uuid.UUID, viewerId uuid.UUID) error
	GetViewsThisWeek(ctx context.Context, userId uuid.UUID) web.ProfileViewsResponse
	GetViewsLastWeek(ctx context.Context, userId uuid.UUID) web.ProfileViewsResponse
}
