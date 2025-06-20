package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type UserCvStorageController interface {
	UploadCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetUserCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	DeleteCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	DownloadCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
