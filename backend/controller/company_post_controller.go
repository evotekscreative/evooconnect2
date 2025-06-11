package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type CompanyPostController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByCreatorId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Like functionality - following same pattern as PostController
	LikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UnlikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
