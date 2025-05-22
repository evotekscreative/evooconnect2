package web

import (
    "time"

    "github.com/google/uuid"
)

// Request models
type CreateCommentRequest struct {
    Content  string     `json:"content" validate:"required"`
    ParentId *uuid.UUID `json:"parent_id,omitempty"` // Optional, untuk balasan komentar
}

// Jika masih dibutuhkan oleh kode lain
type CommentCreateRequest struct {
    PostId   string    `json:"post_id" validate:"required"`
    UserId   uuid.UUID `json:"user_id" validate:"required"`
    Content  string    `json:"content" validate:"required"`
    ParentId string    `json:"parent_id,omitempty"`
}

// Jika masih dibutuhkan oleh kode lain
type CommentUpdateRequest struct {
    Id      string    `json:"id" validate:"required"`
    UserId  uuid.UUID `json:"user_id" validate:"required"`
    Content string    `json:"content" validate:"required"`
}

// Response models
type CommentResponse struct {
    Id          uuid.UUID         `json:"id"`
    PostId      uuid.UUID         `json:"post_id"`
    Content     string            `json:"content"`
    CreatedAt   time.Time         `json:"created_at"`
    UpdatedAt   time.Time         `json:"updated_at"`
    User        CommentUserInfo   `json:"user"`
    Replies     []CommentResponse `json:"replies,omitempty"`
    RepliesCount int              `json:"replies_count"`
    ParentId    *uuid.UUID        `json:"parent_id,omitempty"` // Jika ini adalah balasan
}

type CommentUserInfo struct {
    Id       uuid.UUID `json:"id"`
    Name     string    `json:"name"`
    Username string    `json:"username"`
    Photo    string    `json:"profile_photo"`
}

type CommentListResponse struct {
    Comments []CommentResponse `json:"comments"`
    Total    int               `json:"total"`
}