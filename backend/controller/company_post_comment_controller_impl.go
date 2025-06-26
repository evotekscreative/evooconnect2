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

type CompanyPostCommentControllerImpl struct {
	CompanyPostCommentService service.CompanyPostCommentService
}

func NewCompanyPostCommentController(companyPostCommentService service.CompanyPostCommentService) CompanyPostCommentController {
	return &CompanyPostCommentControllerImpl{
		CompanyPostCommentService: companyPostCommentService,
	}
}

// Helper function to parse and validate UUID
func (controller *CompanyPostCommentControllerImpl) parseUUID(uuidStr, fieldName string) uuid.UUID {
	if uuidStr == "" {
		panic(exception.NewBadRequestError(fieldName + " is required"))
	}

	parsedUUID, err := uuid.Parse(uuidStr)
	if err != nil {
		panic(exception.NewBadRequestError("invalid " + fieldName + " format: " + err.Error()))
	}

	return parsedUUID
}

// Helper function to get user ID from context
func (controller *CompanyPostCommentControllerImpl) getUserIdFromContext(request *http.Request) uuid.UUID {
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok || userIdStr == "" {
		panic(exception.NewUnauthorizedError("user not authenticated"))
	}

	return controller.parseUUID(userIdStr, "user ID")
}

// CreateComment - Create main comment
func (controller *CompanyPostCommentControllerImpl) CreateComment(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId := controller.parseUUID(postIdStr, "post ID")

	// Parse request body
	var createRequest web.CreateCompanyPostCommentRequest
	helper.ReadFromRequestBody(request, &createRequest)

	// Validate required fields
	if createRequest.Content == "" {
		panic(exception.NewBadRequestError("content is required"))
	}

	// Create main comment
	response := controller.CompanyPostCommentService.CreateComment(request.Context(), userId, postId, createRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// CreateReply - Create reply comment
func (controller *CompanyPostCommentControllerImpl) CreateReply(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId := controller.parseUUID(postIdStr, "post ID")

	// Parse request body
	var replyRequest web.CreateCompanyPostReplyRequest
	helper.ReadFromRequestBody(request, &replyRequest)

	// Validate required fields
	if replyRequest.Content == "" {
		panic(exception.NewBadRequestError("content is required"))
	}

	// Create reply comment
	response := controller.CompanyPostCommentService.CreateReply(request.Context(), userId, postId, replyRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// CreateSubReply - Create sub-reply comment
func (controller *CompanyPostCommentControllerImpl) CreateSubReply(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId := controller.parseUUID(postIdStr, "post ID")

	// Parse request body
	var subReplyRequest web.CreateCompanyPostSubReplyRequest
	helper.ReadFromRequestBody(request, &subReplyRequest)

	// Validate required fields
	if subReplyRequest.Content == "" {
		panic(exception.NewBadRequestError("content is required"))
	}

	// Create sub-reply comment
	response := controller.CompanyPostCommentService.CreateSubReply(request.Context(), userId, postId, subReplyRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// Update comment
func (controller *CompanyPostCommentControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get comment ID from URL params
	commentIdStr := params.ByName("commentId")
	commentId := controller.parseUUID(commentIdStr, "comment ID")

	// Parse request body
	var updateRequest web.UpdateCompanyPostCommentRequest
	helper.ReadFromRequestBody(request, &updateRequest)

	// Validate required fields
	if updateRequest.Content == "" {
		panic(exception.NewBadRequestError("content is required"))
	}

	response := controller.CompanyPostCommentService.Update(request.Context(), userId, commentId, updateRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// Delete comment
func (controller *CompanyPostCommentControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get comment ID from URL params
	commentIdStr := params.ByName("commentId")
	commentId := controller.parseUUID(commentIdStr, "comment ID")

	controller.CompanyPostCommentService.Delete(request.Context(), userId, commentId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Company post comment deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// FindById - Get comment by ID
func (controller *CompanyPostCommentControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get comment ID from URL params
	commentIdStr := params.ByName("commentId")
	commentId := controller.parseUUID(commentIdStr, "comment ID")

	response := controller.CompanyPostCommentService.FindById(request.Context(), commentId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// GetCommentsByPostId - Get all main comments by post ID
func (controller *CompanyPostCommentControllerImpl) GetCommentsByPostId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get post ID from URL params
	postIdStr := params.ByName("postId")
	postId := controller.parseUUID(postIdStr, "post ID")

	// Get query parameters for pagination
	query := request.URL.Query()

	limit := 20
	if limitStr := query.Get("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		} else if err != nil {
			panic(exception.NewBadRequestError("invalid limit parameter: " + err.Error()))
		}
	}

	offset := 0
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if parsed, err := strconv.Atoi(offsetStr); err == nil && parsed >= 0 {
			offset = parsed
		} else if err != nil {
			panic(exception.NewBadRequestError("invalid offset parameter: " + err.Error()))
		}
	}

	response := controller.CompanyPostCommentService.GetCommentsByPostId(request.Context(), postId, userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// GetRepliesByParentId - Get all replies by parent comment ID
func (controller *CompanyPostCommentControllerImpl) GetRepliesByParentId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId := controller.getUserIdFromContext(request)

	// Get parent comment ID from URL params
	parentIdStr := params.ByName("commentId")
	parentId := controller.parseUUID(parentIdStr, "parent comment ID")

	// Get query parameters for pagination
	query := request.URL.Query()

	limit := 20
	if limitStr := query.Get("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		} else if err != nil {
			panic(exception.NewBadRequestError("invalid limit parameter: " + err.Error()))
		}
	}

	offset := 0
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if parsed, err := strconv.Atoi(offsetStr); err == nil && parsed >= 0 {
			offset = parsed
		} else if err != nil {
			panic(exception.NewBadRequestError("invalid offset parameter: " + err.Error()))
		}
	}

	response := controller.CompanyPostCommentService.GetRepliesByParentId(request.Context(), parentId, userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
