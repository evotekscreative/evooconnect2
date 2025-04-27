package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type PostController interface {
	Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindByUserId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	LikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UnlikePost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UploadImages(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
