package domain

import (
	"time"

	"github.com/google/uuid"
)

type CommentBlog struct {
	Id        uuid.UUID  `json:"id"`
	BlogId    uuid.UUID  `json:"blog_id"`
	UserId    uuid.UUID  `json:"user_id"`
	ParentId  *uuid.UUID `json:"parent_id"`   // Untuk struktur thread
	ReplyToId *uuid.UUID `json:"reply_to_id"` // Untuk menunjukkan komentar yang dibalas langsung
	Content   string     `json:"content"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	User    *User         `json:"user,omitempty"`
	Replies []CommentBlog `json:"replies,omitempty"`
	ReplyTo *CommentBlog  `json:"reply_to,omitempty"` // Tambahkan field untuk menyimpan data komentar yang dibalas
}