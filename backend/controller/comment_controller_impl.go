package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"fmt"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type CommentControllerImpl struct {
	CommentService service.CommentService
}

func NewCommentController(commentService service.CommentService) CommentController {
	return &CommentControllerImpl{
		CommentService: commentService,
	}
}

func (controller *CommentControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Baca body request
	createRequest := web.CreateCommentRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	// Ambil post_id dari URL params
	postId, err := uuid.Parse(params.ByName("postId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	// Panggil service untuk membuat komentar
	commentResponse := controller.CommentService.Create(request.Context(), postId, userId, createRequest)

	// Buat response
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   commentResponse,
	}

	// Kirim response
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentControllerImpl) GetByPostId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil post_id dari URL params
	postId, err := uuid.Parse(params.ByName("postId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid post ID format"))
	}

	// Parse query params untuk pagination
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

	// Panggil service untuk mendapatkan komentar
	commentResponses := controller.CommentService.GetByPostId(request.Context(), postId, limit, offset)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   commentResponses,
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentControllerImpl) GetById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil comment_id dari URL params
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	// Panggil service untuk mendapatkan komentar
	commentResponse := controller.CommentService.GetById(request.Context(), commentId)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   commentResponse,
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Baca body request
	updateRequest := web.CreateCommentRequest{}
	helper.ReadFromRequestBody(request, &updateRequest)

	// Ambil comment_id dari URL params
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	// Panggil service untuk memperbarui komentar
	commentResponse := controller.CommentService.Update(request.Context(), commentId, userId, updateRequest)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   commentResponse,
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Ambil comment_id dari URL params
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	// Panggil service untuk menghapus komentar
	controller.CommentService.Delete(request.Context(), commentId, userId)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Comment deleted successfully",
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentControllerImpl) Reply(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Baca body request
	replyRequest := web.CreateCommentRequest{}
	helper.ReadFromRequestBody(request, &replyRequest)

	// Ambil comment_id dari URL params
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	// Ambil user_id dari context (set by JWT middleware)
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Panggil service untuk membalas komentar
	fmt.Printf("Replying to comment %s by user %s\n", commentId, userId)
	replyResponse := controller.CommentService.Reply(request.Context(), commentId, userId, replyRequest)

	// Buat response
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   replyResponse,
	}

	// Kirim response
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentControllerImpl) GetReplies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil comment_id dari URL params
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	// Parse query params untuk pagination
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

	// Panggil service untuk mendapatkan balasan komentar
	repliesResponse := controller.CommentService.GetReplies(request.Context(), commentId, limit, offset)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   repliesResponse,
	}

	// Kirim response
	helper.WriteToResponseBody(writer, webResponse)
}
