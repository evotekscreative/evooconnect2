package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"

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
