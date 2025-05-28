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
	MessageType    string
	Content        string
	FilePath       string
	FileName       string
	FileSize       int
	FileType       string
	ReplyToId      *uuid.UUID // New field for reply functionality
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      *time.Time // New field for soft deletion
	IsRead         bool
	Sender         *User
	ReplyTo        *Message // Referenced message when replying
}
