package domain

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

// Post represents a user post in the domain layer
type Post struct {
	Id            uuid.UUID   `json:"id"`
	UserId        uuid.UUID   `json:"user_id"`
	Content       string      `json:"content"`
	Images        ImagesArray `json:"images"`
	Visibility    string      `json:"visibility"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	GroupId       *uuid.UUID  `json:"group_id,omitempty"`
	LikesCount    int         `json:"likes_count"`
	CommentsCount int         `json:"comments_count"`
	IsLiked       bool        `json:"is_liked"`
	Status        string      `json:"status"` // pending, approved, rejected

	// Field untuk pin post
	IsPinned bool       `json:"is_pinned"`
	PinnedAt *time.Time `json:"pinned_at,omitempty"`
	IsReported    bool       `json:"is_reported"`

	// Relasi
	User  *User  `json:"user,omitempty"`
	Group *Group `json:"group,omitempty"`
}

// ImagesArray is a custom type for handling image arrays in PostgreSQL JSONB
type ImagesArray []string

// Value implements the driver.Valuer interface for ImagesArray
func (ia ImagesArray) Value() (driver.Value, error) {
	if ia == nil {
		return nil, nil
	}
	return json.Marshal(ia)
}

// Scan implements the sql.Scanner interface for ImagesArray
func (ia *ImagesArray) Scan(value interface{}) error {
	if value == nil {
		*ia = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("Invalid scan source for ImagesArray")
	}

	return json.Unmarshal(bytes, ia)
}

// PostLike represents a user liking a post
type PostLike struct {
	Id        uuid.UUID `json:"id"`
	PostId    uuid.UUID `json:"post_id"`
	UserId    uuid.UUID `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type PendingPost struct {
	Id        uuid.UUID `gorm:"type:uuid;primary_key"`
	PostId    uuid.UUID `gorm:"type:uuid;not null"`
	GroupId   uuid.UUID `gorm:"type:uuid;not null"`
	Status    string    `gorm:"size:20;not null;default:'pending'"` // pending, approved, rejected
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`
}
