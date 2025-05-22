package controller

import (
	"context"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type UserControllerImpl struct {
	UserService         service.UserService
	ProfileViewService  service.ProfileViewService
	NotificationService service.NotificationService
}

func NewUserController(
	userService service.UserService,
	profileViewService service.ProfileViewService,
	notificationService service.NotificationService) UserController {
	return &UserControllerImpl{
		UserService:         userService,
		ProfileViewService:  profileViewService,
		NotificationService: notificationService,
	}
}

func (controller *UserControllerImpl) GetProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	userResponse := controller.UserService.GetProfile(request.Context(), userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   userResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserControllerImpl) UpdateProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	updateProfileRequest := web.UpdateProfileRequest{}
	helper.ReadFromRequestBody(request, &updateProfileRequest)

	userResponse := controller.UserService.UpdateProfile(request.Context(), userId, updateProfileRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   userResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserControllerImpl) GetByUsername(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	username := params.ByName("username")
	
	// Ambil ID pengguna yang sedang login dari context
	currentUserIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized"))
	}
	currentUserId, err := uuid.Parse(currentUserIdStr)
	helper.PanicIfError(err)
	
	// Panggil service untuk mendapatkan profil pengguna
	userResponse := controller.UserService.GetByUsername(request.Context(), username)
	
	// Jika pengguna ditemukan, catat kunjungan profil
	if userResponse.ID != uuid.Nil && userResponse.ID != currentUserId {
		// Catat kunjungan profil
		err := controller.ProfileViewService.RecordView(request.Context(), userResponse.ID, currentUserId)
		if err != nil {
			// Log error tapi jangan gagalkan request
			fmt.Printf("Error recording profile view: %v\n", err)
		}
		
		// Kirim notifikasi ke pemilik profil
		if controller.NotificationService != nil {
			go func() {
				// Ambil data pengguna yang sedang login
				currentUser := controller.UserService.GetProfile(context.Background(), currentUserId)
				
				refType := "profile_visit"
				controller.NotificationService.Create(
					context.Background(),
					userResponse.ID,
					string(domain.NotificationCategoryProfile),
					string(domain.NotificationTypeProfileVisit),
					"Profile Visit",
					fmt.Sprintf("%s viewed your profile", currentUser.Name),
					nil,
					&refType,
					&currentUserId,
				)
			}()
		}
	}

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   userResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserControllerImpl) UploadPhotoProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse multipart form with 10 MB max memory
	err := helper.ParseMultipartForm(request, 10) // 10 MB limit
	helper.PanicIfError(err)

	// Get user_id from context that was set by auth middleware
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Handle image uploads
	var file *multipart.FileHeader = nil
	form := request.MultipartForm
	files := form.File["photo"]
	if len(files) > 0 {
		file = files[0]
	}

	userResponse := controller.UserService.UploadPhotoProfile(request.Context(), userId, file)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   userResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserControllerImpl) DeletePhotoProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to delete photo profile
	userResponse := controller.UserService.DeletePhotoProfile(request.Context(), userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   userResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserControllerImpl) GetPeoples(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get current user ID from context
	currentUserIdStr := request.Context().Value("user_id").(string)

	// Parse query parameters for pagination
	limit := 10 // default limit
	offset := 0 // default offset

	limitParam := request.URL.Query().Get("limit")
	offsetParam := request.URL.Query().Get("offset")

	if limitParam != "" {
		parsedLimit, err := strconv.Atoi(limitParam)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if offsetParam != "" {
		parsedOffset, err := strconv.Atoi(offsetParam)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Call service to get users not connected with current user
	peopleResponses := controller.UserService.GetPeoples(request.Context(), limit, offset, currentUserIdStr)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   peopleResponses,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}
