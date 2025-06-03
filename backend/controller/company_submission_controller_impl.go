package controller

import (
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type CompanySubmissionControllerImpl struct {
	CompanySubmissionService service.CompanySubmissionService
}

func NewCompanySubmissionController(companySubmissionService service.CompanySubmissionService) CompanySubmissionController {
	return &CompanySubmissionControllerImpl{
		CompanySubmissionService: companySubmissionService,
	}
}

func (controller *CompanySubmissionControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse multipart form
	err := request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Failed to parse form data",
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid user ID",
		})
		return
	}

	// Create request from form data
	createRequest := web.CreateCompanySubmissionRequest{
		Name:        request.FormValue("name"),
		LinkedinUrl: request.FormValue("linkedin_url"),
		Website:     request.FormValue("website"),
		Industry:    request.FormValue("industry"),
		Size:        request.FormValue("size"),
		Type:        request.FormValue("type"),
		Tagline:     request.FormValue("tagline"),
	}

	// Get logo file
	logoFile, logoHeader, err := request.FormFile("logo")
	var logoHeaderPtr *multipart.FileHeader
	if err == nil {
		logoFile.Close()
		logoHeaderPtr = logoHeader
	}

	// Create submission
	response := controller.CompanySubmissionService.Create(request.Context(), userId, createRequest, logoHeaderPtr)

	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	submissionId, err := uuid.Parse(params.ByName("submissionId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid submission ID format"))
	}

	response := controller.CompanySubmissionService.FindById(request.Context(), submissionId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) FindByUserId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (set by auth middleware)
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid user ID",
		})
		return
	}

	responses := controller.CompanySubmissionService.FindByUserId(request.Context(), userId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   responses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get query parameters with default values
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	// Set default values
	limit := 10
	offset := 0

	// Parse limit parameter
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	// Parse offset parameter
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Log untuk debugging
	fmt.Printf("FindAll called with limit: %d, offset: %d\n", limit, offset)

	responses := controller.CompanySubmissionService.FindAll(request.Context(), limit, offset)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   responses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) FindByStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	status := params.ByName("status")

	// Validate status
	validStatuses := map[string]bool{
		"pending":  true,
		"approved": true,
		"rejected": true,
	}

	if !validStatuses[status] {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid status. Must be: pending, approved, or rejected",
		})
		return
	}

	// Get query parameters with default values
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	// Set default values
	limit := 10
	offset := 0

	// Parse limit parameter
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	// Parse offset parameter
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Log untuk debugging
	fmt.Printf("FindByStatus called with status: %s, limit: %d, offset: %d\n", status, limit, offset)

	responses := controller.CompanySubmissionService.FindByStatus(request.Context(), status, limit, offset)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   responses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) Review(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	submissionId, err := uuid.Parse(params.ByName("submissionId"))
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid submission ID",
		})
		return
	}

	fmt.Printf("Review called for submission ID: %s\n", submissionId)
	// Get reviewer ID from context (set by auth middleware)
	reviewerId, err := helper.GetAdminIdFromToken(request)
	if err != nil {
		helper.PanicIfError(err)
	}

	fmt.Printf("Reviewer ID: %s\n", reviewerId)
	var reviewRequest web.ReviewCompanySubmissionRequest
	decoder := json.NewDecoder(request.Body)
	err = decoder.Decode(&reviewRequest)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid request body",
		})
		return
	}

	fmt.Printf("Review request: %+v\n", reviewRequest)
	response := controller.CompanySubmissionService.Review(request.Context(), submissionId, reviewerId, reviewRequest)
	fmt.Printf("Review response: %+v\n", response)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	stats := controller.CompanySubmissionService.GetSubmissionStats(request.Context())

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   stats,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanySubmissionControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	submissionId, err := uuid.Parse(params.ByName("submissionId"))
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid submission ID",
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Invalid user ID",
		})
		return
	}

	controller.CompanySubmissionService.Delete(request.Context(), submissionId, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusNoContent,
		Status: "NO_CONTENT",
		Data:   nil,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
