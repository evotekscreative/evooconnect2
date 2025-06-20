package web

import (
	"github.com/google/uuid"
	"time"
)

// Request for creating main comment
type CreateCompanyPostCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

// Request for creating reply comment
type CreateCompanyPostReplyRequest struct {
	ParentId uuid.UUID `json:"parent_id" validate:"required"`
	Content  string    `json:"content" validate:"required,min=1,max=1000"`
}

// Request for creating sub-reply comment
type CreateCompanyPostSubReplyRequest struct {
	ParentId    uuid.UUID `json:"parent_id" validate:"required"`
	CommentToId uuid.UUID `json:"comment_to_id" validate:"required"` // ID of comment being replied to
	Content     string    `json:"content" validate:"required,min=1,max=1000"`
}

// Request for updating comment
type UpdateCompanyPostCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

// Response model
type CompanyPostCommentResponse struct {
	Id               uuid.UUID                `json:"id"`
	PostId           uuid.UUID                `json:"post_id"`
	UserId           uuid.UUID                `json:"user_id"`
	ParentId         *uuid.UUID               `json:"parent_id,omitempty"`
	CommentToId      *uuid.UUID               `json:"comment_to_id,omitempty"`
	Content          string                   `json:"content"`
	CreatedAt        time.Time                `json:"created_at"`
	UpdatedAt        time.Time                `json:"updated_at"`
	ReplyCount       int                      `json:"reply_count"`
	User             *UserBriefResponse       `json:"user,omitempty"`
	CommentToComment *CompanyPostCommentBrief `json:"comment_to_comment,omitempty"` // Comment being replied to
}

// Brief comment info for references
type CompanyPostCommentBrief struct {
	Id      uuid.UUID          `json:"id"`
	Content string             `json:"content"`
	User    *UserBriefResponse `json:"user,omitempty"`
}

// Response for list of comments
type CompanyPostCommentListResponse struct {
	Comments   []CompanyPostCommentResponse `json:"comments"`
	Pagination PaginationResponse           `json:"pagination"`
}
