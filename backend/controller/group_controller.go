package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type GroupController interface {
	// Group CRUD
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMyGroups(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Group post management
	CreatePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetGroupPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Member management
	AddMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RemoveMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateMemberRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMembers(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	LeaveGroup(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	JoinGroup(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Invitation management
	CreateInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	AcceptInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RejectInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMyInvitations(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CancelInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	CreateJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    FindJoinRequestsByGroupId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    AcceptJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    RejectJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	GetPendingPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	ApprovePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RejectPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	 CancelJoinRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
