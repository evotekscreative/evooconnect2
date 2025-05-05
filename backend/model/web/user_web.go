package web

import (
	"github.com/google/uuid"
)

// Request models
type UpdateProfileRequest struct {
	Name         string      `json:"name" validate:"required"`
	Email        string      `json:"email" validate:"required,email"`
	Username     string      `json:"username" validate:"required,max=100"`
	Birthdate    string      `json:"birthdate"`
	Gender       string      `json:"gender" validate:"max=20"`
	Location     string      `json:"location" validate:"max=100"`
	Organization string      `json:"organization" validate:"max=100"`
	Website      string      `json:"website"`
	Phone        string      `json:"phone" validate:"max=20"`
	Headline     string      `json:"headline" validate:"max=100"`
	About        string      `json:"about"`
	Skills       interface{} `json:"skills"`
	Socials      interface{} `json:"socials"`
	Photo        string      `json:"photo"`
	IsConnected  bool        `json:"is_connected"`
}

type SocialMediaRequest struct {
	Platform string `json:"platform" validate:"required,max=50"`
	Link     string `json:"link" validate:"required,max=200"`
}

// Response models
type UserProfileResponse struct {
	ID           uuid.UUID   `json:"id"`
	Name         string      `json:"name"`
	Email        string      `json:"email"`
	Username     string      `json:"username"`
	Birthdate    string      `json:"birthdate"`
	Gender       string      `json:"gender"`
	Location     string      `json:"location"`
	Organization string      `json:"organization"`
	Website      string      `json:"website"`
	Phone        string      `json:"phone"`
	Headline     string      `json:"headline"`
	About        string      `json:"about"`
	Skills       interface{} `json:"skills"`
	Socials      interface{} `json:"socials"`
	Photo        string      `json:"photo"`
	IsVerified   bool        `json:"is_verified"`
	CreatedAt    string      `json:"created_at"`
	UpdatedAt    string      `json:"updated_at"`
	IsConnected  bool        `json:"is_connected"`
}

type UserMinimal struct {
	Id          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Username    string    `json:"username"`
	Photo       string    `json:"photo"`
	Email       string    `json:"email"`
	Headline    string    `json:"headline,omitempty"`
	IsConnected bool      `json:"is_connected"`
}

type SocialMediaResponse struct {
	Platform string `json:"platform" validate:"required,max=50"`
	Link     string `json:"link" validate:"required,max=200"`
}
