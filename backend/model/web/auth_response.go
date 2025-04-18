package web

import "evoconnect/backend/model/domain"

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
