package web

import (
	"time"

	"github.com/google/uuid"
)

type CreateCommentBlogRequest struct {
	Content  string     `json:"content" validate:"required"`
	ParentId *uuid.UUID `json:"parent_id,omitempty"`
}

type CommentBlogResponse struct {
    Id           uuid.UUID             `json:"id"`
    BlogId       uuid.UUID             `json:"blog_id"`
    Content      string                `json:"content"`
    CreatedAt    time.Time             `json:"created_at"`
    UpdatedAt    time.Time             `json:"updated_at"`
    ParentId     *uuid.UUID            `json:"parent_id,omitempty"`
    User         CommentBlogUserInfo   `json:"user"`
    Replies      []CommentBlogResponse `json:"replies,omitempty"`
    RepliesCount int                   `json:"replies_count"` // Tambahkan field ini
}
type CommentBlogUserInfo struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Username string    `json:"username"`
	Photo    string    `json:"profile_photo"`
}

type CommentBlogListResponse struct {
	Comments []CommentBlogResponse `json:"comments"`
	Total    int                  `json:"total"`
}