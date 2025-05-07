package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type UserService interface {
	GetProfile(ctx context.Context, userId uuid.UUID) web.UserProfileResponse
	UpdateProfile(ctx context.Context, userId uuid.UUID, request web.UpdateProfileRequest) web.UserProfileResponse
	GetByUsername(ctx context.Context, username string) web.UserProfileResponse
	UploadPhotoProfile(ctx context.Context, userId uuid.UUID, fileName string) web.UserProfileResponse
	GetPeoples(ctx context.Context, limit int, offset int, currentUserIdStr string) []web.UserShort
}
