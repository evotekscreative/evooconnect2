package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"evoconnect/backend/utils"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	_ "github.com/pusher/pusher-http-go/v5"
)

type ChatServiceImpl struct {
	ChatRepository repository.ChatRepository
	DB             *sql.DB
	Validate       *validator.Validate
	UserRepository repository.UserRepository
}

func NewChatService(chatRepository repository.ChatRepository, userRepository repository.UserRepository, DB *sql.DB, validator *validator.Validate) ChatService {
	return &ChatServiceImpl{
		ChatRepository: chatRepository,
		DB:             DB,
		Validate:       validator,
		UserRepository: userRepository,
	}
}

// Helper function to check if user exists in participants
func (service *ChatServiceImpl) validateParticipant(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID) bool {
	conversation, err := service.ChatRepository.FindConversationById(ctx, tx, conversationId)
	if err != nil {
		return false
	}

	for _, participant := range conversation.Participants {
		if participant.UserId == userId {
			return true
		}
	}

	return false
}

// Helper function to convert domain conversation to web response
func (service *ChatServiceImpl) toConversationResponse(conversation domain.Conversation) web.ConversationResponse {
	response := web.ConversationResponse{
		Id:          conversation.Id,
		CreatedAt:   conversation.CreatedAt,
		UpdatedAt:   conversation.UpdatedAt,
		UnreadCount: conversation.UnreadCount,
	}

	var participants []web.ParticipantResponse
	for _, participant := range conversation.Participants {
		participantResponse := web.ParticipantResponse{
			UserId:     participant.UserId,
			LastReadAt: participant.LastReadAt,
		}

		if participant.User != nil {
			participantResponse.User = helper.ToUserBriefResponse(*participant.User)
		}

		participants = append(participants, participantResponse)
	}
	response.Participants = participants

	if conversation.LastMessage != nil {
		lastMessage := service.toChatMessageResponse(*conversation.LastMessage)
		response.LastMessage = &lastMessage
	}

	return response
}

// Helper function to convert domain message to web response
func (service *ChatServiceImpl) toChatMessageResponse(message domain.Message) web.ChatMessageResponse {
	response := web.ChatMessageResponse{
		Id:             message.Id,
		ConversationId: message.ConversationId,
		SenderId:       message.SenderId,
		MessageType:    message.MessageType,
		Content:        message.Content,
		FilePath:       message.FilePath,
		FileName:       message.FileName,
		FileSize:       message.FileSize,
		FileType:       message.FileType,
		CreatedAt:      message.CreatedAt,
		UpdatedAt:      message.UpdatedAt,
		DeletedAt:      message.DeletedAt,
		IsRead:         message.IsRead,
		ReplyToId:      message.ReplyToId,
	}

	// Handle the reply to message if it exists
	if message.ReplyTo != nil {
		replyTo := service.toChatMessageResponse(*message.ReplyTo)
		response.ReplyTo = &replyTo
	}

	if message.Sender != nil {
		response.Sender = helper.ToUserBriefResponse(*message.Sender)
	}

	return response
}

// Conversation operations
func (service *ChatServiceImpl) CreateConversation(ctx context.Context, userId uuid.UUID, request web.CreateConversationRequest) web.ConversationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	// Step 1: Validate participants (short transaction)
	tx1, err := service.DB.Begin()
	helper.PanicIfError(err)

	// fmt.Println("Creating conversation with participants:", request.ParticipantIds)
	// Check if all participantIds are valid users
	for _, participantId := range request.ParticipantIds {
		_, err := service.UserRepository.FindById(ctx, tx1, participantId)
		if err != nil {
			tx1.Rollback()
			panic(exception.NewNotFoundError(fmt.Sprintf("User with ID %s not found", participantId)))
		}
	}
	tx1.Commit()
	// fmt.Println("All participant IDs are valid users")

	// Make sure the current user is in the participants list
	participantIds := request.ParticipantIds
	foundCurrentUser := false
	for _, id := range participantIds {
		if id == userId {
			foundCurrentUser = true
			break
		}
	}

	if !foundCurrentUser {
		participantIds = append(participantIds, userId)
	}

	// Step 2: Check for existing conversation (separate transaction)
	tx2, err := service.DB.Begin()
	helper.PanicIfError(err)

	existingConversation, err := service.ChatRepository.FindConversationByParticipants(ctx, tx2, participantIds)
	if err == nil {
		// Conversation exists, return it
		existingConversation, err = service.ChatRepository.FindConversationById(ctx, tx2, existingConversation.Id)
		if err != nil {
			tx2.Rollback()
			helper.PanicIfError(err)
		}
		existingConversation.UnreadCount = service.ChatRepository.CountUnreadMessages(ctx, tx2, existingConversation.Id, userId)
		tx2.Commit()
		return service.toConversationResponse(existingConversation)
	}
	tx2.Commit()

	// Step 3: Create conversation (separate transaction)
	tx3, err := service.DB.Begin()
	helper.PanicIfError(err)

	// fmt.Println("No existing conversation found, creating a new one")
	conversation := domain.Conversation{}
	conversation = service.ChatRepository.CreateConversation(ctx, tx3, conversation)
	err = tx3.Commit()
	helper.PanicIfError(err)

	// fmt.Println("New conversation created with ID:", conversation.Id)

	// Step 4: Add participants (separate transaction)
	tx4, err := service.DB.Begin()
	helper.PanicIfError(err)

	for i, participantId := range participantIds {
		participant := domain.ConversationParticipant{
			ConversationId: conversation.Id,
			UserId:         participantId,
		}
		fmt.Printf("Adding participant %d of %d: %s\n", i+1, len(participantIds), participantId)
		_, err := service.ChatRepository.AddParticipant(ctx, tx4, participant)
		if err != nil {
			tx4.Rollback()
			fmt.Printf("Error adding participant: %v\n", err)
			helper.PanicIfError(err)
		}
	}
	err = tx4.Commit()
	helper.PanicIfError(err)

	// fmt.Println("Participants added to conversation")

	// Step 5: Send initial message if provided (separate transaction)
	if request.InitialMessage != "" {
		tx5, err := service.DB.Begin()
		helper.PanicIfError(err)

		// fmt.Println("Sending initial message")
		initialMessage := domain.Message{
			ConversationId: conversation.Id,
			SenderId:       userId,
			MessageType:    "text",
			Content:        request.InitialMessage,
			IsRead:         false,
		}
		service.ChatRepository.CreateMessage(ctx, tx5, initialMessage)
		err = tx5.Commit()
		helper.PanicIfError(err)
		// fmt.Println("Initial message sent successfully")
	}

	// Step 6: Fetch complete conversation data (final transaction)
	tx6, err := service.DB.Begin()
	helper.PanicIfError(err)

	// fmt.Println("Fetching full conversation data")
	conversation, err = service.ChatRepository.FindConversationById(ctx, tx6, conversation.Id)
	if err != nil {
		tx6.Rollback()
		helper.PanicIfError(err)
	}
	conversation.UnreadCount = service.ChatRepository.CountUnreadMessages(ctx, tx6, conversation.Id, userId)
	err = tx6.Commit()
	helper.PanicIfError(err)

	// fmt.Println("Full conversation fetched successfully")
	conversationResponse := service.toConversationResponse(conversation)

	// Push notifications outside transaction
	go func() {
		for _, participant := range conversation.Participants {
			if participant.UserId != userId {
				utils.PusherClient.Trigger(fmt.Sprintf("private-user-%s", participant.UserId), "new-conversation", conversationResponse)
			}
		}
		// fmt.Println("Notifications sent to participants")
	}()

	return conversationResponse
}

func (service *ChatServiceImpl) FindConversationById(ctx context.Context, userId, conversationId uuid.UUID) web.ConversationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user is a participant
	if !service.validateParticipant(ctx, tx, conversationId, userId) {
		panic(exception.NewForbiddenError("You are not a participant in this conversation"))
	}

	conversation, err := service.ChatRepository.FindConversationById(ctx, tx, conversationId)
	if err != nil {
		panic(exception.NewNotFoundError("Conversation not found"))
	}

	conversation.UnreadCount = service.ChatRepository.CountUnreadMessages(ctx, tx, conversationId, userId)
	return service.toConversationResponse(conversation)
}

func (service *ChatServiceImpl) FindConversationsByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) web.ConversationsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	conversations, total := service.ChatRepository.FindConversationsByUserId(ctx, tx, userId, limit, offset)

	var conversationResponses []web.ConversationResponse
	for _, conversation := range conversations {
		conversationResponses = append(conversationResponses, service.toConversationResponse(conversation))
	}

	return web.ConversationsResponse{
		Conversations: conversationResponses,
		Total:         total,
	}
}

func (service *ChatServiceImpl) MarkConversationAsRead(ctx context.Context, userId, conversationId uuid.UUID) web.ConversationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user is a participant
	if !service.validateParticipant(ctx, tx, conversationId, userId) {
		panic(exception.NewForbiddenError("You are not a participant in this conversation"))
	}

	// Mark all messages as read
	err = service.ChatRepository.MarkMessagesAsRead(ctx, tx, conversationId, userId)
	helper.PanicIfError(err)

	// Update last_read_at for the user
	err = service.ChatRepository.UpdateLastReadAt(ctx, tx, conversationId, userId, time.Now().Format(time.RFC3339))
	helper.PanicIfError(err)

	// Get updated conversation
	conversation, err := service.ChatRepository.FindConversationById(ctx, tx, conversationId)
	helper.PanicIfError(err)
	conversation.UnreadCount = 0

	// Trigger Pusher event to update read status
	utils.PusherClient.Trigger(fmt.Sprintf("private-conversation-%s", conversationId), "messages-read", map[string]interface{}{
		"user_id":         userId,
		"conversation_id": conversationId,
		"read_at":         time.Now(),
	})

	return service.toConversationResponse(conversation)
}

// Message operations
func (service *ChatServiceImpl) SendMessage(ctx context.Context, userId, conversationId uuid.UUID, request web.SendMessageRequest) web.ChatMessageResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user is a participant
	if !service.validateParticipant(ctx, tx, conversationId, userId) {
		panic(exception.NewForbiddenError("You are not a participant in this conversation"))
	}

	// Create message
	message := domain.Message{
		ConversationId: conversationId,
		SenderId:       userId,
		MessageType:    request.MessageType,
		Content:        request.Content,
		IsRead:         false,
	}

	if request.ReplyToId != nil {
		replyToMessage, err := service.ChatRepository.FindMessageById(ctx, tx, *request.ReplyToId)
		if err != nil {
			panic(exception.NewNotFoundError("Reply message not found"))
		}
		message.ReplyToId = request.ReplyToId
		message.ReplyTo = &replyToMessage
	}
	// fmt.Println("Message created:", request.ReplyToId)

	message = service.ChatRepository.CreateMessage(ctx, tx, message)
	// fmt.Println("Message created:", message)

	// Get sender details
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	helper.PanicIfError(err)
	message.Sender = &user

	// Trigger Pusher event
	messageResponse := service.toChatMessageResponse(message)

	utils.PusherClient.Trigger(fmt.Sprintf("private-conversation-%s", conversationId), "new-message", messageResponse)

	// Also trigger notifications for each participant except the sender
	conversation, err := service.ChatRepository.FindConversationById(ctx, tx, conversationId)
	helper.PanicIfError(err)

	for _, participant := range conversation.Participants {
		if participant.UserId != userId {
			// Send notification to each participant's personal channel
			utils.PusherClient.Trigger(fmt.Sprintf("private-user-%s", participant.UserId), "new-message-notification", map[string]interface{}{
				"message":         messageResponse,
				"sender_name":     user.Name,
				"conversation_id": conversationId,
			})
		}
	}

	return messageResponse
}

func (service *ChatServiceImpl) SendFileMessage(ctx context.Context, userId, conversationId uuid.UUID, messageType string, fileHeader *multipart.FileHeader) web.ChatMessageResponse {
	if messageType != "image" && messageType != "document" && messageType != "audio" {
		panic(exception.NewBadRequestError("Invalid message type"))
	}

	// Validate file size
	if (messageType == "image" && fileHeader.Size > 4*1024*1024) ||
		(messageType == "document" && fileHeader.Size > 10*1024*1024) ||
		(messageType == "audio" && fileHeader.Size > 10*1024*1024) {
		panic(exception.NewBadRequestError("File size exceeds maximum allowed limit"))
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user is a participant
	if !service.validateParticipant(ctx, tx, conversationId, userId) {
		panic(exception.NewForbiddenError("You are not a participant in this conversation"))
	}

	// Create upload directory if it doesn't exist
	uploadDir := fmt.Sprintf("uploads/chat/%s", userId)
	err = os.MkdirAll(uploadDir, os.ModePerm)
	helper.PanicIfError(err)

	// Generate unique filename
	fileExt := filepath.Ext(fileHeader.Filename)
	fileName := fmt.Sprintf("%s-%d%s", messageType, time.Now().Unix(), fileExt)
	filePath := filepath.Join(uploadDir, fileName)

	// Open uploaded file
	file, err := fileHeader.Open()
	helper.PanicIfError(err)
	defer file.Close()

	// Detect MIME type
	mimeType, err := mimetype.DetectReader(file)
	helper.PanicIfError(err)

	// Reset file pointer
	file.Seek(0, io.SeekStart)

	// Create destination file
	dst, err := os.Create(filePath)
	helper.PanicIfError(err)
	defer dst.Close()

	// Copy file contents
	_, err = io.Copy(dst, file)
	helper.PanicIfError(err)

	// Create message
	message := domain.Message{
		ConversationId: conversationId,
		SenderId:       userId,
		MessageType:    messageType,
		FilePath:       filePath,
		FileName:       fileHeader.Filename,
		FileSize:       int(fileHeader.Size),
		FileType:       mimeType.String(),
		IsRead:         false,
	}

	message = service.ChatRepository.CreateMessage(ctx, tx, message)

	// Get sender details
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	helper.PanicIfError(err)
	message.Sender = &user

	// Trigger Pusher event
	messageResponse := service.toChatMessageResponse(message)
	utils.PusherClient.Trigger(fmt.Sprintf("private-conversation-%s", conversationId), "new-message", messageResponse)

	// Also trigger notifications for each participant except the sender
	conversation, err := service.ChatRepository.FindConversationById(ctx, tx, conversationId)
	helper.PanicIfError(err)

	for _, participant := range conversation.Participants {
		if participant.UserId != userId {
			// Send notification to each participant's personal channel
			utils.PusherClient.Trigger(fmt.Sprintf("private-user-%s", participant.UserId), "new-message-notification", map[string]interface{}{
				"message":         messageResponse,
				"sender_name":     user.Name,
				"conversation_id": conversationId,
			})
		}
	}

	return messageResponse
}

func (service *ChatServiceImpl) FindMessageById(ctx context.Context, messageId uuid.UUID) web.ChatMessageResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	message, err := service.ChatRepository.FindMessageById(ctx, tx, messageId)
	if err != nil {
		panic(exception.NewNotFoundError("Message not found"))
	}

	return service.toChatMessageResponse(message)
}

func (service *ChatServiceImpl) FindMessagesByConversationId(ctx context.Context, userId, conversationId uuid.UUID, limit, offset int) web.MessagesResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user is a participant
	if !service.validateParticipant(ctx, tx, conversationId, userId) {
		panic(exception.NewForbiddenError("You are not a participant in this conversation"))
	}

	messages, total := service.ChatRepository.FindMessagesByConversationId(ctx, tx, conversationId, limit, offset)

	var messageResponses []web.ChatMessageResponse
	for _, message := range messages {
		messageResponses = append(messageResponses, service.toChatMessageResponse(message))
	}

	return web.MessagesResponse{
		Messages: messageResponses,
		Total:    total,
	}
}

func (service *ChatServiceImpl) UpdateMessage(ctx context.Context, userId, messageId uuid.UUID, request web.SendMessageRequest) web.ChatMessageResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if message exists and belongs to the user
	message, err := service.ChatRepository.FindMessageById(ctx, tx, messageId)
	if err != nil {
		panic(exception.NewNotFoundError("Message not found"))
	}

	if message.SenderId != userId {
		panic(exception.NewForbiddenError("You can only edit your own messages"))
	}

	// Only text messages can be edited
	if message.MessageType != "text" {
		panic(exception.NewBadRequestError("Only text messages can be edited"))
	}

	// Update message
	message.Content = request.Content
	message = service.ChatRepository.UpdateMessage(ctx, tx, message)

	// Trigger Pusher event
	messageResponse := service.toChatMessageResponse(message)
	utils.PusherClient.Trigger(fmt.Sprintf("private-conversation-%s", message.ConversationId), "message-updated", messageResponse)

	return messageResponse
}

func (service *ChatServiceImpl) DeleteMessage(ctx context.Context, userId, messageId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if message exists and belongs to the user
	message, err := service.ChatRepository.FindMessageById(ctx, tx, messageId)
	if err != nil {
		panic(exception.NewNotFoundError("Message not found"))
	}

	if message.SenderId != userId {
		panic(exception.NewForbiddenError("You can only delete your own messages"))
	}

	// If message has a file, delete it
	if message.FilePath != "" {
		err = os.Remove(message.FilePath)
		if err != nil {
			// Log but continue - don't stop if file can't be deleted
			fmt.Printf("Warning: Could not delete file %s: %v\n", message.FilePath, err)
		}
	}

	// Delete message
	err = service.ChatRepository.DeleteMessage(ctx, tx, messageId)
	helper.PanicIfError(err)

	// Trigger Pusher event
	utils.PusherClient.Trigger(fmt.Sprintf("private-conversation-%s", message.ConversationId), "message-deleted", map[string]interface{}{
		"message_id":      messageId,
		"conversation_id": message.ConversationId,
	})
}
