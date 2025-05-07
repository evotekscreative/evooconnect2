package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type ExperienceControllerImpl struct {
	ExperienceService service.ExperienceService
}

func NewExperienceController(experienceService service.ExperienceService) ExperienceController {
	return &ExperienceControllerImpl{
		ExperienceService: experienceService,
	}
}

func (controller *ExperienceControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Read request body
	createRequest := web.ExperienceCreateRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	// Get user_id from context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to create experience
	experienceResponse := controller.ExperienceService.Create(request.Context(), userId, createRequest)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   experienceResponse,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ExperienceControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Read request body
	updateRequest := web.ExperienceUpdateRequest{}
	helper.ReadFromRequestBody(request, &updateRequest)

	// Get experience_id from URL params
	experienceId, err := uuid.Parse(params.ByName("experienceId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid experience ID format"))
	}

	// Get user_id from context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to update experience
	experienceResponse := controller.ExperienceService.Update(request.Context(), experienceId, userId, updateRequest)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   experienceResponse,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ExperienceControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get experience_id from URL params
	experienceId, err := uuid.Parse(params.ByName("experienceId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid experience ID format"))
	}

	// Get user_id from context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to delete experience
	controller.ExperienceService.Delete(request.Context(), experienceId, userId)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   "Experience deleted successfully",
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ExperienceControllerImpl) GetById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get experience_id from URL params
	experienceId, err := uuid.Parse(params.ByName("experienceId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid experience ID format"))
	}

	// Call service to get experience
	experienceResponse := controller.ExperienceService.GetById(request.Context(), experienceId)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   experienceResponse,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ExperienceControllerImpl) GetByUserId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from URL params
	userIdStr := params.ByName("userId")
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Get limit and offset query params
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err == nil && l > 0 {
			limit = l
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		o, err := strconv.Atoi(offsetStr)
		if err == nil && o >= 0 {
			offset = o
		}
	}

	// Call service to get experiences
	experienceResponses := controller.ExperienceService.GetByUserId(request.Context(), userId, limit, offset)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   experienceResponses,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ExperienceControllerImpl) UploadPhoto(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse multipart form with 10 MB max memory
	err := request.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		panic(exception.NewBadRequestError("Failed to parse form: " + err.Error()))
	}

	// Get file from form
	file, handler, err := request.FormFile("photo")
	if err != nil {
		panic(exception.NewBadRequestError("No file uploaded or invalid file field"))
	}
	defer file.Close()

	// Check file type
	ext := filepath.Ext(handler.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		panic(exception.NewBadRequestError("Only JPG, JPEG and PNG files are allowed"))
	}

	// Get user_id from context (set by JWT middleware)
	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Generate unique filename
	userId := userIdString
	filename := helper.SaveUploadedFile(file, "experience", userId, ext)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data: map[string]string{
			"photo": filename,
		},
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}
