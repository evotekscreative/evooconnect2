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

type PostControllerImpl struct {
	PostService service.PostService
}

func NewPostController(postService service.PostService) PostController {
	return &PostControllerImpl{
		PostService: postService,
	}
}

func (controller *PostControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	createPostRequest := web.CreatePostRequest{}
	helper.ReadFromRequestBody(request, &createPostRequest)

	postResponse := controller.PostService.Create(request.Context(), userId, createPostRequest)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   postResponse,
	}

	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse post_id from path
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	updatePostRequest := web.UpdatePostRequest{}
	helper.ReadFromRequestBody(request, &updatePostRequest)

	postResponse := controller.PostService.Update(request.Context(), postId, userId, updatePostRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse post_id from path
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	controller.PostService.Delete(request.Context(), postId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Post deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse post_id from path
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	postResponse := controller.PostService.FindById(request.Context(), postId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Get pagination parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // Default limit
	if limitStr != "" {
		limitInt, err := strconv.Atoi(limitStr)
		if err == nil && limitInt > 0 {
			limit = limitInt
		}
	}

	offset := 0 // Default offset
	if offsetStr != "" {
		offsetInt, err := strconv.Atoi(offsetStr)
		if err == nil && offsetInt >= 0 {
			offset = offsetInt
		}
	}

	postResponses := controller.PostService.FindAll(request.Context(), limit, offset, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) FindByUserId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	currentUserIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse string to UUID
	currentUserId, err := uuid.Parse(currentUserIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Parse target user_id from path
	targetUserIdStr := params.ByName("userId")
	targetUserId, err := uuid.Parse(targetUserIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid target user ID format"))
	}

	// Get pagination parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // Default limit
	if limitStr != "" {
		limitInt, err := strconv.Atoi(limitStr)
		if err == nil && limitInt > 0 {
			limit = limitInt
		}
	}

	offset := 0 // Default offset
	if offsetStr != "" {
		offsetInt, err := strconv.Atoi(offsetStr)
		if err == nil && offsetInt >= 0 {
			offset = offsetInt
		}
	}

	postResponses := controller.PostService.FindByUserId(request.Context(), targetUserId, limit, offset, currentUserId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) LikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse post_id from path
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	postResponse := controller.PostService.LikePost(request.Context(), postId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) UnlikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse post_id from path
	postIdStr := params.ByName("postId")
	postId, err := uuid.Parse(postIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	postResponse := controller.PostService.UnlikePost(request.Context(), postId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// New method for uploading post images
func (controller *PostControllerImpl) UploadImages(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Set maximum upload size - 10MB
	request.ParseMultipartForm(10 << 20) // 10MB

	// Get user_id from context
	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Get files from form
	files := request.MultipartForm.File["images"]
	if len(files) == 0 {
		panic(exception.NewBadRequestError("No images provided"))
	}

	// Call service to save images
	fileResponse := controller.PostService.UploadImages(request.Context(), userId, files)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   fileResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
