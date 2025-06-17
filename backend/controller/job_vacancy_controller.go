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
	FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByCreatorId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindActiveJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	SearchJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetPublicJobDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
