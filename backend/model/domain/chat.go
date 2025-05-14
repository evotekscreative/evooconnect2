package domain

import (
	"time"

	"github.com/google/uuid"
)

type Conversation struct {
	Id           uuid.UUID
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Participants []ConversationParticipant
	LastMessage  *Message
	UnreadCount  int
}

type ConversationParticipant struct {
	ConversationId uuid.UUID
	UserId         uuid.UUID
	User           *User
	LastReadAt     *time.Time
	CreatedAt      time.Time
}

type Message struct {
	Id             uuid.UUID
	ConversationId uuid.UUID
	SenderId       uuid.UUID
	Sender         *User
	MessageType    string // "text", "image", "document", "audio"
	Content        string
	FilePath       string
	FileName       string
	FileSize       int
	FileType       string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	IsRead         bool
}
