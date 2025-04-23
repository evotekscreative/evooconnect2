package web

import (
	"time"

	"github.com/google/uuid"
)

type UserProfileResponse struct {
	ID           uuid.UUID   `json:"id"`
	Name         string      `json:"name"`
	Email        string      `json:"email"`
	Username     string      `json:"username" validate:"required,max=100"`
	Birthdate    time.Time   `json:"birthdate"`
	Gender       string      `json:"gender" validate:"max=20"`
	Location     string      `json:"location" validate:"max=100"`
	Organization string      `json:"organization" validate:"max=100"`
	Website      string      `json:"website"`
	Phone        string      `json:"phone" validate:"max=20"`
	Headline     string      `json:"headline"`
	About        string      `json:"about"`
	Skills       interface{} `json:"skills"`
	Socials      interface{} `json:"socials"`
	Photo        string      `json:"photo"`
	IsVerified   bool        `json:"is_verified"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type SocialMediaResponse struct {
	Platform string `json:"platform" validate:"required,max=50"`
	Link     string `json:"link" validate:"required,max=200"`
}
