package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type ChatService interface {
	// Conversation operations
	CreateConversation(ctx context.Context, userId uuid.UUID, request web.CreateConversationRequest) web.ConversationResponse
	FindConversationById(ctx context.Context, userId, conversationId uuid.UUID) web.ConversationResponse
	FindConversationsByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) web.ConversationsResponse
	MarkConversationAsRead(ctx context.Context, userId, conversationId uuid.UUID) web.ConversationResponse

	// Message operations
	SendMessage(ctx context.Context, userId, conversationId uuid.UUID, request web.SendMessageRequest) web.ChatMessageResponse
	SendFileMessage(ctx context.Context, userId, conversationId uuid.UUID, messageType string, file *multipart.FileHeader) web.ChatMessageResponse
	FindMessageById(ctx context.Context, messageId uuid.UUID) web.ChatMessageResponse
	FindMessagesByConversationId(ctx context.Context, userId, conversationId uuid.UUID, limit, offset int) web.MessagesResponse
	UpdateMessage(ctx context.Context, userId, messageId uuid.UUID, request web.SendMessageRequest) web.ChatMessageResponse
	DeleteMessage(ctx context.Context, userId, messageId uuid.UUID)
}
