package controller

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type CompanyPostCommentController interface {
	CreateComment(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CreateReply(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CreateSubReply(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCommentsByPostId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetRepliesByParentId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
