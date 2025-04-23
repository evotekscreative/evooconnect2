package web

import (
	"github.com/google/uuid"
)

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
}

type UserMinimal struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Username string    `json:"username"`
	Photo    string    `json:"photo"`
	Email    string    `json:"email"`
	Headline string    `json:"headline,omitempty"`
}

type SocialMediaResponse struct {
	Platform string `json:"platform" validate:"required,max=50"`
	Link     string `json:"link" validate:"required,max=200"`
}
