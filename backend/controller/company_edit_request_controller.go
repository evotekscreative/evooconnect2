package controller

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type CompanyManagementController interface {
	GetAllCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetMyCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCompanyDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RequestEdit(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetMyEditRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	DeleteCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	DeleteCompanyEditRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetRandomCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCompanyStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
