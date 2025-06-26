package domain

import (
	"github.com/google/uuid"
	"time"
)

type CompanyPostComment struct {
	Id          uuid.UUID  `json:"id"`
	PostId      uuid.UUID  `json:"post_id"`
	UserId      uuid.UUID  `json:"user_id"`
	ParentId    *uuid.UUID `json:"parent_id"`     // For reply and sub-reply
	CommentToId *uuid.UUID `json:"comment_to_id"` // For sub-reply (comment being replied to)
	Content     string     `json:"content"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relations
	User             *User               `json:"user,omitempty"`
	CommentToComment *CompanyPostComment `json:"comment_to_comment,omitempty"` // Comment being replied to
	Post             *CompanyPost        `json:"post,omitempty"`
}
