package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type ChatRepository interface {
	// Conversation operations
	CreateConversation(ctx context.Context, tx *sql.Tx, conversation domain.Conversation) domain.Conversation
	AddParticipant(ctx context.Context, tx *sql.Tx, participant domain.ConversationParticipant) (domain.ConversationParticipant, error)
	FindConversationById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Conversation, error)
	FindConversationByParticipants(ctx context.Context, tx *sql.Tx, participantIds []uuid.UUID) (domain.Conversation, error)
	FindConversationsByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.Conversation, int)
	UpdateLastReadAt(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID, lastReadAt string) error

	// Message operations
	CreateMessage(ctx context.Context, tx *sql.Tx, message domain.Message) domain.Message
	FindMessagesByConversationId(ctx context.Context, tx *sql.Tx, conversationId uuid.UUID, limit, offset int) ([]domain.Message, int)
	FindMessageById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Message, error)
	UpdateMessage(ctx context.Context, tx *sql.Tx, message domain.Message) domain.Message
	DeleteMessage(ctx context.Context, tx *sql.Tx, id uuid.UUID) error
	CountUnreadMessages(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID) int
	MarkMessagesAsRead(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID) error
}
