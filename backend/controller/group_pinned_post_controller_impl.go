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

type GroupPinnedPostControllerImpl struct {
    GroupPinnedPostService service.GroupPinnedPostService
}

func NewGroupPinnedPostController(groupPinnedPostService service.GroupPinnedPostService) GroupPinnedPostController {
    return &GroupPinnedPostControllerImpl{
        GroupPinnedPostService: groupPinnedPostService,
    }
}

func (controller *GroupPinnedPostControllerImpl) PinPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Ambil post_id dari URL params
    postId, err := uuid.Parse(params.ByName("postId"))
    if err != nil {
        panic(exception.NewBadRequestError("Invalid post ID format"))
    }

    // Ambil user_id dari token JWT
    userId, err := helper.GetUserIdFromToken(request)
    helper.PanicIfError(err)

    // Panggil service untuk menyematkan post
    postResponse := controller.GroupPinnedPostService.PinPost(request.Context(), postId, userId)

    // Buat response
    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   postResponse,
    }

    // Kirim response
    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupPinnedPostControllerImpl) UnpinPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Ambil post_id dari URL params
    postId, err := uuid.Parse(params.ByName("postId"))
    if err != nil {
        panic(exception.NewBadRequestError("Invalid post ID format"))
    }

    // Ambil user_id dari token JWT
    userId, err := helper.GetUserIdFromToken(request)
    helper.PanicIfError(err)

    // Panggil service untuk melepas pin post
    postResponse := controller.GroupPinnedPostService.UnpinPost(request.Context(), postId, userId)

    // Buat response
    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   postResponse,
    }

    // Kirim response
    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupPinnedPostControllerImpl) GetPinnedPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Ambil group_id dari URL params
    groupId, err := uuid.Parse(params.ByName("groupId"))
    if err != nil {
        panic(exception.NewBadRequestError("Invalid group ID format"))
    }

    // Panggil service untuk mendapatkan post yang di-pin
    postResponses := controller.GroupPinnedPostService.GetPinnedPosts(request.Context(), groupId)

    // Buat response
    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   postResponses,
    }

    // Kirim response
    helper.WriteToResponseBody(writer, webResponse)
}