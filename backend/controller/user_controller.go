package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type UserController interface {
	GetProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetByUsername(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UploadPhotoProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetPeoples(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
