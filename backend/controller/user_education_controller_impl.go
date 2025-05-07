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

type EducationControllerImpl struct {
	EducationService service.EducationService
}

func NewEducationController(educationService service.EducationService) EducationController {
	return &EducationControllerImpl{
		EducationService: educationService,
	}
}

func (controller *EducationControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Read request body
	createRequest := web.CreateEducationRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	// Get user_id from context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to create education
	educationResponse := controller.EducationService.Create(request.Context(), userId, createRequest)

	// Create response
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   educationResponse,
	}

	// Send response
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *EducationControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Read request body
	updateRequest := web.UpdateEducationRequest{}
	helper.ReadFromRequestBody(request, &updateRequest)

	// Get education_id from URL params
	educationId, err := uuid.Parse(params.ByName("educationId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid education ID format"))
	}

	// Get user_id from context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to update education
	educationResponse := controller.EducationService.Update(request.Context(), educationId, userId, updateRequest)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   educationResponse,
	}

	// Send response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *EducationControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get education_id from URL params
	educationId, err := uuid.Parse(params.ByName("educationId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid education ID format"))
	}

	// Get user_id from context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Call service to delete education
	controller.EducationService.Delete(request.Context(), educationId, userId)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Education entry deleted successfully",
	}

	// Send response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *EducationControllerImpl) GetById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get education_id from URL params
	educationId, err := uuid.Parse(params.ByName("educationId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid education ID format"))
	}

	// Call service to get education by ID
	educationResponse := controller.EducationService.GetById(request.Context(), educationId)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   educationResponse,
	}

	// Send response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *EducationControllerImpl) GetByUserId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from URL params
	userId, err := uuid.Parse(params.ByName("userId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Parse query params for pagination
	limit := 10 // Default
	offset := 0 // Default

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

	// Call service to get education entries by user ID
	educationListResponse := controller.EducationService.GetByUserId(request.Context(), userId, limit, offset)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   educationListResponse,
	}

	// Send response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *EducationControllerImpl) UploadPhoto(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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
	filename := helper.SaveUploadedFile(file, "education", userId, ext)

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
