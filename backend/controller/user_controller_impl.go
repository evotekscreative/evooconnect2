package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type UserControllerImpl struct {
	UserService service.UserService
}

func NewUserController(userService service.UserService) UserController {
	return &UserControllerImpl{
		UserService: userService,
	}
}

func (controller *UserControllerImpl) GetProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string to UUID
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

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
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string to UUID
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

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

	userResponse := controller.UserService.GetByUsername(request.Context(), username)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   userResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserControllerImpl) UploadPhotoProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string to UUID
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Parse the multipart form file from request
	file, handler, err := request.FormFile("photo")
	if err != nil {
		panic(exception.NewBadRequestError("Error retrieving the file: " + err.Error()))
	}
	defer file.Close()

	filePath := controller.UserService.UploadPhotoProfile(request.Context(), userId, handler.Filename)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   filePath,
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
