package domain

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	Id        uuid.UUID  `json:"id"`
	PostId    uuid.UUID  `json:"post_id"`
	UserId    uuid.UUID  `json:"user_id"`
	ParentId  *uuid.UUID `json:"parent_id"` // Null untuk komentar utama, berisi ID komentar induk untuk balasan
	Content   string     `json:"content"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	User    *User     `json:"user,omitempty"`
	Replies []Comment `json:"replies,omitempty"`
}
