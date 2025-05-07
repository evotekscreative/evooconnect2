package controller

import (
	"encoding/json"
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

type GroupControllerImpl struct {
	GroupService service.GroupService
}

func NewGroupController(groupService service.GroupService) GroupController {
	return &GroupControllerImpl{
		GroupService: groupService,
	}
}

func (controller *GroupControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse request body
	createRequest := web.CreateGroupRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Create group
	groupResponse := controller.GroupService.Create(request.Context(), userId, createRequest)

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   groupResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) UploadPhoto(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse user_id
	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Parse group_id from URL params
	groupId, err := uuid.Parse(params.ByName("groupId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid group ID format"))
	}

	// Call service to upload file
	filePath := controller.GroupService.UploadPhoto(request.Context(), groupId, userId, file, handler)

	// Create response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data: map[string]string{
			"photo": filePath,
		},
	}

	// Write response
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *GroupControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse request body
	updateRequest := web.UpdateGroupRequest{}
	helper.ReadFromRequestBody(request, &updateRequest)

	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse group ID from URL
	groupId, err := uuid.Parse(params.ByName("groupId"))
	helper.PanicIfError(err)

	// Update group
	groupResponse := controller.GroupService.Update(request.Context(), groupId, userId, updateRequest)

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

	// Remove member
	controller.GroupService.RemoveMember(request.Context(), groupId, userId, memberId)

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

// File: controller/group_controller_impl.go

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
