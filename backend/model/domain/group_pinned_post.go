package domain

import (
    "time"
    "github.com/google/uuid"
)

type GroupPinnedPost struct {
    Id        uuid.UUID `json:"id"`
    GroupId   uuid.UUID `json:"group_id"`
    PostId    uuid.UUID `json:"post_id"`
    PinnedBy  uuid.UUID `json:"pinned_by"`
    PinnedAt  time.Time `json:"pinned_at"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    
    // Relasi
    Post      *Post     `json:"post,omitempty"`
    User      *User     `json:"user,omitempty"` // User yang melakukan pin
}