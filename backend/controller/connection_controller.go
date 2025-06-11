package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type ConnectionController interface {
	SendConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetConnectionRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	AcceptConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RejectConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetConnections(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Disconnect(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CancelConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CountRequestInvitation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
