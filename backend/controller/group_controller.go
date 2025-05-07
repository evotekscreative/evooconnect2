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
	UploadPhoto(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Member management
	AddMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RemoveMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateMemberRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMembers(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	LeaveGroup(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Invitation management
	CreateInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	AcceptInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RejectInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMyInvitations(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
