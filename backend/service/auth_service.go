package service

import (
	"context"
	"evoconnect/backend/model/web"
)

type AuthService interface {
	Login(ctx context.Context, request web.LoginRequest) web.LoginResponse
	Register(ctx context.Context, request web.RegisterRequest) web.RegisterResponse
	SendVerificationEmail(ctx context.Context, request web.EmailRequest) web.MessageResponse
	VerifyEmail(ctx context.Context, request web.VerificationRequest) web.MessageResponse
	ForgotPassword(ctx context.Context, request web.EmailRequest) web.MessageResponse
	ResetPassword(ctx context.Context, request web.ResetPasswordRequest) web.MessageResponse
	GoogleAuth(ctx context.Context, request web.GoogleAuthRequest) (web.RegisterResponse, error) // Add this line
}
