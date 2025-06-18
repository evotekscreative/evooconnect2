package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type CommentBlogController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetByBlogId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Reply(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetReplies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}