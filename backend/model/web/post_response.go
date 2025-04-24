package web

import (
	"time"

	"github.com/google/uuid"
)

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
