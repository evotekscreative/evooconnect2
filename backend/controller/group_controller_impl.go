package controller

import (
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
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
	err := helper.ParseMultipartForm(request, 10) // 10 MB limit
	helper.PanicIfError(err)

	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse request body
	createRequest := web.CreateGroupRequest{}
	helper.ReadFromMultipartForm(request, &createRequest)

	// Handle image uploads
	form := request.MultipartForm
	file := form.File["photo"][0]

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

	// Call service to join the group
	response := controller.GroupService.JoinPublicGroup(request.Context(), groupId, userId)

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
