package service

import (
	"context"
	"evoconnect/backend/model/web"
)

type UserService interface {
	GetProfile(ctx context.Context, userId int) web.UserProfileResponse
	UpdateProfile(ctx context.Context, userId int, request web.UpdateProfileRequest) web.UserProfileResponse
}
