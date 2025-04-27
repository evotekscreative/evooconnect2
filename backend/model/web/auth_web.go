package web

import "evoconnect/backend/model/domain"

type GoogleAuthRequest struct {
	Token string `json:"token" validate:"required"`
}

// Request models
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RegisterRequest represents registration form data
type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// EmailRequest for verification email or password reset requests
type EmailRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// VerificationRequest for email verification
type VerificationRequest struct {
	Token string `json:"token" validate:"required"`
}

// ResetPasswordRequest for password reset
type ResetPasswordRequest struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required,min=6"`
}

// Response models
// LoginResponse represents successful login response
type LoginResponse struct {
	Token string      `json:"token"`
	User  domain.User `json:"user"`
}

// RegisterResponse represents successful registration response
type RegisterResponse struct {
	Token string      `json:"token"`
	User  domain.User `json:"user"`
}

// MessageResponse for simple message responses
type MessageResponse struct {
	Message string `json:"message"`
}
