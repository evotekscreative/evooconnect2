package controller

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"evoconnect/backend/utils"
	"fmt"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
	"strings"
)

type NotificationControllerImpl struct {
	NotificationService service.NotificationService
}

func NewNotificationController(notificationService service.NotificationService) NotificationController {
	return &NotificationControllerImpl{
		NotificationService: notificationService,
	}
}

// Di NotificationControllerImpl.go
func (controller *NotificationControllerImpl) GetNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse query params
	limit := 10 // Default
	offset := 0 // Default
	category := request.URL.Query().Get("category") // Get category from query param

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		parsedLimit, err := strconv.Atoi(limitParam)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		parsedOffset, err := strconv.Atoi(offsetParam)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Get notifications with category filter
	notificationListResponse := controller.NotificationService.GetNotifications(request.Context(), userId, category, limit, offset)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   notificationListResponse,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *NotificationControllerImpl) MarkAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil user ID dari context sebagai string
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string menjadi UUID
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	markReadRequest := web.MarkNotificationReadRequest{}
	helper.ReadFromRequestBody(request, &markReadRequest)

	unreadCount := controller.NotificationService.MarkAsRead(request.Context(), userId, markReadRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data: map[string]interface{}{
			"unread_count": unreadCount,
		},
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *NotificationControllerImpl) MarkAllAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil user ID dari context sebagai string
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string menjadi UUID
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	category := request.URL.Query().Get("category")

	unreadCount := controller.NotificationService.MarkAllAsRead(request.Context(), userId, category)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data: map[string]interface{}{
			"unread_count": unreadCount,
		},
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *NotificationControllerImpl) AuthPusher(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse form data
	err := request.ParseForm()
	helper.PanicIfError(err)

	socketId := request.PostForm.Get("socket_id")
	channelName := request.PostForm.Get("channel_name")

	fmt.Printf("Pusher auth request: socketId=%s, channelName=%s\n", socketId, channelName)

	// Get user ID from context
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Validate channel name for private channels
	if strings.HasPrefix(channelName, "private-user-") {
		// Extract user ID from channel name
		channelUserId := strings.TrimPrefix(channelName, "private-user-")

		fmt.Printf("Channel user ID: %s, Current user ID: %s\n", channelUserId, userId.String())

		// Verify that the user is only subscribing to their own channel
		if channelUserId != userId.String() {
			panic(exception.NewForbiddenError("Cannot subscribe to another user's channel"))
		}
	}

	// Buat respons autentikasi manual
	authString := socketId + ":" + channelName

	// Generate HMAC SHA256 signature
	key := []byte(utils.PusherClient.Secret)
	h := hmac.New(sha256.New, key)
	h.Write([]byte(authString))
	signature := hex.EncodeToString(h.Sum(nil))

	authJson := fmt.Sprintf(`{"auth":"%s:%s"}`, utils.PusherClient.Key, signature)

	fmt.Printf("Pusher auth successful\n")

	writer.Header().Set("Content-Type", "application/json")
	writer.Write([]byte(authJson))
}

// Tambahkan metode DeleteNotifications
func (controller *NotificationControllerImpl) DeleteNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil user ID dari context
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string menjadi UUID
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Ambil parameter kategori dari query string
	category := request.URL.Query().Get("category")

	// Hapus notifikasi
	deletedCount := controller.NotificationService.DeleteNotifications(request.Context(), userId, category)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data: map[string]interface{}{
			"deleted_count": deletedCount,
			"message":       "Notifications deleted successfully",
		},
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *NotificationControllerImpl) DeleteSelectedNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil user ID dari context
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string menjadi UUID
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Ambil parameter kategori dari query string (opsional)
	category := request.URL.Query().Get("category")

	// Parse request body untuk mendapatkan daftar ID notifikasi yang akan dihapus
	var deleteRequest web.DeleteNotificationsRequest
	helper.ReadFromRequestBody(request, &deleteRequest)

	// Validasi request
	if len(deleteRequest.NotificationIds) == 0 {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Notification IDs cannot be empty",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Hapus notifikasi yang dipilih, dengan filter kategori jika ada
	deletedCount := controller.NotificationService.DeleteSelectedNotifications(request.Context(), userId, deleteRequest.NotificationIds, category)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data: map[string]interface{}{
			"deleted_count": deletedCount,
			"message":       "Selected notifications deleted successfully",
		},
	}

	helper.WriteToResponseBody(writer, webResponse)
}
