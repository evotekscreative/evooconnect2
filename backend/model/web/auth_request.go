package web

// LoginRequest represents login form data
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RegisterRequest represents registration form data
type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
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
