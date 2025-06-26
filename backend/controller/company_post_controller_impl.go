package controller

import (
	"encoding/json"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type CompanyPostControllerImpl struct {
	CompanyPostService service.CompanyPostService
}

func NewCompanyPostController(companyPostService service.CompanyPostService) CompanyPostController {
	return &CompanyPostControllerImpl{
		CompanyPostService: companyPostService,
	}
}

func (controller *CompanyPostControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (set by middleware)
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Parse multipart form
	err = request.ParseMultipartForm(32 << 20) // 32MB max memory
	helper.PanicIfError(err)

	// Get company_id from form
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	helper.PanicIfError(err)

	// Create request object
	createRequest := web.CreateCompanyPostRequest{
		CompanyId:      companyId,
		Content:        request.FormValue("content"),
		Visibility:     request.FormValue("visibility"),
		IsAnnouncement: request.FormValue("is_announcement") == "true",
	}

	// Get uploaded files
	var files []*multipart.FileHeader
	if request.MultipartForm != nil && request.MultipartForm.File != nil {
		if fileHeaders, exists := request.MultipartForm.File["images"]; exists {
			files = fileHeaders
		}
	}

	response := controller.CompanyPostService.Create(request.Context(), userId, createRequest, files)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	helper.PanicIfError(err)

	// Parse multipart form
	err = request.ParseMultipartForm(32 << 20)
	helper.PanicIfError(err)
	// Parse existing_images from form (JSON string)
	existingImagesStr := request.FormValue("existing_images")
	var existingImages []string
	if existingImagesStr != "" {
		err = json.Unmarshal([]byte(existingImagesStr), &existingImages)
		helper.PanicIfError(err)
	}

	// Parse removed_images from form (JSON string)
	removedImagesStr := request.FormValue("removed_images")
	var removedImages []string
	if removedImagesStr != "" {
		err = json.Unmarshal([]byte(removedImagesStr), &removedImages)
		helper.PanicIfError(err)
	}

	// Create update request
	updateRequest := web.UpdateCompanyPostRequest{
		Content:        request.FormValue("content"),
		Visibility:     request.FormValue("visibility"),
		IsAnnouncement: request.FormValue("is_announcement") == "true",
		ExistingImages: existingImages,
		RemovedImages:  removedImages,
	}

	// Get new uploaded files
	var files []*multipart.FileHeader
	if request.MultipartForm != nil && request.MultipartForm.File != nil {
		if fileHeaders, exists := request.MultipartForm.File["new_images"]; exists {
			files = fileHeaders
		}
	}

	response := controller.CompanyPostService.Update(request.Context(), userId, postId, updateRequest, files)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	helper.PanicIfError(err)

	controller.CompanyPostService.Delete(request.Context(), userId, postId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Company post deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (untuk visibility check)
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	helper.PanicIfError(err)

	response := controller.CompanyPostService.FindById(request.Context(), postId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Get company ID from URL params
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	helper.PanicIfError(err)

	// Get query parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		helper.PanicIfError(err)
	}

	offset := 0 // default
	if offsetStr != "" {
		offset, err = strconv.Atoi(offsetStr)
		helper.PanicIfError(err)
	}

	// Validate limits
	if limit > 100 {
		limit = 100
	}
	if limit < 1 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	response := controller.CompanyPostService.FindByCompanyId(request.Context(), companyId, userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) FindByCreatorId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	creatorIdStr := params.ByName("userId")
	creatorId, err := uuid.Parse(creatorIdStr)
	helper.PanicIfError(err)

	// Get query parameters
	query := request.URL.Query()

	// Parse limit and offset
	limit := 10
	if limitStr := query.Get("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if parsed, err := strconv.Atoi(offsetStr); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	response := controller.CompanyPostService.FindByCreatorId(request.Context(), creatorId, userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Parse query parameters
	query := request.URL.Query()

	// Parse company_id if provided
	var companyId *uuid.UUID
	if companyIdStr := query.Get("company_id"); companyIdStr != "" {
		parsed, err := uuid.Parse(companyIdStr)
		if err == nil {
			companyId = &parsed
		}
	}

	// Parse creator_id if provided
	var creatorId *uuid.UUID
	if creatorIdStr := query.Get("creator_id"); creatorIdStr != "" {
		parsed, err := uuid.Parse(creatorIdStr)
		if err == nil {
			creatorId = &parsed
		}
	}

	// Parse limit and offset
	limit := 10
	if limitStr := query.Get("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if parsed, err := strconv.Atoi(offsetStr); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	// Create filter request
	filter := web.CompanyPostFilterRequest{
		CompanyId:  companyId,
		Visibility: query.Get("visibility"),
		CreatorId:  creatorId,
		Search:     query.Get("search"),
		Limit:      limit,
		Offset:     offset,
	}

	response := controller.CompanyPostService.FindWithFilters(request.Context(), userId, filter)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) LikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	helper.PanicIfError(err)

	controller.CompanyPostService.LikePost(request.Context(), userId, postId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Company post liked successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyPostControllerImpl) UnlikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	helper.PanicIfError(err)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	helper.PanicIfError(err)

	controller.CompanyPostService.UnlikePost(request.Context(), userId, postId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Company post unliked successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}
