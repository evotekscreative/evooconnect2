package domain

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
    Id        uuid.UUID  `json:"id"`
    PostId    uuid.UUID  `json:"post_id"`
    UserId    uuid.UUID  `json:"user_id"`
    ParentId  *uuid.UUID `json:"parent_id"` // Tetap ada untuk struktur thread
    ReplyToId *uuid.UUID `json:"reply_to_id"` // Tambahkan field baru untuk menunjukkan komentar yang dibalas langsung
    Content   string     `json:"content"`
    CreatedAt time.Time  `json:"created_at"`
    UpdatedAt time.Time  `json:"updated_at"`

    User    *User     `json:"user,omitempty"`
    Replies []Comment `json:"replies,omitempty"`
    ReplyTo *Comment  `json:"reply_to,omitempty"` // Tambahkan field untuk menyimpan data komentar yang dibalas
}
