package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type CreatePostRequest struct {
	Content    string   `json:"content" validate:"required"`
	Images     []string `json:"images"`
	Visibility string   `json:"visibility" validate:"required,oneof=public private connections"`
}

type UpdatePostRequest struct {
	Content    string   `json:"content" validate:"required"`
	Images     []string `json:"images"`
	Visibility string   `json:"visibility" validate:"required,oneof=public private connections"`
}

// Response models
type PostResponse struct {
	Id         uuid.UUID     `json:"id"`
	UserId     uuid.UUID     `json:"user_id"`
	Content    string        `json:"content"`
	Images     []string      `json:"images"`
	LikesCount int           `json:"likes_count"`
	Visibility string        `json:"visibility"`
	IsLiked    bool          `json:"is_liked"`
	User       UserMinimal   `json:"user"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
	Comments   []interface{} `json:"comments"` // Will be populated later if needed
}

// Add this struct to the file
type UploadPostImagesResponse struct {
	Filenames []string `json:"filenames"`
}
