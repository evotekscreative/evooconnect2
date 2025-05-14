package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"evoconnect/backend/utils"
	"fmt"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type ChatControllerImpl struct {
	ChatService service.ChatService
}

func NewChatController(chatService service.ChatService) ChatController {
	return &ChatControllerImpl{
		ChatService: chatService,
	}
}

// Conversation operations
func (controller *ChatControllerImpl) CreateConversation(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	createRequest := web.CreateConversationRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	conversationResponse := controller.ChatService.CreateConversation(request.Context(), userId, createRequest)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   conversationResponse,
	}
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) GetConversation(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	conversationId, err := uuid.Parse(params.ByName("conversationId"))
	helper.PanicIfError(err)

	conversationResponse := controller.ChatService.FindConversationById(request.Context(), userId, conversationId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   conversationResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) GetConversations(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	limit := 10
	offset := 0

	queryLimit := request.URL.Query().Get("limit")
	if queryLimit != "" {
		limit, err = strconv.Atoi(queryLimit)
		helper.PanicIfError(err)
	}

	queryOffset := request.URL.Query().Get("offset")
	if queryOffset != "" {
		offset, err = strconv.Atoi(queryOffset)
		helper.PanicIfError(err)
	}

	conversationsResponse := controller.ChatService.FindConversationsByUserId(request.Context(), userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   conversationsResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) MarkConversationAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	conversationId, err := uuid.Parse(params.ByName("conversationId"))
	helper.PanicIfError(err)

	conversationResponse := controller.ChatService.MarkConversationAsRead(request.Context(), userId, conversationId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   conversationResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// Message operations
func (controller *ChatControllerImpl) SendMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	conversationId, err := uuid.Parse(params.ByName("conversationId"))
	helper.PanicIfError(err)

	messageRequest := web.SendMessageRequest{}
	helper.ReadFromRequestBody(request, &messageRequest)

	messageResponse := controller.ChatService.SendMessage(request.Context(), userId, conversationId, messageRequest)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   messageResponse,
	}
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) SendFileMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	conversationId, err := uuid.Parse(params.ByName("conversationId"))
	helper.PanicIfError(err)

	// Parse multipart form
	err = request.ParseMultipartForm(10 << 20) // 10 MB max
	helper.PanicIfError(err)

	// Get message type
	messageType := request.FormValue("message_type")
	if messageType == "" {
		messageType = "document" // Default to document
	}

	// Get file
	file, fileHeader, err := request.FormFile("file")
	helper.PanicIfError(err)
	defer file.Close()

	messageResponse := controller.ChatService.SendFileMessage(request.Context(), userId, conversationId, messageType, fileHeader)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   messageResponse,
	}
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) GetMessages(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	conversationId, err := uuid.Parse(params.ByName("conversationId"))
	helper.PanicIfError(err)

	limit := 20
	offset := 0

	queryLimit := request.URL.Query().Get("limit")
	if queryLimit != "" {
		limit, err = strconv.Atoi(queryLimit)
		helper.PanicIfError(err)
	}

	queryOffset := request.URL.Query().Get("offset")
	if queryOffset != "" {
		offset, err = strconv.Atoi(queryOffset)
		helper.PanicIfError(err)
	}

	messagesResponse := controller.ChatService.FindMessagesByConversationId(request.Context(), userId, conversationId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   messagesResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) UpdateMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	messageId, err := uuid.Parse(params.ByName("messageId"))
	helper.PanicIfError(err)

	messageRequest := web.SendMessageRequest{}
	helper.ReadFromRequestBody(request, &messageRequest)

	messageResponse := controller.ChatService.UpdateMessage(request.Context(), userId, messageId, messageRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   messageResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ChatControllerImpl) DeleteMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	messageId, err := uuid.Parse(params.ByName("messageId"))
	helper.PanicIfError(err)

	controller.ChatService.DeleteMessage(request.Context(), userId, messageId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Message deleted successfully",
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// Pusher Auth
func (controller *ChatControllerImpl) AuthPusher(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		http.Error(writer, "Unauthorized", http.StatusUnauthorized)
		return
	}

	socketId := request.FormValue("socket_id")
	channel := request.FormValue("channel_name")

	// Validate channel access
	userChannel := fmt.Sprintf("private-user-%s", userId)
	if channel == userChannel {
		// User can access their own user channel
		auth, err := utils.PusherClient.AuthenticatePrivateChannel([]byte(socketId + ":" + channel))
		if err != nil {
			http.Error(writer, "Authentication failed", http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
		writer.Write(auth)
		return
	}

	// For conversation channels, check if the user is a participant
	if len(channel) > 23 && channel[:23] == "private-conversation-" {
		conversationIdStr := channel[23:]
		conversationId, err := uuid.Parse(conversationIdStr)
		if err != nil {
			http.Error(writer, "Invalid channel", http.StatusBadRequest)
			return
		}

		// Check if user is a participant in this conversation
		// Use the service to check if the user is a participant
		// by calling the service method directly
		conversation := controller.ChatService.FindConversationById(request.Context(), userId, conversationId)
		isParticipant := conversation.Id != uuid.Nil
		if isParticipant {
			auth, err := utils.PusherClient.AuthenticatePrivateChannel([]byte(socketId + ":" + channel))
			if err != nil {
				http.Error(writer, "Authentication failed", http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(auth)
			return
		}
	}

	// Not authorized for this channel
	http.Error(writer, "Forbidden", http.StatusForbidden)
}
