package controller

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type CompanySubmissionController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByUserId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Review(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
