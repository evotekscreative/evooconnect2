package controller

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type AdminCompanyEditController interface {
	GetAllEditRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetEditRequestsByStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetEditRequestDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	ReviewEditRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetEditRequestStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
