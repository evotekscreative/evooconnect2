package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type JobApplicationController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByJobVacancy(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByApplicant(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	ReviewApplication(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CheckApplicationStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
