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
	// Parse multipart form with 10 MB max memory
	err := helper.ParseMultipartForm(request, 10)
	helper.PanicIfError(err)

	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Create post request
	createRequest := web.CreatePostRequest{}
	helper.ReadFromMultipartForm(request, &createRequest)

	// Handle image uploads
	form := request.MultipartForm
	files := form.File["images"]

	// Call service to create post with images
	response := controller.PostService.Create(request.Context(), userId, createRequest, files)

	// Create web response
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   response,
	}

	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse multipart form with 10 MB max memory
	err := helper.ParseMultipartForm(request, 10) // 10 MB limit
	helper.PanicIfError(err)

	// Get post ID from path params
	postId, err := uuid.Parse(params.ByName("postId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Create update request
	updateRequest := web.UpdatePostRequest{}
	helper.ReadFromMultipartForm(request, &updateRequest)

	form := request.MultipartForm
	files := form.File["images"]

	// Call service to update post with new images
	response := controller.PostService.Update(request.Context(), postId, userId, updateRequest, files)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user_id from context that was set by auth middleware
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

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
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

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
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

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

	// Ubah urutan parameter sesuai dengan yang diharapkan service
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
	currentUserId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

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
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

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
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

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

func (controller *PostControllerImpl) PinPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil post_id dari URL params
	postId, err := uuid.Parse(params.ByName("postId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	// Ambil user_id dari token JWT
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Panggil service untuk menyematkan post
	postResponse := controller.PostService.PinPost(request.Context(), postId, userId)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponse,
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) UnpinPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil post_id dari URL params
	postId, err := uuid.Parse(params.ByName("postId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	// Ambil user_id dari token JWT
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Panggil service untuk melepas pin post
	postResponse := controller.PostService.UnpinPost(request.Context(), postId, userId)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   postResponse,
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}


func (controller *PostControllerImpl) FindMyPendingPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Get user ID from token
    userIdStr, ok := request.Context().Value("user_id").(string)
    if !ok {
        panic(exception.NewUnauthorizedError("Unauthorized"))
    }
    
    userId, err := uuid.Parse(userIdStr)
    if err != nil {
        panic(exception.NewUnauthorizedError("Invalid user ID"))
    }

    // Get query parameters for pagination
    limitStr := request.URL.Query().Get("limit")
    offsetStr := request.URL.Query().Get("offset")

    limit := 10 // Default limit
    offset := 0 // Default offset

    if limitStr != "" {
        limitInt, err := strconv.Atoi(limitStr)
        if err == nil && limitInt > 0 {
            limit = limitInt
        }
    }

    if offsetStr != "" {
        offsetInt, err := strconv.Atoi(offsetStr)
        if err == nil && offsetInt >= 0 {
            offset = offsetInt
        }
    }

    // Get pending posts for the user
    pendingPosts := controller.PostService.FindPendingPostsByUserId(request.Context(), userId, limit, offset)

    // Create response
    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   pendingPosts,
    }

    // Send response
    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *PostControllerImpl) FindMyPendingPostsByGroupId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Get user ID from token
    userIdStr, ok := request.Context().Value("user_id").(string)
    if !ok {
        panic(exception.NewUnauthorizedError("Unauthorized"))
    }
    
    userId, err := uuid.Parse(userIdStr)
    if err != nil {
        panic(exception.NewUnauthorizedError("Invalid user ID"))
    }

    // Get group ID from URL params
    groupId, err := uuid.Parse(params.ByName("groupId"))
    if err != nil {
        panic(exception.NewBadRequestError("Invalid group ID format"))
    }

    // Get query parameters for pagination
    limitStr := request.URL.Query().Get("limit")
    offsetStr := request.URL.Query().Get("offset")

    limit := 10 // Default limit
    offset := 0 // Default offset

    if limitStr != "" {
        limitInt, err := strconv.Atoi(limitStr)
        if err == nil && limitInt > 0 {
            limit = limitInt
        }
    }

    if offsetStr != "" {
        offsetInt, err := strconv.Atoi(offsetStr)
        if err == nil && offsetInt >= 0 {
            offset = offsetInt
        }
    }

    // Get pending posts for the user in the specified group
    pendingPosts := controller.PostService.FindPendingPostsByUserIdAndGroupId(request.Context(), userId, groupId, limit, offset)

    // Create response
    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   pendingPosts,
    }

    // Send response
    helper.WriteToResponseBody(writer, webResponse)
}
