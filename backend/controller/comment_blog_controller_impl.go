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

type CommentBlogControllerImpl struct {
	CommentBlogService service.CommentBlogService
}

func NewCommentBlogController(commentBlogService service.CommentBlogService) CommentBlogController {
	return &CommentBlogControllerImpl{
		CommentBlogService: commentBlogService,
	}
}

func (controller *CommentBlogControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	createRequest := web.CreateCommentBlogRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	blogId, err := uuid.Parse(params.ByName("blogId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid blog ID format"))
	}

	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	commentResponse := controller.CommentBlogService.Create(request.Context(), blogId, userId, createRequest)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   commentResponse,
	}

	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentBlogControllerImpl) GetByBlogId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	blogId, err := uuid.Parse(params.ByName("blogId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid blog ID format"))
	}

	limit := 10
	offset := 0

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

	commentResponses := controller.CommentBlogService.GetByBlogId(request.Context(), blogId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   commentResponses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentBlogControllerImpl) GetById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	commentResponse := controller.CommentBlogService.GetById(request.Context(), commentId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   commentResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentBlogControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	updateRequest := web.CreateCommentBlogRequest{}
	helper.ReadFromRequestBody(request, &updateRequest)

	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	commentResponse := controller.CommentBlogService.Update(request.Context(), commentId, userId, updateRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   commentResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentBlogControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	controller.CommentBlogService.Delete(request.Context(), commentId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Comment deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentBlogControllerImpl) Reply(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	replyRequest := web.CreateCommentBlogRequest{}
	helper.ReadFromRequestBody(request, &replyRequest)

	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	fmt.Printf("Replying to comment %s by user %s\n", commentId, userId)
	replyResponse := controller.CommentBlogService.Reply(request.Context(), commentId, userId, replyRequest)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   replyResponse,
	}

	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CommentBlogControllerImpl) GetReplies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	commentId, err := uuid.Parse(params.ByName("commentId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid comment ID format"))
	}

	limit := 10
	offset := 0

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

	repliesResponse := controller.CommentBlogService.GetReplies(request.Context(), commentId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   repliesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}