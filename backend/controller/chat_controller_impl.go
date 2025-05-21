package controller

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"evoconnect/backend/utils"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	"github.com/pusher/pusher-http-go/v5"
)

type ChatControllerImpl struct {
	ChatService  service.ChatService
	PusherClient *pusher.Client
}

func NewChatController(chatService service.ChatService) ChatController {
	return &ChatControllerImpl{
		ChatService:  chatService,
		PusherClient: utils.PusherClient,
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

type AuthPusherRequest struct {
	SocketId    string `json:"socket_id"`
	ChannelName string `json:"channel_name"`
}

// Pusher Auth
func (c *ChatControllerImpl) AuthPusher(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var socketId, channelName string

	// Log the content type for debugging
	contentType := r.Header.Get("Content-Type")
	log.Printf("Request Content-Type: %s", contentType)

	// Handle multipart form data (what your client is sending)
	if strings.Contains(contentType, "multipart/form-data") {
		// Parse multipart form with 10MB max memory
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			log.Printf("Error parsing multipart form: %v", err)
		} else {
			// Get form values
			if values, ok := r.MultipartForm.Value["socket_id"]; ok && len(values) > 0 {
				socketId = values[0]
			}
			if values, ok := r.MultipartForm.Value["channel_name"]; ok && len(values) > 0 {
				channelName = values[0]
			}
			log.Printf("Multipart form data - socket_id: %s, channel_name: %s", socketId, channelName)
		}
	} else {
		// Handle regular form data as fallback
		if err := r.ParseForm(); err == nil {
			socketId = r.FormValue("socket_id")
			channelName = r.FormValue("channel_name")
			log.Printf("Regular form data - socket_id: %s, channel_name: %s", socketId, channelName)
		}
	}

	// Log the actual form data as received
	log.Printf("Raw form data: %+v", r.Form)
	if r.MultipartForm != nil {
		log.Printf("Raw multipart form values: %+v", r.MultipartForm.Value)
	}

	log.Printf("Final values - Socket ID: %s, Channel: %s", socketId, channelName)

	if socketId == "" || channelName == "" {
		log.Printf("Missing required parameters - socketId: %s, channelName: %s", socketId, channelName)
		http.Error(w, "Missing required parameters", http.StatusBadRequest)
		return
	}

	// Pusher authentication logic
	appKey := "a579dc17c814f8b723ea"    // Replace with your actual app key
	appSecret := "70748119d8ea53eece72" // Replace with your actual app secret

	// Create the string to sign
	stringToSign := fmt.Sprintf("%s:%s", socketId, channelName)

	// Create HMAC SHA256 signature
	h := hmac.New(sha256.New, []byte(appSecret))
	h.Write([]byte(stringToSign))
	signature := hex.EncodeToString(h.Sum(nil))

	// Create auth response
	authString := fmt.Sprintf("%s:%s", appKey, signature)
	authResponse := map[string]string{
		"auth": authString,
	}

	// Return the response
	w.Header().Set("Content-Type", "application/json")
	jsonResponse, _ := json.Marshal(authResponse)
	log.Printf("Sending auth response: %s", string(jsonResponse))
	w.Write(jsonResponse)
}
