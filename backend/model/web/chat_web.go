package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type SendMessageRequest struct {
	Content     string     `json:"content,omitempty"`
	MessageType string     `json:"message_type" validate:"required,oneof=text image document audio"`
	ReplyToId   *uuid.UUID `json:"reply_to_id,omitempty"` // New field for reply functionality
}

type CreateConversationRequest struct {
	ParticipantIds []uuid.UUID `json:"participant_ids" validate:"required,min=1"`
	InitialMessage string      `json:"initial_message,omitempty"`
}

// Response models
type ConversationResponse struct {
	Id           uuid.UUID             `json:"id"`
	CreatedAt    time.Time             `json:"created_at"`
	UpdatedAt    time.Time             `json:"updated_at"`
	Participants []ParticipantResponse `json:"participants"`
	LastMessage  *ChatMessageResponse  `json:"last_message,omitempty"`
	UnreadCount  int                   `json:"unread_count"`
}

type ParticipantResponse struct {
	UserId     uuid.UUID         `json:"user_id"`
	User       UserBriefResponse `json:"user"`
	LastReadAt *time.Time        `json:"last_read_at,omitempty"`
}

type ChatMessageResponse struct {
	Id             uuid.UUID            `json:"id"`
	ConversationId uuid.UUID            `json:"conversation_id"`
	SenderId       uuid.UUID            `json:"sender_id"`
	Sender         UserBriefResponse    `json:"sender,omitempty"`
	MessageType    string               `json:"message_type"`
	Content        string               `json:"content,omitempty"`
	FilePath       string               `json:"file_path,omitempty"`
	FileName       string               `json:"file_name,omitempty"`
	FileSize       int                  `json:"file_size,omitempty"`
	FileType       string               `json:"file_type,omitempty"`
	CreatedAt      time.Time            `json:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at"`
	DeletedAt      *time.Time           `json:"deleted_at,omitempty"` // Added field for soft deletion
	IsRead         bool                 `json:"is_read"`
	ReplyToId      *uuid.UUID           `json:"reply_to_id,omitempty"`
	ReplyTo        *ChatMessageResponse `json:"reply_to,omitempty"` // Fixed to use proper type
}

type ConversationsResponse struct {
	Conversations []ConversationResponse `json:"conversations"`
	Total         int                    `json:"total"`
}

type MessagesResponse struct {
	Messages []ChatMessageResponse `json:"messages"`
	Total    int                   `json:"total"`
}
