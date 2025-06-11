package controller

import (
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"fmt"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	"mime/multipart"
	"net/http"
	"strconv"
)

type GroupControllerImpl struct {
	GroupService service.GroupService
	PostService  service.PostService
	
}

func NewGroupController(groupService service.GroupService, postService service.PostService) GroupController {
	return &GroupControllerImpl{
		GroupService: groupService,
		PostService:  postService,
	}
}

func (controller *GroupControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	err := helper.ParseMultipartForm(request, 10) // 10 MB limit
	helper.PanicIfError(err)

	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse request body
	createRequest := web.CreateGroupRequest{}
	helper.ReadFromMultipartForm(request, &createRequest)

	// Handle image uploads
	var file *multipart.FileHeader = nil

	form := request.MultipartForm
	files := form.File["photo"]
	if len(files) > 0 {
		file = files[0]
	}

	// Create group
	groupResponse := controller.GroupService.Create(request.Context(), userId, createRequest, file)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   groupResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	err := helper.ParseMultipartForm(request, 10) // 10 MB limit
	helper.PanicIfError(err)

	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse request body
	updateRequest := web.UpdateGroupRequest{}
	helper.ReadFromMultipartForm(request, &updateRequest)

	var file *multipart.FileHeader = nil

	form := request.MultipartForm
	files := form.File["image"]
	if len(files) > 0 {
		file = files[0]
	}

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Update group
	groupResponse := controller.GroupService.Update(request.Context(), groupId, userId, updateRequest, file)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   groupResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}
func (controller *GroupControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Delete group
	controller.GroupService.Delete(request.Context(), groupId, userId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Get group by ID
	groupResponse := controller.GroupService.FindById(request.Context(), groupId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   groupResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse pagination params
	limit := 10
	offset := 0

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		limit, _ = strconv.Atoi(limitParam)
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		offset, _ = strconv.Atoi(offsetParam)
	}

	// Get all groups
	groupResponses := controller.GroupService.FindAll(request.Context(), limit, offset)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   groupResponses,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindMyGroups(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Get user's groups
	groupResponses := controller.GroupService.FindMyGroups(request.Context(), userId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   groupResponses,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) CreatePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Parse form for file uploads
	err = request.ParseMultipartForm(10 << 20) // 10MB max
	helper.PanicIfError(err)

	// Get post content from form
	createRequest := web.CreatePostRequest{}
	helper.ReadFromMultipartForm(request, &createRequest)
	createRequest.Visibility = "group" // Set default visibility

	// Get files
	form := request.MultipartForm
	files := form.File["images"]

	// Create post in group
	postResponse := controller.PostService.CreateGroupPost(request.Context(), groupId, userId, createRequest, files)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   postResponse,
	}
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) GetGroupPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    userId, err := helper.GetUserIdFromToken(request)
    helper.PanicIfError(err)

    // Parse group ID from URL
    groupId, err := uuid.Parse(params.ByName("groupId"))
    helper.PanicIfError(err)
    
    fmt.Printf("DEBUG: Getting posts for group %s by user %s\n", groupId, userId)

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

    // Get posts for group
    posts := controller.PostService.FindByGroupId(request.Context(), groupId, userId, limit, offset)
    
    fmt.Printf("DEBUG: Found %d posts for group %s\n", len(posts), groupId)

    // Send response
    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data:   posts,
    }
    helper.WriteToResponseBody(writer, webResponse)
}
func (controller *GroupControllerImpl) AddMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Parse member ID from URL
	newMemberId, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)

	// Add member
	memberResponse := controller.GroupService.AddMember(request.Context(), groupId, userId, newMemberId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) RemoveMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Parse member ID from URL
	memberId, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)

	// Parse request body untuk mendapatkan block dan reason
	var requestBody web.RemoveMemberRequest
	err = json.NewDecoder(request.Body).Decode(&requestBody)
	if err != nil {
		// Jika body kosong, gunakan default values
		requestBody.Block = false
		requestBody.Reason = ""
	}

	// Remove member with block option
	controller.GroupService.RemoveMemberWithBlock(request.Context(), groupId, userId, memberId, requestBody.Block, requestBody.Reason)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) UpdateMemberRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse request body
	var requestBody struct {
		Role string `json:"role"`
	}
	err = json.NewDecoder(request.Body).Decode(&requestBody)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Parse member ID from URL
	memberId, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)

	// Update member role
	memberResponse := controller.GroupService.UpdateMemberRole(request.Context(), groupId, userId, memberId, requestBody.Role)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindMembers(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Get members
	memberResponses := controller.GroupService.GetMembers(request.Context(), groupId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberResponses,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) LeaveGroup(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL params
	groupId, err := uuid.Parse(params.ByName("groupId"))
	if err != nil {
		panic(exception.NewBadRequestError("invalid group ID format"))
	}

	// Call service to leave the group
	response := controller.GroupService.LeaveGroup(request.Context(), groupId, userId)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) JoinGroup(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (set by JWT middleware)
	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("unauthorized access"))
	}

	// Parse user ID
	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("invalid user ID format"))
	}

	// Parse group ID from URL params
	groupId, err := uuid.Parse(params.ByName("groupId"))
	if err != nil {
		panic(exception.NewBadRequestError("invalid group ID format"))
	}

	fmt.Printf("DEBUG Controller: Joining group %s with user %s\n", groupId, userId)

	// Perbaiki urutan parameter: userId dulu, baru groupId
	response := controller.GroupService.JoinPublicGroup(request.Context(), userId, groupId)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) CreateInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Parse invitee ID from URL
	inviteeId, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)

	// Create invitation
	invitationResponse := controller.GroupService.CreateInvitation(request.Context(), groupId, userId, inviteeId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   invitationResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) AcceptInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse invitation ID from URL
	invitationId, err := uuid.Parse(params.ByName("invitationId"))
	helper.PanicIfError(err)

	// Accept invitation
	memberResponse := controller.GroupService.AcceptInvitation(request.Context(), invitationId, userId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) RejectInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse invitation ID from URL
	invitationId, err := uuid.Parse(params.ByName("invitationId"))
	helper.PanicIfError(err)

	// Reject invitation
	controller.GroupService.RejectInvitation(request.Context(), invitationId, userId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindMyInvitations(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Get user's invitations
	invitationResponses := controller.GroupService.GetMyInvitations(request.Context(), userId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   invitationResponses,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) CancelInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse invitation ID from URL
	invitationId, err := uuid.Parse(params.ByName("invitationId"))
	if err != nil {
		panic(exception.NewBadRequestError("invalid invitation ID format"))
	}

	// Cancel invitation
	controller.GroupService.CancelInvitation(request.Context(), invitationId, userId)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// Tambahkan di controller/group_controller_impl.go

func (controller *GroupControllerImpl) GetPendingPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Get user ID from token
    userId, err := helper.GetUserIdFromToken(request)
    helper.PanicIfError(err)
    
    // Parse group ID from URL
    groupId, err := uuid.Parse(params.ByName("groupId"))
    helper.PanicIfError(err)
    
    // Parse pagination params
    limit := 10
    offset := 0
    
    limitParam := request.URL.Query().Get("limit")
    if limitParam != "" {
        limit, _ = strconv.Atoi(limitParam)
    }
    
    offsetParam := request.URL.Query().Get("offset")
    if offsetParam != "" {
        offset, _ = strconv.Atoi(offsetParam)
    }
    
    // Get pending posts
    pendingPosts := controller.PostService.FindPendingPostsByGroupId(request.Context(), groupId, userId, limit, offset)
    
    // Send response
    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data:   pendingPosts,
    }
    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) ApprovePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    postIdStr := params.ByName("postId")
    postId, err := uuid.Parse(postIdStr)
    if err != nil {
        panic(exception.NewBadRequestError("Invalid post ID"))
    }

    userId := request.Context().Value("user_id").(string)
    userUUID, _ := uuid.Parse(userId)

    postResponse := controller.PostService.ApprovePost(request.Context(), postId, userUUID)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   postResponse,
    }

    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) RejectPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    postIdStr := params.ByName("postId")
    postId, err := uuid.Parse(postIdStr)
    if err != nil {
        panic(exception.NewBadRequestError("Invalid post ID"))
    }

    userId := request.Context().Value("user_id").(string)
    userUUID, _ := uuid.Parse(userId)

    controller.PostService.RejectPost(request.Context(), postId, userUUID)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   "Post rejected successfully",
    }

    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) CreateJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    groupId := params.ByName("groupId")
    groupUUID, err := uuid.Parse(groupId)
    if err != nil {
        panic(exception.NewBadRequestError("Invalid group ID"))
    }

    // Ini bagian yang bermasalah - kita perlu menangani kasus body kosong
    createRequest := web.CreateJoinRequestRequest{}
    err = helper.ReadFromRequestBody(request, &createRequest)
    if err != nil {
        // Tangani error dengan lebih baik
        panic(exception.NewBadRequestError("Invalid request body: " + err.Error()))
    }

    // Jika message kosong, isi dengan default
    if createRequest.Message == "" {
        createRequest.Message = "I would like to join this group."
    }

    userId := request.Context().Value("user_id").(string)
    userUUID, _ := uuid.Parse(userId)

    joinRequestResponse := controller.GroupService.CreateJoinRequest(request.Context(), userUUID, groupUUID, createRequest)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   joinRequestResponse,
    }

    helper.WriteToResponseBody(writer, webResponse)
}


func (controller *GroupControllerImpl) FindJoinRequestsByGroupId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	groupId := params.ByName("groupId")
	groupUUID, err := uuid.Parse(groupId)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid group ID"))
	}

	limit := 10
	offset := 0

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		limitInt, err := strconv.Atoi(limitParam)
		if err == nil && limitInt > 0 {
			limit = limitInt
		}
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		offsetInt, err := strconv.Atoi(offsetParam)
		if err == nil && offsetInt >= 0 {
			offset = offsetInt
		}
	}

	userId := request.Context().Value("user_id").(string)
	userUUID, _ := uuid.Parse(userId)

	joinRequests := controller.GroupService.FindJoinRequestsByGroupId(request.Context(), groupUUID, userUUID, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   joinRequests,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) AcceptJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	requestId := params.ByName("requestId")
	requestUUID, err := uuid.Parse(requestId)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid request ID"))
	}

	userId := request.Context().Value("user_id").(string)
	userUUID, _ := uuid.Parse(userId)

	joinRequestResponse := controller.GroupService.AcceptJoinRequest(request.Context(), requestUUID, userUUID)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   joinRequestResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) RejectJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	requestId := params.ByName("requestId")
	requestUUID, err := uuid.Parse(requestId)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid request ID"))
	}

	userId := request.Context().Value("user_id").(string)
	userUUID, _ := uuid.Parse(userId)

	controller.GroupService.RejectJoinRequest(request.Context(), requestUUID, userUUID)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Join request rejected successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) CancelJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    requestId := params.ByName("requestId")
    requestUUID, err := uuid.Parse(requestId)
    if err != nil {
        panic(exception.NewBadRequestError("Invalid request ID"))
    }

    userId := request.Context().Value("user_id").(string)
    userUUID, _ := uuid.Parse(userId)

    controller.GroupService.CancelJoinRequest(request.Context(), requestUUID, userUUID)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   "Join request cancelled successfully",
    }

    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindMyJoinedGroups(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Get user ID from token
    userId, err := helper.GetUserIdFromToken(request)
    helper.PanicIfError(err)

    // Get user's joined groups
    groupResponses := controller.GroupService.FindMyJoinedGroups(request.Context(), userId)

    // Send response
    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data:   groupResponses,
    }
    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) FindMyJoinRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Ambil user_id dari context yang diset oleh middleware
	userIdStr, ok := request.Context().Value("user_id").(string)
	if !ok {
		webResponse := web.APIResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Error:  "Unauthorized access",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		webResponse := web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid user ID",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Ambil parameter limit dan offset dari query string
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // Default limit
	offset := 0 // Default offset

	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit < 1 {
			limit = 10
		}
	}

	if offsetStr != "" {
		offset, err = strconv.Atoi(offsetStr)
		if err != nil || offset < 0 {
			offset = 0
		}
	}

	// Dapatkan daftar join requests yang dibuat oleh user
	joinRequests := controller.GroupService.FindMyJoinRequests(request.Context(), userId, limit, offset)

	webResponse := web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   joinRequests,
	}

	helper.WriteToResponseBody(writer, webResponse)
}