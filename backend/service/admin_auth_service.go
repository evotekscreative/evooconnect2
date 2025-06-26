package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type AdminAuthService interface {
	Login(ctx context.Context, request web.AdminLoginRequest) web.AdminLoginResponse
	Register(ctx context.Context, request web.AdminRegisterRequest) web.AdminResponse
	FindById(ctx context.Context, adminId uuid.UUID) web.AdminResponse
}
