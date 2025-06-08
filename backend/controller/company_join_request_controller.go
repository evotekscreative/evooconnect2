package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type CompanyJoinRequestController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMyRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Review(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Cancel(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetPendingCount(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
