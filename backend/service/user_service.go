package service

import (
	"context"
	"evoconnect/backend/model/web"
)

type UserService interface {
	GetProfile(ctx context.Context, userId int) web.UserProfileResponse
}
