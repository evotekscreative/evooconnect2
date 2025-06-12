package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type JobVacancyController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindMyJobVacancies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindPublicJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	IncrementView(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCompanyStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
