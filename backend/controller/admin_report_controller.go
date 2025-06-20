package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)


type AdminReportController interface {
	GetAllReports(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetReportDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	TakeAction(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}